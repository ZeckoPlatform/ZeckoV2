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

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later.' }
});

app.use('/api/', limiter);

// Optimize compression
app.use(compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));

// Configure CORS with expanded headers
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://zeckov2-deceb43992ac.herokuapp.com']
        : ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cache-Control', 
        'Pragma', 
        'Expires'
    ],
    maxAge: 600
};

app.use(cors(corsOptions));

// Static files with optimized caching
const staticOptions = {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        // Long cache for static assets with hash in filename
        if (path.includes('.chunk.') || path.includes('main.') || path.includes('runtime.')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
        } else if (path.endsWith('.html')) {
            // No cache for HTML files
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else {
            // Moderate cache for other static files
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
    }
};

if (process.env.NODE_ENV === 'production') {
    try {
        app.use(express.static(path.join(__dirname, '../client/build'), staticOptions));
        app.get('*', (req, res) => {
            if (!req.path.startsWith('/api')) {
                res.sendFile(path.join(__dirname, '../client/build/index.html'));
            }
        });
    } catch (error) {
        console.error('Static file serving error:', error);
    }
}

// API middleware with optimized headers
app.use('/api', (req, res, next) => {
    res.set({
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '-1',
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    next();
});

// Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize socket with error handling
let io;
try {
    const initializeSocket = require('./socket');
    io = initializeSocket(server);
    global.connectedClients = new Map();
    app.set('io', io);
} catch (error) {
    console.error('Socket initialization error:', error);
}

// Import routes
const authRoutes = require('./routes/auth');  // Changed from authRoutes to auth
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const jobRoutes = require('./routes/api/jobRoutes');

// API Routes
try {
    // Import and use routes with error handling
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/jobs', jobRoutes);
} catch (error) {
    console.error('Route loading error:', error);
}

// Add this after your routes are registered
console.log('Registered routes:', 
  app._router.stack
    .filter(r => r.route)
    .map(r => `${Object.keys(r.route.methods)} ${r.route.path}`)
);

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    }
});

// Enhanced error handling
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString(),
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    if (req.path.startsWith('/api/')) {
        return res.status(err.status || 500).json({
            error: true,
            message: process.env.NODE_ENV === 'production' 
                ? 'An error occurred' 
                : err.message,
            code: err.code || 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        });
    }

    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Handle 404s
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            error: true,
            message: 'API endpoint not found'
        });
    } else {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    }
});

// Check directory structure
const checkDirectoryStructure = () => {
    const requiredDirs = [
        './routes',
        './routes/api',
        './models',
        './middleware'
    ];

    requiredDirs.forEach(dir => {
        if (!fs.existsSync(path.join(__dirname, dir))) {
            console.error(`Required directory ${dir} not found`);
            process.exit(1);
        }
    });
};

const startServer = async () => {
    try {
        checkDirectoryStructure();
        // Add this before connecting to MongoDB
        mongoose.set('strictQuery', false);

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Use the PORT environment variable provided by Heroku
        const PORT = process.env.PORT || 5000;
        
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV);
            console.log('MongoDB URI:', process.env.MONGODB_URI.split('@')[1]); // Log only the host part
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

startServer();

module.exports = {
    io: () => io,
    notifyAdmins: (type, notification) => {
        try {
            if (!global.connectedClients) return;
            
            const adminSockets = Array.from(global.connectedClients.entries())
                .filter(([_, sockets]) => 
                    sockets.some(socket => socket.user?.role === 'admin')
                );

            adminSockets.forEach(([_, sockets]) => {
                sockets.forEach(socket => {
                    if (socket.user?.role === 'admin') {
                        socket.emit(type, notification);
                    }
                });
            });
        } catch (error) {
            console.error('Error notifying admins:', error);
        }
    }
};

// Add after route registration
const validateRoutes = () => {
    const requiredRoutes = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/verify'
    ];

    const registeredPaths = app._router.stack
        .filter(r => r.route)
        .map(r => r.route.path);

    requiredRoutes.forEach(route => {
        if (!registeredPaths.includes(route)) {
            console.warn(`Warning: Required route ${route} is not registered`);
        }
    });
};

// Call after registering routes
validateRoutes();

