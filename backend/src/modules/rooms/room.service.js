const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../../redis/client');
const prisma = require('../../config/prisma');
const { SERVER_EVENTS } = require('../../socket/events');
const matchService = require('../matches/match.service');

class RoomService {
    async createRoom(io, player1, player2) {
        const roomId = `room:${uuidv4()}`;

        // Select problems
        // In a real app we'd carefully select 1 easy, 2 mediums.
        // For now, we pick 3 random problems from the DB.
        const allProblems = await prisma.problems.findMany({
            select: { id: true, title: true, difficulty: true },
            take: 10
        });
        
        // Shuffle and pick 3
        const shuffled = allProblems.sort(() => 0.5 - Math.random());
        const selectedProblems = shuffled.slice(0, 3).map(p => ({
            id: p.id.toString(), // Convert BigInt to string
            title: p.title,
            difficulty: p.difficulty
        }));

        const roomState = {
            roomId,
            players: {
                [player1.id]: { username: player1.username || 'Player 1', ready: false, disconnected: false },
                [player2.id]: { username: player2.username || 'Player 2', ready: false, disconnected: false }
            },
            problems: selectedProblems,
            scores: {
                [player1.id]: 0,
                [player2.id]: 0
            },
            status: 'waiting',
            startedAt: null,
            endsAt: null,
            winner: null
        };

        // Create Match in DB first (requirement)
        try {
            await matchService.createMatch(roomId, player1.id, player2.id);
        } catch (error) {
            console.error("Failed to create match in database:", error);
            // Abort room creation if DB creation fails
            if (player1.socketId) io.to(player1.socketId).emit('ERROR', { message: "Failed to initialize match" });
            if (player2.socketId) io.to(player2.socketId).emit('ERROR', { message: "Failed to initialize match" });
            return;
        }

        // Save to Redis
        const multi = redisClient.multi();
        multi.set(roomId, JSON.stringify(roomState), 'EX', 10800); // 3 hr expire
        multi.set(`matchmaking:player:${player1.id}`, roomId, 'EX', 10800);
        multi.set(`matchmaking:player:${player2.id}`, roomId, 'EX', 10800);
        await multi.exec();

        // Broadcast MATCH_FOUND and ROOM_CREATED to the specific sockets
        // Using io.to(socketId) to send private messages
        const matchPayload = {
            roomId,
            opponent: {} // We send each player their opponent
        };

        const roomPayload = roomState;

        if (player1.socketId) {
            io.to(player1.socketId).emit(SERVER_EVENTS.MATCH_FOUND, {
                roomId,
                attemptId: player1.attemptId,
                opponent: { id: player2.id, username: player2.username || 'Player 2', rating: player2.rating }
            });
            io.to(player1.socketId).emit(SERVER_EVENTS.ROOM_CREATED, { ...roomPayload, attemptId: player1.attemptId });
        }

        if (player2.socketId) {
            io.to(player2.socketId).emit(SERVER_EVENTS.MATCH_FOUND, {
                roomId,
                attemptId: player2.attemptId,
                opponent: { id: player1.id, username: player1.username || 'Player 1', rating: player1.rating }
            });
            io.to(player2.socketId).emit(SERVER_EVENTS.ROOM_CREATED, { ...roomPayload, attemptId: player2.attemptId });
        }
    }

