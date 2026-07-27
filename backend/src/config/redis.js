require('dotenv').config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const url = new URL(redisUrl);

const redisConfig = {
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 6379,
    maxRetriesPerRequest: null
};

if (url.username || url.password) {
    redisConfig.username = url.username || undefined;
    redisConfig.password = url.password || undefined;
}

module.exports = redisConfig;
