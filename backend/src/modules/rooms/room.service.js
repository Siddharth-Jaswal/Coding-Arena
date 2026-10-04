const { v4: uuidv4 } = require('uuid');
const { redisClient } = require('../../redis/client');
const prisma = require('../../config/prisma');
const { SERVER_EVENTS } = require('../../socket/events');
const matchService = require('../matches/match.service');

class RoomService {
    async createRoom(io, player1, player2, mode = 'ranked') {
        const roomId = `room:${uuidv4()}`;
        const isTossMode = mode === 'toss';

        let setup = null;
        let selectedProblems = [];
        let totalQuestions = 0;
        let durationSeconds = 0;
        let timePerQuestion = 0;
        let status = 'waiting';

        if (isTossMode) {
            // Toss Mode: 3 independent coin flips for topic, question count, and time per question
            const flipCoin = (p1Id, p2Id) => {
                const isHeads = Math.random() < 0.5;
                return {
                    winnerId: isHeads ? p1Id : p2Id,
                    outcome: isHeads ? 'HEADS' : 'TAILS',
                    p1Choice: 'HEADS',
                    p2Choice: 'TAILS'
                };
            };

            const coinFlips = {
                topic: flipCoin(player1.id, player2.id),
                questionCount: flipCoin(player1.id, player2.id),
                timePerQuestion: flipCoin(player1.id, player2.id)
            };

            const availableTopics = [
                { id: 'arrays', label: 'Arrays', description: 'Two pointers, sliding window, manipulation' },
                { id: 'strings', label: 'Strings', description: 'Parsing, substrings, palindromes' },
                { id: 'dynamic-programming', label: 'Dynamic Programming', description: 'Memoization, tabulation, subproblems' },
                { id: 'graphs', label: 'Graphs', description: 'BFS, DFS, shortest path' },
                { id: 'greedy', label: 'Greedy', description: 'Optimal choice, intervals, sorting' },
                { id: 'binary-search', label: 'Binary Search', description: 'Divide & conquer, search space' },
                { id: 'two-pointers', label: 'Two Pointers', description: 'Sorted arrays, pairs, fast & slow' },
                { id: 'stack-queue', label: 'Stack & Queue', description: 'Monotonic stack, FIFO/LIFO' },
                { id: 'linked-list', label: 'Linked List', description: 'Pointers, cycles, reversals' },
                { id: 'trees', label: 'Trees', description: 'Traversals, BST, depth' }
            ];

            setup = {
                coinFlips,
                rolls: coinFlips, // alias for backwards compatibility
                choices: {
                    topic: null,
                    questionCount: null,
                    timePerQuestion: null
                },
                availableTopics,
                availableQuestionCounts: [1, 2, 3],
                availableTimesPerQuestion: [10, 15, 20, 25, 30] // minutes
            };

            status = 'setup';
        } else {
            // Ranked Battle: 1 random question by default with 20 minutes solving time
            const allProblems = await prisma.problems.findMany({
                select: { id: true, title: true, difficulty: true },
                take: 50
            });
            const randomProblem = allProblems[Math.floor(Math.random() * allProblems.length)];
            if (randomProblem) {
                selectedProblems = [{
                    id: randomProblem.id.toString(),
                    title: randomProblem.title,
                    difficulty: randomProblem.difficulty
                }];
            }
            totalQuestions = 1;
            timePerQuestion = 20;
            durationSeconds = 20 * 60; // 20 minutes = 1200 seconds
            status = 'countdown';
        }

        const roomState = {
            roomId,
            mode: isTossMode ? 'toss' : 'ranked',
            players: {
                [player1.id]: { username: player1.username || 'Player 1', rating: player1.rating, ready: false, disconnected: false },
                [player2.id]: { username: player2.username || 'Player 2', rating: player2.rating, ready: false, disconnected: false }
            },
            setup,
            problems: selectedProblems,
            totalQuestions,
            durationSeconds,
            timePerQuestion,
            scores: {
                [player1.id]: 0,
                [player2.id]: 0
            },
            penalties: {
                [player1.id]: 0,
                [player2.id]: 0
            },
            attempts: {
                [player1.id]: {},
                [player2.id]: {}
            },
            solved: {
                [player1.id]: {},
                [player2.id]: {}
            },

            status,
            startedAt: null,
            endsAt: null,
            winner: null
        };

        // Create Match in DB first
        try {
            await matchService.createMatch(roomId, player1.id, player2.id);
        } catch (error) {
            console.error("Failed to create match in database:", error);
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

        // Broadcast MATCH_FOUND and ROOM_CREATED to specific sockets
        const roomPayload = roomState;

        if (player1.socketId) {
            io.to(player1.socketId).emit(SERVER_EVENTS.MATCH_FOUND, {
                roomId,
                attemptId: player1.attemptId,
                opponent: { id: player2.id, username: player2.username || 'Player 2', rating: player2.rating },
                mode: roomState.mode
            });
            io.to(player1.socketId).emit(SERVER_EVENTS.ROOM_CREATED, { ...roomPayload, attemptId: player1.attemptId });
            if (isTossMode) {
                io.to(player1.socketId).emit(SERVER_EVENTS.MATCH_SETUP_STARTED, { roomId, setup: roomPayload.setup });
            }
        }

        if (player2.socketId) {
            io.to(player2.socketId).emit(SERVER_EVENTS.MATCH_FOUND, {
                roomId,
                attemptId: player2.attemptId,
                opponent: { id: player1.id, username: player1.username || 'Player 1', rating: player1.rating },
                mode: roomState.mode
            });
            io.to(player2.socketId).emit(SERVER_EVENTS.ROOM_CREATED, { ...roomPayload, attemptId: player2.attemptId });
            if (isTossMode) {
                io.to(player2.socketId).emit(SERVER_EVENTS.MATCH_SETUP_STARTED, { roomId, setup: roomPayload.setup });
            }
        }

        // If Ranked mode, immediately kick off countdown to match start
        if (!isTossMode) {
            setTimeout(() => {
                io.to(roomId).emit(SERVER_EVENTS.COUNTDOWN_STARTED, { startsInSeconds: 5 });

                setTimeout(async () => {
                    const refreshedRoomStr = await redisClient.get(roomId);
                    if (!refreshedRoomStr) return;
                    const refreshedRoom = JSON.parse(refreshedRoomStr);

                    if (refreshedRoom.status === 'finished') return;

                    refreshedRoom.status = 'running';
                    refreshedRoom.startedAt = new Date().toISOString();
                    refreshedRoom.endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

                    await redisClient.set(roomId, JSON.stringify(refreshedRoom), 'EX', 86400);

                    io.to(roomId).emit(SERVER_EVENTS.CONTEST_STARTED, {
                        startedAt: refreshedRoom.startedAt,
                        durationSeconds,
                        endsAt: refreshedRoom.endsAt,
                        problems: refreshedRoom.problems
                    });

                    // Timeout finalizer after 20 minutes
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

                }, 5000);
            }, 1000);
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

    async handleChooseSetting(io, socket, payload) {
        const { roomId, setting, value } = payload || {};
        if (!roomId || !setting || value === undefined || value === null) return;

        const roomData = await redisClient.get(roomId);
        if (!roomData) return;

        const room = JSON.parse(roomData);
        if (room.status !== 'setup') return;

        const userId = socket.user.id;
        const rollInfo = room.setup?.rolls?.[setting];
        if (!rollInfo) return;

        if (rollInfo.winnerId !== userId) {
            socket.emit(SERVER_EVENTS.ERROR, { message: "You did not win the roll to choose this setting." });
            return;
        }

        if (setting === 'topic') {
            const validTopic = room.setup.availableTopics.some(t => t.id === value);
            if (!validTopic) {
                socket.emit(SERVER_EVENTS.ERROR, { message: "Invalid topic chosen." });
                return;
            }
            room.setup.choices.topic = value;
        } else if (setting === 'questionCount') {
            const count = parseInt(value, 10);
            if (![1, 2, 3].includes(count)) {
                socket.emit(SERVER_EVENTS.ERROR, { message: "Invalid question count." });
                return;
            }
            room.setup.choices.questionCount = count;
        } else if (setting === 'timePerQuestion') {
            const time = parseInt(value, 10);
            if (![10, 15, 20, 25, 30].includes(time)) {
                socket.emit(SERVER_EVENTS.ERROR, { message: "Invalid time per question." });
                return;
            }
            room.setup.choices.timePerQuestion = time;
        }

        await redisClient.set(roomId, JSON.stringify(room), 'EX', 10800);

        // Broadcast setting chosen
        io.to(roomId).emit(SERVER_EVENTS.MATCH_SETTING_CHOSEN, {
            setting,
            value: room.setup.choices[setting],
            chosenBy: userId,
            choices: room.setup.choices
        });

        // If all 3 settings chosen, finalize and start countdown
        const { topic, questionCount, timePerQuestion } = room.setup.choices;
        if (topic && questionCount && timePerQuestion) {
            await this.finalizeSetupAndStartCountdown(io, roomId, room);
        }
    }

    async finalizeSetupAndStartCountdown(io, roomId, room) {
        const { topic, questionCount, timePerQuestion } = room.setup.choices;

        // Query problems for chosen topic
        const matchingProblems = await prisma.problems.findMany({
            where: { tags: { has: topic } },
            select: { id: true, title: true, difficulty: true }
        });

        const shuffled = matchingProblems.sort(() => 0.5 - Math.random());
        let selected = shuffled.slice(0, questionCount);

        // If fewer problems than questionCount, backfill from other problems
        if (selected.length < questionCount) {
            const existingIds = selected.map(p => p.id);
            const backfill = await prisma.problems.findMany({
                where: { id: { notIn: existingIds } },
                select: { id: true, title: true, difficulty: true },
                take: questionCount - selected.length
            });
            selected = selected.concat(backfill);
        }

        room.problems = selected.map(p => ({
            id: p.id.toString(),
            title: p.title,
            difficulty: p.difficulty
        }));
        room.totalQuestions = room.problems.length;
        room.timePerQuestion = timePerQuestion;

        const durationSeconds = room.totalQuestions * timePerQuestion * 60;
        room.durationSeconds = durationSeconds;
        room.status = 'countdown';

        await redisClient.set(roomId, JSON.stringify(room), 'EX', 86400);

        io.to(roomId).emit(SERVER_EVENTS.MATCH_SETUP_COMPLETED, {
            problems: room.problems,
            totalQuestions: room.totalQuestions,
            durationSeconds,
            setup: room.setup
        });

        io.to(roomId).emit(SERVER_EVENTS.COUNTDOWN_STARTED, { startsInSeconds: 5 });

        setTimeout(async () => {
            const refreshedRoomStr = await redisClient.get(roomId);
            if (!refreshedRoomStr) return;
            const refreshedRoom = JSON.parse(refreshedRoomStr);

            refreshedRoom.status = 'running';
            refreshedRoom.startedAt = new Date().toISOString();
            refreshedRoom.endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();

            await redisClient.set(roomId, JSON.stringify(refreshedRoom), 'EX', 86400);

            io.to(roomId).emit(SERVER_EVENTS.CONTEST_STARTED, {
                startedAt: refreshedRoom.startedAt,
                durationSeconds,
                endsAt: refreshedRoom.endsAt,
                problems: refreshedRoom.problems
            });

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

        }, 5000);
    }

    async handleBailOut(io, socket, roomId) {
        if (!roomId) return;
        const roomData = await redisClient.get(roomId);
        if (!roomData) return;

        const room = JSON.parse(roomData);
        if (room.status === 'finished') return;

        const bailedUserId = socket.user.id;
        const playerIds = Object.keys(room.players || {});
        const opponentId = playerIds.find(id => id !== bailedUserId);
        if (!opponentId) return;

        room.status = 'finished';
        room.winner = opponentId;
        room.finishReason = 'FORFEIT';
        await redisClient.set(roomId, JSON.stringify(room), 'EX', 10800);

        try {
            const finalResult = await matchService.finalizeMatch(roomId, opponentId, 'FORFEIT');
            if (finalResult) {
                io.to(roomId).emit(SERVER_EVENTS.MATCH_FINISHED, finalResult);
            }
        } catch (error) {
            console.error('Error during bail out match finalization:', error);
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
