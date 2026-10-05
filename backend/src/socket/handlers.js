const { CLIENT_EVENTS, SERVER_EVENTS } = require('./events');
// We will require services dynamically or pass them in to avoid circular dependencies
// const matchmakingService = require('../modules/matchmaking/matchmaking.service');
// const roomService = require('../modules/rooms/room.service');

const registerHandlers = (io, socket) => {
    // We defer requiring to prevent circular dependencies if services require `io`
    const matchmakingService = require('../modules/matchmaking/matchmaking.service');
    const roomService = require('../modules/rooms/room.service');

    socket.on(CLIENT_EVENTS.JOIN_QUEUE, async (payload = {}) => {
        try {
            const mode = payload.mode || 'ranked';
            
            // Refresh username and live rating directly from database
            let username = socket.user.username;
            let rating = socket.user.rating;
            try {
                const prisma = require('../config/prisma');
                const dbUser = await prisma.user.findUnique({
                    where: { id: socket.user.id },
                    select: { username: true, rating: true }
                });
                if (dbUser) {
                    if (dbUser.username) {
                        username = dbUser.username;
                        socket.user.username = dbUser.username;
                    }
                    if (dbUser.rating !== undefined && dbUser.rating !== null) {
                        rating = dbUser.rating;
                        socket.user.rating = dbUser.rating;
                    }
                }
            } catch (dbErr) {
                console.warn('Failed to load fresh user rating from DB for queue, using socket cache:', dbErr);
            }

            await matchmakingService.joinQueue(socket.user.id, socket.id, username, rating, payload.attemptId, mode);
            socket.emit(SERVER_EVENTS.QUEUE_JOINED, { success: true, attemptId: payload.attemptId, mode });
            // Attempt match immediately
            await matchmakingService.attemptMatch(io);
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.LEAVE_QUEUE, async () => {
        try {
            await matchmakingService.leaveQueue(socket.user.id);
            socket.emit(SERVER_EVENTS.QUEUE_LEFT, { success: true });
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.JOIN_ROOM, async (payload) => {
        try {
            await roomService.handlePlayerJoinRoom(socket, payload.roomId);
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.READY, async (payload) => {
        try {
            await roomService.handlePlayerReady(io, socket, payload.roomId);
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.CHOOSE_MATCH_SETTING, async (payload) => {
        try {
            await roomService.handleChooseSetting(io, socket, payload);
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.BAIL_OUT, async (payload = {}) => {
        try {
            await roomService.handleBailOut(io, socket, payload.roomId);
        } catch (error) {
            socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
        }
    });

    socket.on(CLIENT_EVENTS.PING, () => {
        // Just a latency check
        socket.emit('PONG', { timestamp: Date.now() });
    });

    socket.on('disconnect', async () => {
        try {
            await matchmakingService.leaveQueue(socket.user.id, socket.id);
            await roomService.handleDisconnect(io, socket.user.id);
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
};

module.exports = {
    registerHandlers
};
