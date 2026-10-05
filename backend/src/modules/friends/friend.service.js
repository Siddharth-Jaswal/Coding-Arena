const prisma = require('../../config/prisma');
const presenceService = require('../presence/presence.service');

class FriendService {
    /**
     * Get all accepted friends for a user, enriched with live presence.
     */
    async getFriends(userId) {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: 'ACCEPTED' },
                    { receiverId: userId, status: 'ACCEPTED' }
                ]
            },
            include: {
                requester: {
                    select: { id: true, username: true, displayName: true, avatar: true, rating: true, maxRating: true }
                },
                receiver: {
                    select: { id: true, username: true, displayName: true, avatar: true, rating: true, maxRating: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const friendUsers = friendships.map(f => {
            const isRequester = f.requesterId === userId;
            const friend = isRequester ? f.receiver : f.requester;
            return {
                friendshipId: f.id,
                ...friend,
                friendsSince: f.updatedAt
            };
        });

        // Enrich with real-time presence from Redis
        const friendIds = friendUsers.map(u => u.id);
        const presenceMap = await presenceService.getPresenceForUsers(friendIds);

        return friendUsers.map(u => ({
            ...u,
            presence: presenceMap[u.id] || { isOnline: false, status: 'offline' }
        }));
    }

    /**
     * Get incoming and outgoing pending friend requests
     */
    async getRequests(userId) {
        const [incoming, outgoing] = await Promise.all([
            prisma.friendship.findMany({
                where: { receiverId: userId, status: 'PENDING' },
                include: {
                    requester: {
                        select: { id: true, username: true, displayName: true, avatar: true, rating: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.friendship.findMany({
                where: { requesterId: userId, status: 'PENDING' },
                include: {
                    receiver: {
                        select: { id: true, username: true, displayName: true, avatar: true, rating: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            })
        ]);

        return {
            incoming: incoming.map(r => ({
                requestId: r.id,
                user: r.requester,
                createdAt: r.createdAt
            })),
            outgoing: outgoing.map(r => ({
                requestId: r.id,
                user: r.receiver,
                createdAt: r.createdAt
            }))
        };
    }

    /**
     * Send friend request to another user
     */
    async sendRequest(requesterId, targetIdentifier) {
        // Find target user by username or ID
        const target = await prisma.user.findFirst({
            where: {
                OR: [
                    { id: targetIdentifier },
                    { username: { equals: targetIdentifier, mode: 'insensitive' } }
                ]
            },
            select: { id: true, username: true }
        });

        if (!target) {
            throw new Error('User not found');
        }

        if (target.id === requesterId) {
            throw new Error('You cannot send a friend request to yourself');
        }

        // Check if friendship or request already exists
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId, receiverId: target.id },
                    { requesterId: target.id, receiverId: requesterId }
                ]
            }
        });

        if (existing) {
            if (existing.status === 'ACCEPTED') {
                throw new Error('You are already friends with this user');
            }
            if (existing.status === 'PENDING') {
                if (existing.requesterId === requesterId) {
                    throw new Error('Friend request already sent');
                } else {
                    // Other user already sent a request, automatically accept it!
                    const accepted = await prisma.friendship.update({
                        where: { id: existing.id },
                        data: { status: 'ACCEPTED' }
                    });
                    return { success: true, message: `You and ${target.username} are now friends!`, autoAccepted: true };
                }
            }
            // If was rejected, allow re-requesting by updating
            await prisma.friendship.update({
                where: { id: existing.id },
                data: { requesterId, receiverId: target.id, status: 'PENDING' }
            });
            return { success: true, message: `Friend request sent to ${target.username}` };
        }

        await prisma.friendship.create({
            data: {
                requesterId,
                receiverId: target.id,
                status: 'PENDING'
            }
        });

        return { success: true, message: `Friend request sent to ${target.username}` };
    }

    /**
     * Respond to an incoming friend request (ACCEPT or REJECT)
     */
    async respondToRequest(userId, requestId, action) {
        const normalizedAction = (action || '').toUpperCase();
        if (!['ACCEPT', 'REJECT'].includes(normalizedAction)) {
            throw new Error('Action must be ACCEPT or REJECT');
        }

        const request = await prisma.friendship.findUnique({
            where: { id: requestId }
        });

        if (!request || request.receiverId !== userId || request.status !== 'PENDING') {
            throw new Error('Friend request not found or not eligible for response');
        }

        if (normalizedAction === 'ACCEPT') {
            const updated = await prisma.friendship.update({
                where: { id: requestId },
                data: { status: 'ACCEPTED' },
                include: {
                    requester: { select: { id: true, username: true } }
                }
            });
            return { success: true, status: 'ACCEPTED', friend: updated.requester };
        } else {
            await prisma.friendship.delete({
                where: { id: requestId }
            });
            return { success: true, status: 'REJECTED' };
        }
    }

    /**
     * Remove a friend
     */
    async removeFriend(userId, friendId) {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, receiverId: friendId },
                    { requesterId: friendId, receiverId: userId }
                ],
                status: 'ACCEPTED'
            }
        });

        if (!friendship) {
            throw new Error('Friendship not found');
        }

        await prisma.friendship.delete({
            where: { id: friendship.id }
        });

        return { success: true, message: 'Friend removed' };
    }

    /**
     * Search users by username with relationship status
     */
    async searchUsers(userId, query) {
        if (!query || query.trim().length === 0) return [];

        const cleanQuery = query.trim();

        const [users, friendships] = await Promise.all([
            prisma.user.findMany({
                where: {
                    id: { not: userId },
                    OR: [
                        { username: { contains: cleanQuery, mode: 'insensitive' } },
                        { displayName: { contains: cleanQuery, mode: 'insensitive' } }
                    ]
                },
                select: {
                    id: true,
                    username: true,
                    displayName: true,
                    avatar: true,
                    rating: true,
                    wins: true,
                    problemsSolved: true
                },
                take: 10
            }),
            prisma.friendship.findMany({
                where: {
                    OR: [
                        { requesterId: userId },
                        { receiverId: userId }
                    ]
                }
            })
        ]);

        const friendshipMap = new Map();
        friendships.forEach(f => {
            const otherId = f.requesterId === userId ? f.receiverId : f.requesterId;
            let rel = 'NONE';
            if (f.status === 'ACCEPTED') rel = 'FRIEND';
            else if (f.status === 'PENDING') {
                rel = f.requesterId === userId ? 'REQUEST_SENT' : 'REQUEST_RECEIVED';
            }
            friendshipMap.set(otherId, { rel, requestId: f.id });
        });

        // Enrich with presence
        const userIds = users.map(u => u.id);
        const presenceMap = await presenceService.getPresenceForUsers(userIds);

        return users.map(u => {
            const relationship = friendshipMap.get(u.id) || { rel: 'NONE', requestId: null };
            return {
                ...u,
                relationship: relationship.rel,
                requestId: relationship.requestId,
                presence: presenceMap[u.id] || { isOnline: false, status: 'offline' }
            };
        });
    }
}

module.exports = new FriendService();
