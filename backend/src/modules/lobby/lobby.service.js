const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../../redis/client');
const prisma = require('../../config/prisma');
const pool = require('../../config/db');
const presenceService = require('../presence/presence.service');
const roomService = require('../rooms/room.service');
const { SERVER_EVENTS } = require('../../socket/events');

const CHALLENGE_PREFIX = 'challenge:';
const LOBBY_PREFIX = 'lobby:';

class LobbyService {
    /**
     * Send a challenge to an online friend
     */
    async sendChallenge(io, challenger, targetUserId) {
        if (!challenger?.id || !targetUserId) {
            throw new Error('Challenger and target user ID are required');
        }

        if (challenger.id === targetUserId) {
            throw new Error('You cannot challenge yourself');
        }

        // Check target online status
        const isOnline = await presenceService.isUserOnline(targetUserId);
        if (!isOnline) {
            throw new Error('Friend is currently offline');
        }

        // Check if target is busy
        const presenceMap = await presenceService.getPresenceForUsers([targetUserId]);
        const targetPresence = presenceMap[targetUserId];
        if (targetPresence?.status === 'in_match') {
            throw new Error('Friend is currently in a match');
        }
        if (targetPresence?.status === 'in_lobby') {
            throw new Error('Friend is already in another lobby');
        }

        const challengeId = uuidv4();
        const expiresAt = Date.now() + 30000; // 30 seconds

        const challengeData = {
            challengeId,
            challengerId: challenger.id,
            challengerName: challenger.username,
            challengerAvatar: challenger.avatar || '',
            challengerRating: challenger.rating || 1500,
            targetUserId,
            expiresAt,
            createdAt: new Date().toISOString()
        };

        // Save challenge in Redis with 35s TTL
        await redisClient.set(`${CHALLENGE_PREFIX}${challengeId}`, JSON.stringify(challengeData), 'EX', 35);

        // Push invite event to target user's personal socket room
        io.to(`user:${targetUserId}`).emit(SERVER_EVENTS.CHALLENGE_INVITE_RECEIVED, {
            challengeId,
            challenger: {
                id: challenger.id,
                username: challenger.username,
                avatar: challenger.avatar || '',
                rating: challenger.rating || 1500
            },
            expiresAt
        });

        return { challengeId, expiresAt };
    }

    /**
     * Cancel outgoing challenge
     */
    async cancelChallenge(io, challengerId, challengeId) {
        const raw = await redisClient.get(`${CHALLENGE_PREFIX}${challengeId}`);
        if (!raw) return;

        const challenge = JSON.parse(raw);
        if (challenge.challengerId !== challengerId) return;

        await redisClient.del(`${CHALLENGE_PREFIX}${challengeId}`);

        io.to(`user:${challenge.targetUserId}`).emit(SERVER_EVENTS.CHALLENGE_CANCELLED, {
            challengeId
        });
    }

    /**
     * Respond to an incoming challenge (ACCEPT or DECLINE)
     */
    async respondChallenge(io, responderUser, challengeId, action) {
        const raw = await redisClient.get(`${CHALLENGE_PREFIX}${challengeId}`);
        if (!raw) {
            throw new Error('Challenge has expired or does not exist');
        }

        const challenge = JSON.parse(raw);
        if (challenge.targetUserId !== responderUser.id) {
            throw new Error('Unauthorized response to challenge');
        }

        await redisClient.del(`${CHALLENGE_PREFIX}${challengeId}`);

        if (action === 'DECLINE') {
            io.to(`user:${challenge.challengerId}`).emit(SERVER_EVENTS.CHALLENGE_DECLINED, {
                challengeId,
                responderName: responderUser.username,
                reason: 'declined'
            });
            return { action: 'DECLINE' };
        }

        // ACCEPT: Create a new Private Lobby
        const lobbyId = `lobby:${uuidv4()}`;

        // Get full challenger user details
        let challengerRating = challenge.challengerRating;
        let challengerAvatar = challenge.challengerAvatar;
        try {
            const dbChallenger = await prisma.user.findUnique({
                where: { id: challenge.challengerId },
                select: { id: true, username: true, displayName: true, avatar: true, rating: true }
            });
            if (dbChallenger) {
                challengerRating = dbChallenger.rating;
                challengerAvatar = dbChallenger.avatar || '';
            }
        } catch (e) {
            console.warn('Failed to load fresh challenger from DB:', e);
        }

        const initialLobby = {
            id: lobbyId,
            creator: {
                id: challenge.challengerId,
                username: challenge.challengerName,
                avatar: challengerAvatar,
                rating: challengerRating
            },
            guest: {
                id: responderUser.id,
                username: responderUser.username,
                avatar: responderUser.avatar || '',
                rating: responderUser.rating || 1500
            },
            status: 'configuring',
            settings: {
                isRanked: false,
                questionCount: 1,
                topic: 'any',
                difficulty: 'any',
                timePerQuestion: 15
            },
            ready: {
                [challenge.challengerId]: true,
                [responderUser.id]: false
            },
            messages: [
                {
                    id: uuidv4(),
                    senderId: 'system',
                    senderName: 'System',
                    text: `Lobby created! ${challenge.challengerName} and ${responderUser.username} are connected.`,
                    timestamp: new Date().toISOString(),
                    isSystem: true
                }
            ],
            createdAt: new Date().toISOString()
        };

        // Save lobby to Redis (expires in 2 hours)
        await redisClient.set(lobbyId, JSON.stringify(initialLobby), 'EX', 7200);

        // Update presence for both players to 'in_lobby'
        await Promise.all([
            presenceService.updateStatus(challenge.challengerId, 'in_lobby', lobbyId),
            presenceService.updateStatus(responderUser.id, 'in_lobby', lobbyId)
        ]);

        // Notify both players to navigate to lobby
        const payload = {
            challengeId,
            lobbyId,
            lobby: initialLobby
        };

        io.to(`user:${challenge.challengerId}`).emit(SERVER_EVENTS.CHALLENGE_ACCEPTED, payload);
        io.to(`user:${responderUser.id}`).emit(SERVER_EVENTS.CHALLENGE_ACCEPTED, payload);

        return { action: 'ACCEPT', lobbyId, lobby: initialLobby };
    }

