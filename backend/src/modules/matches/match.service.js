const prisma = require('../../config/prisma');
const { redisClient } = require('../../redis/client');

class MatchService {
    async createMatch(roomId, player1Id, player2Id) {
        return prisma.match.create({
            data: {
                roomId,
                player1Id,
                player2Id,
                status: 'ACTIVE'
            }
        });
    }

    async finalizeMatch(roomId, winnerIdFromLua = null, reason = 'ALL_PROBLEMS_SOLVED') {
        // If this is a timeout, we must atomically transition the room in Redis
        // to prevent a race condition with a late submission.
        if (reason === 'TIME_EXPIRED') {
            const LUA_TIMEOUT_FINISH = `
                local roomStr = redis.call("GET", KEYS[1])
                if not roomStr then return nil end
                local room = cjson.decode(roomStr)
                if room.status == 'finished' then
                    return nil
                end
                room.status = 'finished'
                redis.call("SET", KEYS[1], cjson.encode(room), "EX", 10800) -- 3 hours TTL
                return cjson.encode(room)
            `;
            const roomData = await redisClient.eval(LUA_TIMEOUT_FINISH, 1, roomId);
            if (!roomData) return null; // already finished by a submission
        }
        
        return prisma.$transaction(async (tx) => {
            // Idempotency: Lock the match row and check status
            const match = await tx.match.findUnique({
                where: { roomId }
            });
            if (!match || match.status === 'FINISHED') return null;

            // Fetch Redis room state for final scores
            const roomStr = await redisClient.get(roomId);
            if (!roomStr) return null;
            const room = JSON.parse(roomStr);

            const p1Score = room.scores[match.player1Id] || 0;
            const p2Score = room.scores[match.player2Id] || 0;

            let winnerId = null;
            let loserId = null;
            let isDraw = false;

            if (reason === 'ALL_PROBLEMS_SOLVED') {
                if (!winnerIdFromLua) throw new Error("Winner ID required for early completion");
                // Validate that the winner from Lua matches a player in this match
                if (winnerIdFromLua !== match.player1Id && winnerIdFromLua !== match.player2Id) return null;
                // Double check Lua actually finished it
                if (room.winner !== winnerIdFromLua) return null;
                
                winnerId = winnerIdFromLua;
                loserId = winnerId === match.player1Id ? match.player2Id : match.player1Id;
            } else if (reason === 'TIME_EXPIRED') {
                if (p1Score > p2Score) {
                    winnerId = match.player1Id;
                    loserId = match.player2Id;
                } else if (p2Score > p1Score) {
                    winnerId = match.player2Id;
                    loserId = match.player1Id;
                } else {
                    isDraw = true;
                }
            }

            const p1 = await tx.user.findUnique({ where: { id: match.player1Id } });
            const p2 = await tx.user.findUnique({ where: { id: match.player2Id } });

            let p1NewRating = p1.rating;
            let p2NewRating = p2.rating;

            if (isDraw) {
                await tx.user.update({ where: { id: p1.id }, data: { draws: { increment: 1 } } });
                await tx.user.update({ where: { id: p2.id }, data: { draws: { increment: 1 } } });
            } else {
                if (winnerId === p1.id) {
                    p1NewRating = p1.rating + 25;
                    p2NewRating = Math.max(0, p2.rating - 25);
                    await tx.user.update({ where: { id: p1.id }, data: { wins: { increment: 1 }, rating: p1NewRating } });
                    await tx.user.update({ where: { id: p2.id }, data: { losses: { increment: 1 }, rating: p2NewRating } });
                } else {
                    p2NewRating = p2.rating + 25;
                    p1NewRating = Math.max(0, p1.rating - 25);
                    await tx.user.update({ where: { id: p2.id }, data: { wins: { increment: 1 }, rating: p2NewRating } });
                    await tx.user.update({ where: { id: p1.id }, data: { losses: { increment: 1 }, rating: p1NewRating } });
                }
            }

            const updatedMatch = await tx.match.update({
                where: { id: match.id },
                data: {
                    status: 'FINISHED',
                    finishReason: reason,
                    winnerId: isDraw ? null : winnerId,
                    loserId: isDraw ? null : loserId,
                    p1Score,
                    p2Score,
                    p1OldRating: p1.rating,
                    p1NewRating,
                    p2OldRating: p2.rating,
                    p2NewRating,
                    finishedAt: new Date()
                }
            });

            await tx.matchEvent.create({
                data: {
                    matchId: match.id,
                    eventType: 'MATCH_FINISHED',
                    payload: { reason, isDraw, p1Score, p2Score }
                }
            });

            // Compare-and-Delete: safely remove active match mappings in Redis
            // only if they still point to the finishing room.
            const LUA_COMPARE_AND_DELETE = `
                if redis.call("GET", KEYS[1]) == ARGV[1] then
                    return redis.call("DEL", KEYS[1])
                else
                    return 0
                end
            `;
            await redisClient.eval(LUA_COMPARE_AND_DELETE, 1, `matchmaking:player:${match.player1Id}`, roomId);
            await redisClient.eval(LUA_COMPARE_AND_DELETE, 1, `matchmaking:player:${match.player2Id}`, roomId);

            return {
                roomId,
                winnerId: isDraw ? null : winnerId,
                loserId: isDraw ? null : loserId,
                reason,
                result: isDraw ? 'DRAW' : 'WIN',
                finalScores: {
                    [p1.id]: p1Score,
                    [p2.id]: p2Score
                },
                ratings: {
                    [p1.id]: { old: p1.rating, new: p1NewRating, diff: p1NewRating - p1.rating },
                    [p2.id]: { old: p2.rating, new: p2NewRating, diff: p2NewRating - p2.rating }
                }
            };
        });
    }
}

module.exports = new MatchService();
