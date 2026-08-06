const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

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
