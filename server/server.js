require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { Server } = require('socket.io');
const fs = require('fs');
const os = require('os');
const dbService = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const { 
    limiter, 
    corsOptions, 
    errorHandler: securityErrorHandler, 
    securityHeaders,
    setupCSRF
} = require('./middleware/security');
const AuctionScheduler = require('./services/auctionScheduler');
const csrfMiddleware = require('./middleware/security');
const TokenCleanupService = require('./services/tokenCleanupService');
const RateLimitService = require('./services/rateLimitService');
const xss = require('xss-clean');
const { sanitizeInput } = require('./middleware/sanitization');
const { secureResponse } = require('./middleware/responseHandler');
const { setupErrorHandling } = require('./middleware/errorHandler');
const logger = require('./utils/logger');
const session = require('express-session');
const { sessionConfig, redisClient } = require('./config/session');
const performanceMonitor = require('./middleware/performanceMonitor');
const staticRoutes = require('./routes/static');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/api/lead');
const productRoutes = require('./routes/productRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const messageRoutes = require('./routes/messageRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const creditRoutes = require('./routes/creditRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const projectRoutes = require('./routes/api/projectRoutes');
const twoFactorAuthRoutes = require('./routes/twoFactorAuth');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? 'https://zeckov2-deceb43992ac.herokuapp.com'
            : 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    },
    path: '/socket.io'
});

// Initialize auction scheduler after socket.io
const auctionScheduler = new AuctionScheduler(io);

// Make both io and auctionScheduler available to routes
app.set('io', io);
app.set('auctionScheduler', auctionScheduler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle user authentication
  socket.on('authenticate', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} authenticated`);
    }
  });

  // Handle auction room joining
  socket.on('joinAuction', (auctionId) => {
    socket.join(`auction:${auctionId}`);
    console.log(`Socket ${socket.id} joined auction:${auctionId}`);
  });

  // Handle auction room leaving
  socket.on('leaveAuction', (auctionId) => {
    socket.leave(`auction:${auctionId}`);
    console.log(`Socket ${socket.id} left auction:${auctionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Add helper functions for socket notifications
const notifyUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit('auctionEvent', {
    type: event,
    ...data
  });
};

const notifyAuction = (io, auctionId, event, data) => {
  io.to(`auction:${auctionId}`).emit('auctionEvent', {
    type: event,
    ...data
  });
};

// Make notification helpers available to routes
app.set('notifyUser', notifyUser);
app.set('notifyAuction', notifyAuction);

// Basic middleware (order is important)
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(session(sessionConfig));
app.use(xss());

// Security middleware
app.use(securityHeaders);
setupCSRF(app);

// Rate limiting (before routes)
app.use('/api', RateLimitService.apiLimiter);
app.use('/api/auth', RateLimitService.authLimiter);
app.use('/api/users/register', RateLimitService.registrationLimiter);

// Custom middleware
app.use(sanitizeInput);
app.use(secureResponse);
app.use(performanceMonitor);

// Debug middleware (only in development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`, req.body);
        next();
    });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/products', productRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/2fa', twoFactorAuthRoutes);
app.use('/api/static', staticRoutes);

// API 404 handler
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: 'API route not found' });
});

// Static files serving (after API routes)
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}

// Error handling (must be last)
app.use(errorHandler);

// Health check endpoint
app.get('/health', async (req, res) => {
    const dbHealth = await dbService.healthCheck();
    res.json({
        status: 'ok',
        timestamp: new Date(),
        database: dbHealth
    });
});

// Start token cleanup service
TokenCleanupService.startCleanupSchedule();

// Apply specific rate limits to sensitive routes
app.use('/api/security', RateLimitService.passwordResetLimiter);
app.use('/api/payment', RateLimitService.paymentLimiter);
app.use('/api/subscription', RateLimitService.paymentLimiter);
app.use('/api/credit', RateLimitService.paymentLimiter);

// Apply registration rate limit
app.use('/api/business/register', RateLimitService.registrationLimiter);
app.use('/api/vendor/register', RateLimitService.registrationLimiter);

// Redis health check
redisClient.on('error', (err) => {
    logger.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    logger.info('Connected to Redis successfully');
});

// Session activity middleware
app.use((req, res, next) => {
    if (req.session && req.session.user) {
        // Extend session if user is active
        req.session.touch();
        // Update last activity timestamp
        req.session.lastActivity = Date.now();
    }
    next();
});

// Session cleanup middleware
const cleanupInactiveSessions = async () => {
    try {
        const keys = await redisClient.keys('session:*');
        for (const key of keys) {
            const session = await redisClient.get(key);
            if (session) {
                const sessionData = JSON.parse(session);
                const lastActivity = sessionData.lastActivity || 0;
                // Remove sessions inactive for more than 24 hours
                if (Date.now() - lastActivity > 24 * 60 * 60 * 1000) {
                    await redisClient.del(key);
                }
            }
        }
    } catch (error) {
        logger.error('Session cleanup error:', error);
    }
};

// Run cleanup every 6 hours
setInterval(cleanupInactiveSessions, 6 * 60 * 60 * 1000);

// Update the server startup
const port = process.env.PORT || 5000;
server.listen(port, () => {
    logger.info(`Server running on port ${port}`);
});

// Handle server errors
server.on('error', (error) => {
    logger.error('Server Error:', error);
});

// Add cleanup to graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    
    // Clear all scheduled auctions
    for (const [productId, timeoutId] of auctionScheduler.scheduledAuctions) {
        clearTimeout(timeoutId);
    }
    
    await dbService.disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('Unhandled Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Add MongoDB Debug Logging
mongoose.set('debug', true);

// Optional: Log only slow queries (>100ms)
mongoose.connection.on('query', (query) => {
  if (query.executionTime > 100) {
    console.log(`Slow Query (${query.executionTime}ms):`, {
      operation: query.operation,
      collection: query.collection,
      query: query.query,
      sort: query.sort,
      projection: query.projection
    });
  }
});

module.exports = { app, server };

