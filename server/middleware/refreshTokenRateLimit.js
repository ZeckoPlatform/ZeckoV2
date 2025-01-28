const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis');

const refreshTokenLimiter = rateLimit({
    store: new RedisStore({
        client: redis,
        prefix: 'refresh-token-limit:'
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 refresh attempts per windowMs
    message: {
        status: 'error',
        message: 'Too many refresh attempts, please try again later'
    }
});

module.exports = refreshTokenLimiter; 