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

const LUA_UPDATE_SCORE = `
local roomStr = redis.call("GET", KEYS[1])
if not roomStr then return nil end
local room = cjson.decode(roomStr)
local userId = ARGV[1]
local problemId = tostring(ARGV[2])
local points = tonumber(ARGV[3])

if not room.solved then room.solved = {} end
if not room.solved[userId] then room.solved[userId] = {} end

local alreadySolved = false
for i, pid in ipairs(room.solved[userId]) do
    if tostring(pid) == problemId then
        alreadySolved = true
        break
    end
end

local awarded = 0
if not alreadySolved and points > 0 then
    table.insert(room.solved[userId], problemId)
    room.scores[userId] = (room.scores[userId] or 0) + points
    awarded = points
    redis.call("SET", KEYS[1], cjson.encode(room), "EX", 86400)
end

return cjson.encode({ awarded = awarded, newTotalScore = room.scores[userId] })
`;

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
                    ioEmitter.to(roomId).emit('SCORE_UPDATED', {
                        userId: user_id,
                        problemId: problem_id,
                        verdict,
                        pointsAwarded: result.awarded,
                        newTotalScore: result.newTotalScore
                    });
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
