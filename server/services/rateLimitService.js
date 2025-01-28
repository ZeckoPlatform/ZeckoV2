const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('../config/redis'); // Assuming you have Redis configured

class RateLimitService {
    // General API rate limit
    static apiLimiter = rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args)
        }),
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Stricter limit for authentication endpoints
    static authLimiter = rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args)
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per hour
        message: 'Too many login attempts, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Password reset rate limit
    static passwordResetLimiter = rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args)
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per hour
        message: 'Too many password reset attempts, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });

    // User registration rate limit
    static registrationLimiter = rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args)
        }),
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        max: 5, // 5 registrations per day per IP
        message: 'Too many accounts created from this IP, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
    });
}

module.exports = RateLimitService; 