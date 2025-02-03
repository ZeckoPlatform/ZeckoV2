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

// Core middleware (move these up before routes)
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

// Rate limiting
app.use('/api', RateLimitService.apiLimiter);
app.use('/api/auth', RateLimitService.authLimiter);
app.use('/api/users/register', RateLimitService.registrationLimiter);

// Custom middleware
app.use(sanitizeInput);
app.use(secureResponse);
app.use(performanceMonitor);

// Debug logging for routes
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log('Route handler:', {
            method: req.method,
            path: req.path,
            handlers: req.route?.stack?.map(layer => layer.handle.name || 'anonymous') || []
        });
        next();
    });
}

// Initialize database connection
(async () => {
    try {
        await dbService.connect();
        
        // API Routes - with logging
        console.log('Mounting routes...');
        
        const mountRoute = (path, router) => {
            console.log(`Mounting route at ${path}...`);
            console.log('Router methods:', Object.keys(router));
            app.use(path, router);
        };

        mountRoute('/api/auth', authRoutes);
        mountRoute('/api/users', userRoutes);
        mountRoute('/api/leads', leadRoutes);
        mountRoute('/api/products', productRoutes);
        mountRoute('/api/service-categories', serviceCategoryRoutes);
        mountRoute('/api/service-requests', serviceRequestRoutes);
        mountRoute('/api/messages', messageRoutes);
        mountRoute('/api/dashboard', dashboardRoutes);
        mountRoute('/api/credits', creditRoutes);
        mountRoute('/api/reviews', reviewRoutes);
        mountRoute('/api/projects', projectRoutes);
        mountRoute('/api/2fa', twoFactorAuthRoutes);
        mountRoute('/api/static', staticRoutes);

        // API 404 handler
        app.use('/api/*', (req, res) => {
            res.status(404).json({ message: 'API route not found' });
        });

        // Static files serving
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../client/build')));
            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
            });
        }

        // Error handling (must be last)
        app.use(errorHandler);

        // Start server
        const port = process.env.PORT || 5000;
        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });

    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
})();

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

