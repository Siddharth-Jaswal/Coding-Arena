const Redis = require('ioredis');
const config = require('../config');

const redisUrl = config.redisUrl;

// Singleton connections for ioredis
// The adapter requires two separate connections: a publisher and a subscriber.
const pubClient = new Redis(redisUrl);
const subClient = pubClient.duplicate();

// A general purpose client for our app's logic (matchmaking, rooms)
const redisClient = new Redis(redisUrl);

redisClient.on('error', (err) => {
    console.error('Redis client error:', err);
});

module.exports = {
    redisClient,
    pubClient,
    subClient
};
