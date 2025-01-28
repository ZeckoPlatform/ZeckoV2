const session = require('express-session');
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

// Redis client setup
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        return Math.min(times * 50, 2000);
    }
});

// Session store configuration
const sessionStore = new RedisStore({
    client: redisClient,
    prefix: 'session:',
});

const sessionConfig = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET || uuidv4(),
    name: 'sessionId', // Instead of default 'connect.sid'
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined
    },
    genid: () => uuidv4()
};

module.exports = { sessionConfig, redisClient }; 