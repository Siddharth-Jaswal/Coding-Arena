const { redisClient } = require('../../redis/client');
const prisma = require('../../config/prisma');

const ONLINE_SET_KEY = 'presence:online_users';
const USER_KEY_PREFIX = 'presence:user:';
const USER_SOCKETS_PREFIX = 'presence:sockets:';

class PresenceService {
    /**
     * Mark a user as online when a socket connects
     */
    async markOnline(userId, socketId, metadata = {}) {
        if (!userId) return;

        try {
            // Check if user already had active state in Redis (e.g. page refresh during a match/lobby)
            let currentStatus = 'online';
            let currentLobbyId = '';
            const existingRaw = await redisClient.get(`${USER_KEY_PREFIX}${userId}`);
            if (existingRaw) {
                try {
                    const parsed = JSON.parse(existingRaw);
                    if (parsed.status && parsed.status !== 'offline') {
                        currentStatus = parsed.status;
                        currentLobbyId = parsed.lobbyId || '';
                    }
                } catch (e) {}
            }

            const multi = redisClient.multi();
            multi.sadd(ONLINE_SET_KEY, userId);
            multi.sadd(`${USER_SOCKETS_PREFIX}${userId}`, socketId);
            
            const lastSeen = new Date().toISOString();
            const userData = {
                userId,
                username: metadata.username || 'Player',
                rating: metadata.rating ?? 1500,
                avatar: metadata.avatar || '',
                status: currentStatus, // Preserve 'in_lobby' or 'in_match' if reconnecting
                lobbyId: currentLobbyId,
                lastSeen
            };

            multi.set(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(userData), 'EX', 86400);
            await multi.exec();

            // Broadcast real-time presence change to friends
            this.notifyFriends(userId, {
                isOnline: true,
                status: currentStatus,
                lobbyId: currentLobbyId || null,
                lastSeen
            }).catch(e => console.error('Error notifying friends of online presence:', e));
        } catch (err) {
            console.error('Error marking user online in Redis:', err);
        }
    }

    /**
     * Handle socket disconnect. If no sockets remain for this user, mark offline.
     */
    async markOffline(userId, socketId) {
        if (!userId) return;

        try {
            await redisClient.srem(`${USER_SOCKETS_PREFIX}${userId}`, socketId);

            let remainingCount = 0;
            try {
                const { getIo } = require('../../socket');
                const io = getIo();
                if (io) {
                    const sockets = await io.in(`user:${userId}`).fetchSockets();
                    remainingCount = sockets.length;

                    // Re-sync Redis socket set so zombie socket IDs never accumulate
                    if (remainingCount > 0) {
                        const activeSocketIds = sockets.map(s => s.id);
                        await redisClient.del(`${USER_SOCKETS_PREFIX}${userId}`);
                        await redisClient.sadd(`${USER_SOCKETS_PREFIX}${userId}`, ...activeSocketIds);
                    }
                } else {
                    remainingCount = await redisClient.scard(`${USER_SOCKETS_PREFIX}${userId}`);
                }
            } catch (e) {
                remainingCount = await redisClient.scard(`${USER_SOCKETS_PREFIX}${userId}`);
            }

            if (remainingCount === 0) {
                const lastSeen = new Date().toISOString();

                // Remove from online set and clean up keys
                await Promise.all([
                    redisClient.srem(ONLINE_SET_KEY, userId),
                    redisClient.del(`${USER_KEY_PREFIX}${userId}`),
                    redisClient.del(`${USER_SOCKETS_PREFIX}${userId}`)
                ]);

                // Broadcast offline presence change to friends
                this.notifyFriends(userId, {
                    isOnline: false,
                    status: 'offline',
                    lobbyId: null,
                    lastSeen
                }).catch(e => console.error('Error notifying friends of offline presence:', e));
            }
        } catch (err) {
            console.error('Error marking user offline in Redis:', err);
        }
    }

