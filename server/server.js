require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const productRoutes = require('./routes/productRoutes');
const morgan = require('morgan');
const connectDB = require('./config/db');
const timeout = require('express-timeout-handler');
// const serviceRoutes = require('./routes/services');
const jobRoutes = require('./routes/api/lead');
const userRoutes = require('./routes/userRoutes');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting configuration
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,
    keyGenerator: (req) => {
        return req.headers['x-forwarded-for']?.split(',')[0].trim() || 
               req.socket.remoteAddress;
    }
});

// Trust proxy for Heroku
app.set('trust proxy', 1);

// Apply rate limiting to API routes
app.use('/api/', limiter);

// Middleware Setup
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Add before your routes
app.use(morgan('combined'));

// Add response time header
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    next();
});

// Add before routes
app.use(timeout.handler({
    timeout: 120000,
    onTimeout: function(req, res) {
        console.error('Request timeout:', req.url);
        res.status(503).json({
            error: 'Service temporarily unavailable. Please try again.'
        });
    }
}));

// Add performance monitoring middleware at the top of your middleware stack
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) { // Log slow requests (over 1 second)
            console.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
        }
    });
    next();
});

// Optimize static file serving
app.use(express.static(path.join(__dirname, '../client/build'), {
    maxAge: '1d', // Cache static files for 1 day
    etag: true,
    lastModified: true
}));

// Import routes with error handling
let routes = {};

try {
    // Define route paths
    const routePaths = {
        auth: './routes/auth',
        user: './routes/userRoutes',
        product: './routes/productRoutes'
    };

    // Import routes with error handling for each
    Object.entries(routePaths).forEach(([name, path]) => {
        try {
            const fullPath = `${__dirname}/${path}.js`;
            if (fs.existsSync(fullPath)) {
                routes[name] = require(path);
                console.log(`Successfully loaded ${name} routes from ${path}`);
            } else {
                console.warn(`Route file not found: ${fullPath}`);
            }
        } catch (error) {
            console.error(`Error loading ${name} routes:`, error.message);
        }
    });
} catch (error) {
    console.error('Error during route import:', error.message);
}

// Register routes with error checking
if (routes.auth) {
    app.use('/api/auth', routes.auth);
}

// Then register other routes
Object.entries(routes).forEach(([name, router]) => {
    if (router && name !== 'auth') {
        app.use(`/api/${name}`, router);
        console.log(`Registered route: /api/${name}`);
    }
});

// Register product routes with error handling
try {
    console.log('Registering product routes...');
    app.use('/api/products', productRoutes);
    console.log('Product routes registered successfully');
} catch (error) {
    console.error('Error registering product routes:', error);
}

// Add route-specific timeout handling
app.use('/api/products', timeout.handler({
    timeout: 30000,
    onTimeout: function(req, res) {
        console.error('Product route timeout:', req.url);
        res.status(503).json({
            error: 'Request timeout while fetching products'
        });
    }
}));

// Optimize MongoDB connection options
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 2
};

// Remove the duplicate mongoose.connect call
mongoose.set('strictQuery', false);

// Modify the startServer function with better retry logic
const startServer = async () => {
    let retries = 5;
    
    while (retries > 0) {
        try {
            console.log(`Attempting to connect to MongoDB (${retries} retries left)...`);
            
            // Connect to MongoDB with timeout
            await Promise.race([
                mongoose.connect(process.env.MONGODB_URI, mongooseOptions),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('MongoDB connection timeout')), 30000)
                )
            ]);
            
            console.log('Successfully connected to MongoDB');
            
            // Start server only after successful DB connection
            const PORT = process.env.PORT || 5000;
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`Server running on port ${PORT}`);
                console.log('Environment:', process.env.NODE_ENV);
            });
            
            return; // Exit the retry loop on success
            
        } catch (error) {
            console.error('Server startup error:', error);
            retries--;
            
            if (retries === 0) {
                console.error('Max retries reached. Exiting...');
                process.exit(1);
            }
            
            // Wait before retrying
            console.log('Waiting 5 seconds before retrying...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

// Add MongoDB connection event handlers
mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
    // Monitor connection pool
    setInterval(() => {
        const poolStats = mongoose.connection.db.admin().serverStatus();
        console.log('MongoDB pool stats:', {
            active: poolStats.connections?.current,
            available: poolStats.connections?.available,
            pending: poolStats.connections?.pending
        });
    }, 60000); // Check every minute
});

// Optimize compression
app.use(compression({
    level: 6,
    threshold: 10 * 1024, // Only compress responses above 10KB
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Serve static files in production with optimized settings
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        
        // Add caching headers
        res.set({
            'Cache-Control': 'public, max-age=86400',
            'Expires': new Date(Date.now() + 86400000).toUTCString()
        });
        
        res.sendFile(path.join(__dirname, '../client/build/index.html'), err => {
            if (err) {
                console.error('Error serving static file:', err);
                res.status(500).send('Error loading page');
            }
        });
    });
}

// Add request timeout handling
const requestTimeout = 30000; // 30 seconds
app.use((req, res, next) => {
    req.setTimeout(requestTimeout, () => {
        console.error(`Request timeout: ${req.method} ${req.url}`);
        res.status(503).json({ error: 'Request timeout' });
    });
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle specific errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Default error
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// Add these settings
const serverConfig = {
    web_concurrency: process.env.WEB_CONCURRENCY || 1,
    port: process.env.PORT || 5000,
    connection_timeout: 60000,
};

// Add MongoDB connection monitoring
mongoose.connection.on('connected', () => {
    // Test database connection
    mongoose.connection.db.admin().ping()
        .then(() => console.log('MongoDB responding to ping'))
        .catch(err => console.error('MongoDB ping failed:', err));
});

// Add error handling specific to product routes
app.use('/api/products', (err, req, res, next) => {
    console.error('Product route error:', err);
    res.status(503).json({
        error: 'Service temporarily unavailable',
        message: process.env.NODE_ENV === 'production' 
            ? 'Error processing product request' 
            : err.message
    });
});

// Add graceful shutdown handling
const gracefulShutdown = async () => {
    try {
        console.log('Received shutdown signal. Starting graceful shutdown...');
        
        await new Promise((resolve) => {
            server.close(resolve);
            console.log('Server closed');
        });
        
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

// Handle various shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});

// Start the server
startServer().catch(error => {
    console.error('Fatal error during server startup:', error);
    process.exit(1);
});

// Export for testing
module.exports = {
    app,
    server
};

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const leadRoutes = require('./routes/api/lead');

// Apply routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);

app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

