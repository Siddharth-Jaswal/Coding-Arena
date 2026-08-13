const { redisClient } = require('../../redis/client');
const roomService = require('../rooms/room.service');

const QUEUE_KEY = 'matchmaking:queue';
const QUEUED_USERS_SET = 'matchmaking:queued_users';

class MatchmakingService {
    /**
     * Joins the matchmaking queue.
     */
    async joinQueue(userId, socketId, rating, attemptId) {
        // Prevent duplicate joins
        const isQueued = await redisClient.sismember(QUEUED_USERS_SET, userId);
        if (isQueued) {
            throw new Error('Already in queue');
        }

        // Add to queue list and set
        const multi = redisClient.multi();
        multi.rpush(QUEUE_KEY, userId);
        multi.sadd(QUEUED_USERS_SET, userId);
        
        // Save player metadata for matchmaking
        multi.set(`matchmaking:player:${userId}`, JSON.stringify({
            socketId,
            joinedAt: new Date().toISOString(),
            rating,
            attemptId
        }), 'EX', 3600); // expire in 1 hour if stuck

        await multi.exec();
    }

    /**
     * Leaves the matchmaking queue.
     */
    async leaveQueue(userId) {
        const isQueued = await redisClient.sismember(QUEUED_USERS_SET, userId);
        if (!isQueued) return;

        const multi = redisClient.multi();
        multi.lrem(QUEUE_KEY, 0, userId);
        multi.srem(QUEUED_USERS_SET, userId);
        multi.del(`matchmaking:player:${userId}`);
        
        await multi.exec();
    }

    /**
     * Attempts to find a match if enough players are in the queue.
     */
    async attemptMatch(io) {
        // Lockless basic approach for now: pop 2
        // For a distributed environment with high concurrency, a Redlock or Lua script is better,
        // but simple LPOP is atomic. We'll pop 2 sequentially.
        
        const queueLength = await redisClient.llen(QUEUE_KEY);
        if (queueLength < 2) return;

        // Atomic pop of 2 elements (Redis 6.2+ supports count with LPOP)
        // If your redis doesn't support LPOP with count, we can do multi
        const players = await redisClient.lpop(QUEUE_KEY, 2);
        
        if (!players || players.length < 2) {
            // Re-queue if we popped 1 and the other disappeared
            if (players && players.length === 1) {
                await redisClient.lpush(QUEUE_KEY, players[0]);
            }
            return;
        }

        const [player1Id, player2Id] = players;

        // Remove from set
        await redisClient.srem(QUEUED_USERS_SET, player1Id, player2Id);
        
        // Delete metadata but keep it in memory for room creation
        const p1MetaStr = await redisClient.get(`matchmaking:player:${player1Id}`);
        const p2MetaStr = await redisClient.get(`matchmaking:player:${player2Id}`);
        await redisClient.del(`matchmaking:player:${player1Id}`, `matchmaking:player:${player2Id}`);
        
        const p1Meta = p1MetaStr ? JSON.parse(p1MetaStr) : { rating: 1500 };
        const p2Meta = p2MetaStr ? JSON.parse(p2MetaStr) : { rating: 1500 };

        try {
            await roomService.createRoom(io, { id: player1Id, ...p1Meta }, { id: player2Id, ...p2Meta });
        } catch (error) {
            console.error('Matchmaking room creation failed, re-queueing players:', error);
            await this.joinQueue(player1Id, p1Meta.socketId, p1Meta.rating, p1Meta.attemptId);
            await this.joinQueue(player2Id, p2Meta.socketId, p2Meta.rating, p2Meta.attemptId);
        }
    }

    async getQueueStatus() {
        const queueLength = await redisClient.llen(QUEUE_KEY);
        return { queueLength };
    }
}

module.exports = new MatchmakingService();