    /**
     * Update user activity status (e.g. 'in_lobby', 'in_match', 'online')
     */
    async updateStatus(userId, status, lobbyId = '') {
        if (!userId) return;

        try {
            const raw = await redisClient.get(`${USER_KEY_PREFIX}${userId}`);
            let lastSeen = new Date().toISOString();
            if (raw) {
                const data = JSON.parse(raw);
                data.status = status;
                data.lobbyId = lobbyId || '';
                data.lastSeen = lastSeen;
                await redisClient.set(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(data), 'EX', 86400);
            }

            // Broadcast status change to friends
            this.notifyFriends(userId, {
                isOnline: status !== 'offline',
                status,
                lobbyId: lobbyId || null,
                lastSeen
            }).catch(e => console.error('Error notifying friends of status update:', e));
        } catch (err) {
            console.error('Error updating presence status:', err);
        }
    }

    /**
     * Get presence information for a list of friend IDs
     * Ensures online status is strictly correlated with ONLINE_SET_KEY membership.
     */
    async getPresenceForUsers(userIds = []) {
        if (!userIds.length) return {};

        try {
            const presenceMap = {};
            const pipeline = redisClient.pipeline();

            userIds.forEach(id => {
                pipeline.sismember(ONLINE_SET_KEY, id);
                pipeline.get(`${USER_KEY_PREFIX}${id}`);
            });

            const results = await pipeline.exec();
            
            for (let i = 0; i < userIds.length; i++) {
                const targetId = userIds[i];
                const [memErr, isMember] = results[i * 2] || [];
                const [getErr, rawData] = results[i * 2 + 1] || [];

                if (!memErr && isMember === 1 && !getErr && rawData) {
                    try {
                        const parsed = JSON.parse(rawData);
                        presenceMap[targetId] = {
                            isOnline: true,
                            status: parsed.status || 'online',
                            lobbyId: parsed.lobbyId || null,
                            lastSeen: parsed.lastSeen
                        };
                    } catch (e) {
                        presenceMap[targetId] = { isOnline: false, status: 'offline' };
                    }
                } else {
                    presenceMap[targetId] = { isOnline: false, status: 'offline' };
                }
            }

            return presenceMap;
        } catch (err) {
            console.error('Error fetching users presence:', err);
            return {};
        }
    }

    /**
     * Check if a specific user is currently online
     */
    async isUserOnline(userId) {
        if (!userId) return false;
        try {
            return (await redisClient.sismember(ONLINE_SET_KEY, userId)) === 1;
        } catch (err) {
            console.error('Error checking user online status:', err);
            return false;
        }
    }

    /**
     * Notify accepted friends of a presence update via their personal socket rooms
     */
    async notifyFriends(userId, presenceData) {
        if (!userId) return;
        try {
            const { getIo } = require('../../socket');
            const io = getIo();
            if (!io) return;

            const { SERVER_EVENTS } = require('../../socket/events');

            const friendships = await prisma.friendship.findMany({
                where: {
                    OR: [
                        { requesterId: userId, status: 'ACCEPTED' },
                        { receiverId: userId, status: 'ACCEPTED' }
                    ]
                },
                select: { requesterId: true, receiverId: true }
            });

            const friendIds = friendships.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);

            friendIds.forEach(friendId => {
                io.to(`user:${friendId}`).emit(SERVER_EVENTS.FRIEND_PRESENCE_UPDATED, {
                    userId,
                    presence: presenceData
                });
            });
        } catch (err) {
            // Silently handle if socket or DB isn't available
        }
    }

    /**
     * Clean up all stale presence records upon server startup
     */
    async cleanupAllPresence() {
        try {
            const userIds = await redisClient.smembers(ONLINE_SET_KEY);
            const pipeline = redisClient.pipeline();
            pipeline.del(ONLINE_SET_KEY);
            userIds.forEach(id => {
                pipeline.del(`${USER_SOCKETS_PREFIX}${id}`);
                pipeline.del(`${USER_KEY_PREFIX}${id}`);
            });
            await pipeline.exec();
            console.log(`[Presence] Flushed stale presence records (${userIds.length} users).`);
        } catch (err) {
            console.error('[Presence] Error cleaning stale presence on startup:', err);
        }
    }
}

module.exports = new PresenceService();
