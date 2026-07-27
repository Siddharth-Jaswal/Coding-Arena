const { Queue } = require('bullmq');
const redisConfig = require('../config/redis');

const submissionQueue = new Queue('submission-queue', {
    connection: redisConfig
});

module.exports = submissionQueue;
