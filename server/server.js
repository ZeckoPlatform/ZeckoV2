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
    max: 100,
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

// Move auth routes registration before other routes
app.use('/api/auth', routes.auth);

// Then register other routes
Object.entries(routes).forEach(([name, router]) => {
    if (router && name !== 'auth') {
        app.use(`/api/${name}`, router);
        console.log(`Registered route: /api/${name}`);
    }
});

// Register routes
try {
    app.use('/api/products', productRoutes);
    console.log('Successfully loaded product routes');
} catch (error) {
    console.error('Error loading product routes:', error.message);
}

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
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server function
const startServer = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            heartbeatFrequencyMS: 30000
        });
        console.log('Connected to MongoDB');

        // Start server
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

// Start the server
startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

// Export for testing
module.exports = {
    app,
    server
};

