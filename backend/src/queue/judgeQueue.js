const { Queue } = require('bullmq');
const IORedis = require('ioredis');
const config = require('../config');

const redisUrl = config.redisUrl;

if (!redisUrl) {
    console.error("FATAL ERROR: REDIS_URL environment variable is missing.");
    process.exit(1);
}

// Create a fail-fast Redis connection
const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
        // Do not retry, fail immediately
        return null; 
    }
});

connection.on('error', (err) => {
    console.error('❌ Failed to connect to Redis for BullMQ:', err.message);
    process.exit(1);
});

// Create the BullMQ queue
const judgeQueue = new Queue('judge', { connection });

connection.ping().then(() => {
    console.log('✅ Successfully connected to Redis for BullMQ.');
}).catch(err => {
    console.error('❌ Redis client ping failed:', err.message);
    process.exit(1);
});

module.exports = { judgeQueue, connection };
