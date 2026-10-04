const { redisClient } = require('../../redis/client');
const roomService = require('../rooms/room.service');

const QUEUE_KEY = 'matchmaking:queue';
const QUEUED_USERS_SET = 'matchmaking:queued_users';

class MatchmakingService {
    getQueueKey(mode = 'ranked') {
        const normalized = mode === 'toss' ? 'toss' : 'ranked';
        return `matchmaking:queue:${normalized}`;
    }

    /**
     * Joins the matchmaking queue.
     */
    async joinQueue(userId, socketId, rating, attemptId, mode = 'ranked') {
        // Prevent duplicate joins
        const isQueued = await redisClient.sismember(QUEUED_USERS_SET, userId);
        if (isQueued) {
            throw new Error('Already in queue');
        }

        const validMode = mode === 'toss' ? 'toss' : 'ranked';
        const queueKey = this.getQueueKey(validMode);

        // Add to queue list and set
        const multi = redisClient.multi();
        multi.rpush(queueKey, userId);
        multi.sadd(QUEUED_USERS_SET, userId);
        
        // Save player metadata for matchmaking
        multi.set(`matchmaking:player:${userId}`, JSON.stringify({
            socketId,
            joinedAt: new Date().toISOString(),
            rating,
            attemptId,
            mode: validMode
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
        multi.lrem('matchmaking:queue:ranked', 0, userId);
        multi.lrem('matchmaking:queue:toss', 0, userId);
        multi.lrem('matchmaking:queue', 0, userId);
        multi.srem(QUEUED_USERS_SET, userId);
        multi.del(`matchmaking:player:${userId}`);
        
        await multi.exec();
    }

    /**
     * Attempts to find a match if enough players are in the queue.
     */
    async attemptMatch(io) {
        const modes = ['ranked', 'toss'];

        for (const mode of modes) {
            const queueKey = this.getQueueKey(mode);
            const queueLength = await redisClient.llen(queueKey);
            if (queueLength < 2) continue;

            const players = await redisClient.lpop(queueKey, 2);
            if (!players || players.length < 2) {
                if (players && players.length === 1) {
                    await redisClient.lpush(queueKey, players[0]);
                }
                continue;
            }

            const [player1Id, player2Id] = players;

            // Remove from set
            await redisClient.srem(QUEUED_USERS_SET, player1Id, player2Id);
            
            // Delete metadata but keep in memory for room creation
            const p1MetaStr = await redisClient.get(`matchmaking:player:${player1Id}`);
            const p2MetaStr = await redisClient.get(`matchmaking:player:${player2Id}`);
            await redisClient.del(`matchmaking:player:${player1Id}`, `matchmaking:player:${player2Id}`);
            
            const p1Meta = p1MetaStr ? JSON.parse(p1MetaStr) : { rating: 1500, mode };
            const p2Meta = p2MetaStr ? JSON.parse(p2MetaStr) : { rating: 1500, mode };

            try {
                await roomService.createRoom(io, { id: player1Id, ...p1Meta }, { id: player2Id, ...p2Meta }, mode);
            } catch (error) {
                console.error(`Matchmaking room creation failed for mode ${mode}, re-queueing players:`, error);
                await this.joinQueue(player1Id, p1Meta.socketId, p1Meta.rating, p1Meta.attemptId, mode);
                await this.joinQueue(player2Id, p2Meta.socketId, p2Meta.rating, p2Meta.attemptId, mode);
            }
        }
    }

    async getQueueStatus(mode = 'ranked') {
        const queueKey = this.getQueueKey(mode);
        const queueLength = await redisClient.llen(queueKey);
        return { queueLength, mode };
    }
}

module.exports = new MatchmakingService();
