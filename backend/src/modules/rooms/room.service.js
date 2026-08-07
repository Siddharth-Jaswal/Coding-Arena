const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../../redis/client');
const prisma = require('../../config/prisma');
const { SERVER_EVENTS } = require('../../socket/events');

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

        // Save to Redis
        const multi = redisClient.multi();
        multi.set(roomId, JSON.stringify(roomState), 'EX', 86400); // 24 hr expire
        multi.set(`matchmaking:player:${player1.id}`, roomId, 'EX', 86400);
        multi.set(`matchmaking:player:${player2.id}`, roomId, 'EX', 86400);
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
                opponent: { id: player2.id, username: player2.username || 'Player 2', rating: player2.rating }
            });
            io.to(player1.socketId).emit(SERVER_EVENTS.ROOM_CREATED, roomPayload);
        }

        if (player2.socketId) {
            io.to(player2.socketId).emit(SERVER_EVENTS.MATCH_FOUND, {
                roomId,
                opponent: { id: player1.id, username: player1.username || 'Player 1', rating: player1.rating }
            });
            io.to(player2.socketId).emit(SERVER_EVENTS.ROOM_CREATED, roomPayload);
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
                    // Logic to end match
                    const finalRoomStr = await redisClient.get(roomId);
                    if (finalRoomStr) {
                        const finalRoom = JSON.parse(finalRoomStr);
                        finalRoom.status = 'finished';
                        
                        // Calculate winner
                        const [p1, p2] = Object.keys(finalRoom.scores);
                        let winnerId = null;
                        if (finalRoom.scores[p1] > finalRoom.scores[p2]) winnerId = p1;
                        else if (finalRoom.scores[p2] > finalRoom.scores[p1]) winnerId = p2;
                        
                        finalRoom.winner = winnerId;
                        await redisClient.set(roomId, JSON.stringify(finalRoom), 'EX', 86400);
                        
                        io.to(roomId).emit(SERVER_EVENTS.MATCH_FINISHED, {
                            winnerId,
                            finalScores: finalRoom.scores
                        });
                    }
                }, durationSeconds * 1000);

            }, 10000);
        } else {
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 86400);
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
            await redisClient.set(roomId, JSON.stringify(room), 'EX', 86400);
            // Optionally broadcast to the other player that opponent disconnected
        }
    }
}

module.exports = new RoomService();
