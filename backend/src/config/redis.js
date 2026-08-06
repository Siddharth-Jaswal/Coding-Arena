const config = require('./index');

const redisUrl = config.redisUrl;
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