    /**
     * Get lobby data by ID
     */
    async getLobby(lobbyId) {
        if (!lobbyId) return null;
        const raw = await redisClient.get(lobbyId);
        if (!raw) return null;
        return JSON.parse(raw);
    }

    /**
     * Handle player joining lobby socket room
     */
    async handleJoinLobby(socket, lobbyId) {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'Lobby not found or expired' });
            return;
        }

        const userId = socket.user.id;
        if (lobby.creator.id !== userId && lobby.guest.id !== userId) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'You are not a member of this lobby' });
            return;
        }

        socket.join(lobbyId);
        socket.emit(SERVER_EVENTS.LOBBY_UPDATED, { lobby });
    }

    /**
     * Update match settings (creator only)
     */
    async updateSettings(io, socket, lobbyId, newSettings) {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby) return;

        const userId = socket.user.id;
        if (lobby.creator.id !== userId) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the lobby creator can update match settings.' });
            return;
        }

        const { isRanked, questionCount, topic, difficulty, timePerQuestion } = newSettings || {};

        if (questionCount !== undefined && [1, 2, 3].includes(Number(questionCount))) {
            lobby.settings.questionCount = Number(questionCount);
        }
        if (timePerQuestion !== undefined && [10, 15, 20, 25, 30].includes(Number(timePerQuestion))) {
            lobby.settings.timePerQuestion = Number(timePerQuestion);
        }
        if (topic !== undefined) {
            lobby.settings.topic = String(topic);
        }
        if (difficulty !== undefined && ['any', 'easy', 'medium', 'hard'].includes(String(difficulty).toLowerCase())) {
            lobby.settings.difficulty = String(difficulty).toLowerCase();
        }
        if (isRanked !== undefined) {
            lobby.settings.isRanked = Boolean(isRanked);
        }

        // Whenever settings change, unready the guest so they review the changes
        lobby.ready[lobby.guest.id] = false;

        const systemMsg = {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            text: `${socket.user.username} updated match settings.`,
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        lobby.messages.push(systemMsg);
        if (lobby.messages.length > 50) lobby.messages.shift();

        await redisClient.set(lobbyId, JSON.stringify(lobby), 'EX', 7200);

        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_UPDATED, { lobby });
    }

    /**
     * Toggle Ready status
     */
    async toggleReady(io, socket, lobbyId) {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby) return;

        const userId = socket.user.id;
        if (lobby.creator.id !== userId && lobby.guest.id !== userId) return;

        lobby.ready[userId] = !lobby.ready[userId];

        const isReady = lobby.ready[userId];
        const systemMsg = {
            id: uuidv4(),
            senderId: 'system',
            senderName: 'System',
            text: `${socket.user.username} is ${isReady ? 'ready!' : 'not ready.'}`,
            timestamp: new Date().toISOString(),
            isSystem: true
        };
        lobby.messages.push(systemMsg);
        if (lobby.messages.length > 50) lobby.messages.shift();

        await redisClient.set(lobbyId, JSON.stringify(lobby), 'EX', 7200);

        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_UPDATED, { lobby });
    }

    /**
     * Send chat message in lobby
     */
    async sendMessage(io, socket, lobbyId, text) {
        if (!text || !text.trim()) return;

        const lobby = await this.getLobby(lobbyId);
        if (!lobby) return;

        const userId = socket.user.id;
        if (lobby.creator.id !== userId && lobby.guest.id !== userId) return;

        const message = {
            id: uuidv4(),
            senderId: userId,
            senderName: socket.user.username,
            avatar: socket.user.avatar || '',
            text: text.trim().slice(0, 300),
            timestamp: new Date().toISOString(),
            isSystem: false
        };

        lobby.messages.push(message);
        if (lobby.messages.length > 50) lobby.messages.shift();

        await redisClient.set(lobbyId, JSON.stringify(lobby), 'EX', 7200);

        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_MESSAGE_RECEIVED, { message });
        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_UPDATED, { lobby });
    }

    /**
     * Leave lobby
     */
    async leaveLobby(io, socket, lobbyId) {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby) return;

        const userId = socket.user.id;
        await presenceService.updateStatus(userId, 'online', '');

        const otherUserId = lobby.creator.id === userId ? lobby.guest.id : lobby.creator.id;
        await presenceService.updateStatus(otherUserId, 'online', '');

        await redisClient.del(lobbyId);

        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_DISBANDED, {
            reason: `${socket.user.username} left the lobby.`
        });
    }

    /**
     * Start the match from the lobby
     */
    async startMatch(io, socket, lobbyId) {
        const lobby = await this.getLobby(lobbyId);
        if (!lobby) return;

        const userId = socket.user.id;
        if (lobby.creator.id !== userId) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'Only the creator can start the match' });
            return;
        }

        if (!lobby.ready[lobby.creator.id] || !lobby.ready[lobby.guest.id]) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'Both players must be ready before starting the match.' });
            return;
        }

        // Query problems based on lobby settings
        const { questionCount = 1, topic = 'any', difficulty = 'any', timePerQuestion = 15, isRanked = false } = lobby.settings;

        let query = 'SELECT id, title, difficulty, time_limit_ms FROM problems';
        const conditions = [];
        const params = [];

        if (difficulty !== 'any') {
            params.push(difficulty.toLowerCase());
            conditions.push(`LOWER(difficulty) = $${params.length}`);
        }

        if (topic !== 'any') {
            params.push(`%${topic.toLowerCase()}%`);
            conditions.push(`LOWER(array_to_string(tags, ',')) LIKE $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY RANDOM() LIMIT ${Math.max(1, questionCount)}`;

        let selectedProblems = [];
        try {
            const result = await pool.query(query, params);
            selectedProblems = result.rows.map(p => ({
                id: parseInt(p.id, 10),
                title: p.title,
                difficulty: p.difficulty,
                timeLimitMs: p.time_limit_ms
            }));
        } catch (dbErr) {
            console.error('Error querying filtered problems for lobby match:', dbErr);
        }

        // Fallback to any random problems if filters yielded no results
        if (selectedProblems.length === 0) {
            try {
                const fallbackRes = await pool.query('SELECT id, title, difficulty, time_limit_ms FROM problems ORDER BY RANDOM() LIMIT $1', [questionCount]);
                selectedProblems = fallbackRes.rows.map(p => ({
                    id: parseInt(p.id, 10),
                    title: p.title,
                    difficulty: p.difficulty,
                    timeLimitMs: p.time_limit_ms
                }));
            } catch (fbErr) {
                console.error('Fallback problem query failed:', fbErr);
            }
        }

        if (selectedProblems.length === 0) {
            socket.emit(SERVER_EVENTS.ERROR, { message: 'No suitable problems found in problem bank.' });
            return;
        }

        const roomId = `room:${uuidv4()}`;
        const totalDurationSeconds = timePerQuestion * selectedProblems.length * 60;

        const contestRoom = {
            id: roomId,
            mode: isRanked ? 'ranked' : 'casual',
            player1: {
                id: lobby.creator.id,
                username: lobby.creator.username,
                rating: lobby.creator.rating,
                score: 0,
                connected: true,
                ready: false,
                submissions: []
            },
            player2: {
                id: lobby.guest.id,
                username: lobby.guest.username,
                rating: lobby.guest.rating,
                score: 0,
                connected: true,
                ready: false,
                submissions: []
            },
            problems: selectedProblems,
            totalQuestions: selectedProblems.length,
            timePerQuestion: timePerQuestion,
            durationSeconds: totalDurationSeconds,
            status: 'waiting',
            startedAt: null,
            timer: null,
            timeRemaining: totalDurationSeconds,
            winner: null
        };

        // Save contest room in Redis
        await redisClient.set(roomId, JSON.stringify(contestRoom), 'EX', 86400);

        // Update presence for both players to in_match
        await Promise.all([
            presenceService.updateStatus(lobby.creator.id, 'in_match', roomId),
            presenceService.updateStatus(lobby.guest.id, 'in_match', roomId)
        ]);

        // Clean up lobby in Redis
        await redisClient.del(lobbyId);

        // Notify lobby room that match is starting with countdown
        io.to(lobbyId).emit(SERVER_EVENTS.LOBBY_MATCH_STARTING, {
            roomId,
            countdownSeconds: 3,
            room: contestRoom
        });

        // Also emit MATCH_FOUND directly to both player rooms for instant routing
        io.to(`user:${lobby.creator.id}`).emit(SERVER_EVENTS.MATCH_FOUND, {
            roomId,
            opponent: lobby.guest,
            mode: contestRoom.mode
        });
        io.to(`user:${lobby.guest.id}`).emit(SERVER_EVENTS.MATCH_FOUND, {
            roomId,
            opponent: lobby.creator,
            mode: contestRoom.mode
        });
    }
}

module.exports = new LobbyService();
