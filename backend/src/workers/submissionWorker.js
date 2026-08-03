require('dotenv').config({ path: __dirname + '/../../.env' });
const { Worker } = require('bullmq');
const pool = require('../config/db');
const judgeEngine = require('../judge/JudgeEngine');

// Setup Redis connection config
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
    console.error("FATAL ERROR: REDIS_URL environment variable is missing.");
    process.exit(1);
}

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

console.log("Starting Judge Worker...");

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
    console.log("✅ Judge Worker is connected and ready to process jobs.");
});

worker.on('error', (err) => {
    console.error("❌ Judge Worker encountered an error:", err);
});
