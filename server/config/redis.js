const Redis = require('ioredis');

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    enableOfflineQueue: false,
});

redis.on('error', (error) => {
    console.error('Redis error:', error);
});

redis.on('connect', () => {
    console.log('Successfully connected to Redis');
});

module.exports = redis; 