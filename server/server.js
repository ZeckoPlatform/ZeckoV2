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
const serviceRoutes = require('./routes/services');

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

// Import routes with error handling
let routes = {};

try {
    // Define route paths
    const routePaths = {
        auth: './routes/auth',
        user: './routes/userRoutes',
        product: './routes/productRoutes',
        job: './routes/jobRoutes'
    };

    // Import routes with error handling for each
    Object.entries(routePaths).forEach(([name, path]) => {
        try {
            if (fs.existsSync(`${__dirname}/${path}.js`)) {
                routes[name] = require(path);
                console.log(`Successfully loaded ${name} routes from ${path}`);
            } else {
                console.warn(`Route file not found: ${path}.js`);
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

// Register routes
try {
    console.log('Loading product routes from:', './routes/productRoutes');
    app.use('/api/products', productRoutes);
    console.log('Successfully loaded product routes');
} catch (error) {
    console.error('Error loading product routes:', error);
}

app.use('/api/services', serviceRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../client/build/index.html'));
        }
    });
}

// Error handling middleware
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

// Modify MongoDB options to be more conservative
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 75000,
    connectTimeoutMS: 30000,
    heartbeatFrequencyMS: 30000,
    maxPoolSize: 10,        // Reduced from 50
    minPoolSize: 2,         // Reduced from 5
    maxIdleTimeMS: 60000,
    retryWrites: true,
    w: 'majority',
    autoIndex: true,
    serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true
    }
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
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
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

