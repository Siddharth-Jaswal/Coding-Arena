require('dotenv').config({ path: __dirname + '/../../.env' });
const { Worker } = require('bullmq');
const pool = require('../config/db');
const judgeEngine = require('../judge/JudgeEngine');
const config = require('../config');

// Setup Redis connection config
const redisUrl = config.redisUrl;

const connection = new (require('ioredis'))(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        return null;
    }
});

connection.on('error', (err) => {
    console.error("❌ FATAL: Worker failed to connect to Redis:", err.message);
    process.exit(1);
});

const { Emitter } = require('@socket.io/redis-emitter');
const ioEmitter = new Emitter(connection);
const matchService = require('../modules/matches/match.service');

const LUA_UPDATE_SCORE = `
local roomStr = redis.call("GET", KEYS[1])
if not roomStr then return cjson.encode({error="NO_ROOM"}) end
local room = cjson.decode(roomStr)
if room.status == 'finished' then
    return cjson.encode({error="MATCH_FINISHED"})
end

local userId = ARGV[1]
local problemId = tostring(ARGV[2])
local points = tonumber(ARGV[3])

if not room.solved then room.solved = {} end
if not room.solved[userId] then room.solved[userId] = {} end

local alreadySolved = false
if room.solved[userId][problemId] == true then
    alreadySolved = true
end

local awarded = 0
if not alreadySolved and points > 0 then
    room.solved[userId][problemId] = true
    room.scores[userId] = (room.scores[userId] or 0) + points
    awarded = points
end

-- Count unique solved problems for this user
local solvedCount = 0
for k, v in pairs(room.solved[userId]) do
    solvedCount = solvedCount + 1
end

local matchEnded = false
local winnerId = nil

-- Check if they solved all 3
if solvedCount >= 3 then
    room.status = 'finished'
    room.winner = userId
    matchEnded = true
    winnerId = userId
end

if awarded > 0 or matchEnded then
    -- Retain temporarily for 3 hours after finishing
    local ttl = matchEnded and 10800 or 86400
    redis.call("SET", KEYS[1], cjson.encode(room), "EX", ttl)
end

return cjson.encode({
    alreadySolved = alreadySolved,
    pointsAwarded = awarded,
    newTotalScore = room.scores[userId] or 0,
    solvedCount = solvedCount,
    matchEnded = matchEnded,
    winnerId = winnerId
})
`;

// Later down in processing:

const worker = new Worker('judge', async (job) => {
    const { submission_id, problem_id, language, user_id } = job.data;
    console.log(`Processing submission ${submission_id} for problem ${problem_id} (Language: ${language})`);

    try {
        // Mark as running
        await pool.query(`
            UPDATE submissions 
            SET status = 'running', started_at = NOW() 
            WHERE id = $1
        `, [submission_id]);

        // 3. Process the submission using the real Judge Engine
        const { verdict, executionTimeMs } = await judgeEngine.run(submission_id);

        // 4. Update status to completed with verdict and metrics
        await pool.query(`
            UPDATE submissions 
            SET status = 'completed', 
                verdict = $1, 
                finished_at = NOW(),
                execution_time_ms = $2
            WHERE id = $3
        `, [verdict, executionTimeMs, submission_id]);

        console.log(`[Worker] Sub ${submission_id} completed | Verdict: ${verdict} | Time: ${executionTimeMs}ms`);

        // 5. Broadcast to Socket Room if part of a contest
        if (user_id) {
            const roomId = await connection.get(`matchmaking:player:${user_id}`);
            if (roomId) {
                const pointsToAward = verdict === 'Accepted' ? 100 : 0;
                
                // Atomically update the score using Lua script to prevent race conditions and duplicate points
                const resultStr = await connection.eval(
                    LUA_UPDATE_SCORE, 
                    1, 
                    roomId, 
                    user_id, 
                    problem_id, 
                    pointsToAward
                );
                
                if (resultStr) {
                    const result = JSON.parse(resultStr);
                    
                    if (result.error) {
                        console.log(`[Worker] Skipping update, Lua returned: ${result.error}`);
                    } else {
                        ioEmitter.to(roomId).emit('SCORE_UPDATED', {
                            userId: user_id,
                            problemId: problem_id,
                            verdict,
                            pointsAwarded: result.pointsAwarded,
                            newTotalScore: result.newTotalScore
                        });
                        
                        if (result.matchEnded) {
                            try {
                                const finalResult = await matchService.finalizeMatch(roomId, result.winnerId, 'ALL_PROBLEMS_SOLVED');
                                if (finalResult) {
                                    ioEmitter.to(roomId).emit('MATCH_FINISHED', finalResult);
                                }
                            } catch (err) {
                                console.error('Error during early match finalization:', err);
                            }
                        }
                    }
                }
            }
        }

    } catch (error) {
        console.error(`[Worker] Failed to process submission ${submission_id}:`, error);
        
        // On hard failure, update to Internal Error
        await pool.query(`
            UPDATE submissions 
            SET status = 'completed', 
                verdict = 'Internal Error', 
                finished_at = NOW(),
                execution_time_ms = 0
            WHERE id = $1
        `, [submission_id]);
    }
}, { connection });

worker.on('ready', () => {
    console.log("[WORKER] Redis Connected");
    console.log("[WORKER] BullMQ Connected");
    console.log("[WORKER] Listening for Jobs");
});

worker.on('error', (err) => {
    console.error("❌ Judge Worker encountered an error:", err);
});

async function gracefulShutdown() {
    console.log('\n[WORKER] Initiating graceful shutdown...');
    try {
        console.log('[WORKER] 1. Closing BullMQ Worker (waiting for active jobs)');
        await worker.close();

        console.log('[WORKER] 2. Disconnecting Redis');
        await connection.quit();

        console.log('[WORKER] 3. Disconnecting Database');
        await pool.end();

        console.log('[WORKER] Shutdown complete.');
        process.exit(0);
    } catch (err) {
        console.error('[WORKER] Error during shutdown:', err);
        process.exit(1);
    }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