    async handlePlayerJoinRoom(socket, roomId) {
        socket.join(roomId);
        const roomData = await redisClient.get(roomId);
        let room = null;
        if (roomData) {
            room = JSON.parse(roomData);
        }

        socket.emit(SERVER_EVENTS.ROOM_JOINED, { roomId, room });

        // If the room is finished or not in Redis (expired), try to send historical result
        if (!room || room.status === 'finished') {
            const prisma = require('../../config/prisma');
            const match = await prisma.match.findUnique({ where: { roomId } });
            if (match) {
                const finalResult = {
                    roomId,
                    winnerId: match.winnerId,
                    loserId: match.loserId,
                    reason: match.finishReason,
                    result: match.winnerId === null ? 'DRAW' : 'WIN',
                    finalScores: {
                        [match.player1Id]: match.p1Score,
                        [match.player2Id]: match.p2Score
                    },
                    ratings: {
                        [match.player1Id]: { old: match.p1OldRating, new: match.p1NewRating, diff: (match.p1NewRating || 0) - (match.p1OldRating || 0) },
                        [match.player2Id]: { old: match.p2OldRating, new: match.p2NewRating, diff: (match.p2NewRating || 0) - (match.p2OldRating || 0) }
                    }
                };
                // Reconstruct a dummy room if it was fully expired from Redis
                if (!room) {
                    socket.emit(SERVER_EVENTS.ROOM_JOINED, { 
                        roomId, 
                        room: { status: 'finished', scores: finalResult.finalScores, players: {} } 
                    });
                }
                socket.emit(SERVER_EVENTS.MATCH_FINISHED, finalResult);
            }
        }
    }

    async handlePlayerReady(io, socket, roomId) {
        const roomData = await redisClient.get(roomId);
        if (!roomData) return;

        const room = JSON.parse(roomData);
        if (room.players[socket.user.id]) {
            room.players[socket.user.id].ready = true;
        }

        const allReady = Object.values(room.players).every(p => p.ready);
        
        if (allReady && room.status === 'waiting') {
            room.status = 'countdown';
            // Update Redis
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 86400);
            
            // Broadcast countdown
            io.to(roomId).emit(SERVER_EVENTS.COUNTDOWN_STARTED, { startsInSeconds: 10 });
            
            // Start contest timer
            setTimeout(async () => {
                const refreshedRoomStr = await redisClient.get(roomId);
                if (!refreshedRoomStr) return;
                const refreshedRoom = JSON.parse(refreshedRoomStr);
                
                refreshedRoom.status = 'running';
                refreshedRoom.startedAt = new Date().toISOString();
                
                const durationSeconds = 3600;
                refreshedRoom.endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
                
                await redisClient.set(roomId, JSON.stringify(refreshedRoom), 'EX', 86400);
                
                io.to(roomId).emit(SERVER_EVENTS.CONTEST_STARTED, {
                    startedAt: refreshedRoom.startedAt,
                    durationSeconds
                });
                
                // End timer
                setTimeout(async () => {
                    try {
                        const finalResult = await matchService.finalizeMatch(roomId, null, 'TIME_EXPIRED');
                        if (finalResult) {
                            io.to(roomId).emit(SERVER_EVENTS.MATCH_FINISHED, finalResult);
                        }
                    } catch (err) {
                        console.error('Error during timeout match finalization:', err);
                    }
                }, durationSeconds * 1000);

            }, 10000);
        } else {
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 86400);
        }
    }

    async handleReconnect(io, socket, userId) {
        const roomId = await redisClient.get(`matchmaking:player:${userId}`);
        if (!roomId) return; // Not in a room

        const roomData = await redisClient.get(roomId);
        if (!roomData) return;

        const room = JSON.parse(roomData);
        if (room.status === 'finished') {
            // Defensive cleanup: if the room is finished but mapping exists, delete it.
            // Do not resurrect or auto-reconnect to a finished match.
            await redisClient.del(`matchmaking:player:${userId}`);
            return;
        }

        if (room.players[userId]) {
            room.players[userId].disconnected = false;
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 10800);
            
            // Forcefully rejoin the socket to the room so it receives SCORE_UPDATED events
            socket.join(roomId);
            
            // Broadcast reconnect event
            io.to(roomId).emit(SERVER_EVENTS.PLAYER_RECONNECTED, { userId });
        }
    }

    async handleDisconnect(io, userId) {
        const roomId = await redisClient.get(`matchmaking:player:${userId}`);
        if (!roomId) return; // Not in a room

        const roomData = await redisClient.get(roomId);
        if (!roomData) return;

        const room = JSON.parse(roomData);
        if (room.players[userId]) {
            room.players[userId].disconnected = true;
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 10800);
            
            // Broadcast disconnect event
            io.to(roomId).emit(SERVER_EVENTS.PLAYER_DISCONNECTED, { userId });
        }
    }
}

module.exports = new RoomService();
