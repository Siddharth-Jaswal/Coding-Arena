const { redisClient } = require('../../redis/client');

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
            const multi = redisClient.multi();
            multi.sadd(ONLINE_SET_KEY, userId);
            multi.sadd(`${USER_SOCKETS_PREFIX}${userId}`, socketId);
            
            const userData = {
                userId,
                username: metadata.username || 'Player',
                rating: metadata.rating ?? 1500,
                avatar: metadata.avatar || '',
                status: 'online', // 'online' | 'in_lobby' | 'in_match'
                lobbyId: '',
                lastSeen: new Date().toISOString()
            };

            multi.set(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(userData), 'EX', 86400);
            await multi.exec();
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
            const remainingCount = await redisClient.scard(`${USER_SOCKETS_PREFIX}${userId}`);

            if (remainingCount === 0) {
                // Remove from online set and clean up key
                await redisClient.srem(ONLINE_SET_KEY, userId);
                await redisClient.del(`${USER_KEY_PREFIX}${userId}`);
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
            if (raw) {
                const data = JSON.parse(raw);
                data.status = status;
                data.lobbyId = lobbyId || '';
                data.lastSeen = new Date().toISOString();
                await redisClient.set(`${USER_KEY_PREFIX}${userId}`, JSON.stringify(data), 'EX', 86400);
            }
        } catch (err) {
            console.error('Error updating presence status:', err);
        }
    }

    /**
     * Get presence information for a list of friend IDs
     */
    async getPresenceForUsers(userIds = []) {
        if (!userIds.length) return {};

        try {
            const presenceMap = {};
            const pipeline = redisClient.pipeline();

            userIds.forEach(id => {
                pipeline.get(`${USER_KEY_PREFIX}${id}`);
            });

            const results = await pipeline.exec();
            
            results.forEach(([err, rawData], idx) => {
                const targetId = userIds[idx];
                if (!err && rawData) {
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
            });

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
            return await redisClient.sismember(ONLINE_SET_KEY, userId) === 1;
        } catch (err) {
            console.error('Error checking user online status:', err);
            return false;
        }
    }
}

module.exports = new PresenceService();
