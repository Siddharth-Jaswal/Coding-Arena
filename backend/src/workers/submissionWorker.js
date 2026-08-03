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

        // Execute actual judge engine
        const verdict = await judgeEngine.run(submission_id);

        // Mark as completed
        await pool.query(`
            UPDATE submissions 
            SET status = 'completed', verdict = $2, finished_at = NOW() 
            WHERE id = $1
        `, [submission_id, verdict]);

        console.log(`Submission ${submission_id} completed with verdict: ${verdict}`);
    } catch (err) {
        console.error(`Failed to process submission ${submission_id}:`, err);
        // On error, mark as completed with error verdict
        await pool.query(`
            UPDATE submissions 
            SET status = 'completed', verdict = 'Internal Error', finished_at = NOW() 
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
