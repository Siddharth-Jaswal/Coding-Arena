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
                const roomStr = await connection.get(roomId);
                if (roomStr) {
                    const room = JSON.parse(roomStr);
                    if (verdict === 'Accepted') {
                        room.scores[user_id] = (room.scores[user_id] || 0) + 100;
                    }
                    await connection.set(roomId, JSON.stringify(room), 'EX', 86400);
                    ioEmitter.to(roomId).emit('SCORE_UPDATED', {
                        userId: user_id,
                        problemId: problem_id,
                        verdict,
                        pointsAwarded: verdict === 'Accepted' ? 100 : 0,
                        newTotalScore: room.scores[user_id]
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
