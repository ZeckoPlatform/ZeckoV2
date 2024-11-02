const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config();

// Debug logs at the top
console.log('Loading routes...');

// Import routes (only once)
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const activityLogRoutes = require('./routes/activityLogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Initialize global socket connections map
global.connectedClients = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('authenticate', (token) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            socket.userType = decoded.userType;

            if (!global.connectedClients.has(decoded.userId)) {
                global.connectedClients.set(decoded.userId, new Set());
            }
            global.connectedClients.get(decoded.userId).add(socket);

            console.log(`User ${decoded.userId} authenticated`);
            socket.emit('authenticated', { success: true });
        } catch (error) {
            console.error('Authentication error:', error);
            socket.emit('authenticated', { success: false, error: 'Invalid token' });
        }
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            const userSockets = global.connectedClients.get(socket.userId);
            if (userSockets) {
                userSockets.delete(socket);
                if (userSockets.size === 0) {
                    global.connectedClients.delete(socket.userId);
                }
            }
            console.log(`User ${socket.userId} disconnected`);
        }
        console.log('Client disconnected');
    });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

// Headers Middleware
app.use((req, res, next) => {
    req.maxHeadersCount = 100;
    req.setTimeout(5000);
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();
    next();
});

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Mount Routes
const mountRoute = (path, router) => {
    console.log(`Mounting route ${path}, type:`, typeof router);
    if (typeof router === 'function') {
        app.use(path, router);
    } else {
        console.error(`Invalid router for path ${path}:`, router);
    }
};

// API Routes
mountRoute('/api/users', userRoutes);
mountRoute('/api/products', productRoutes);
mountRoute('/api/cart', cartRoutes);
mountRoute('/api/orders', orderRoutes);
mountRoute('/api/checkout', checkoutRoutes);
mountRoute('/api/subscriptions', subscriptionRoutes);
mountRoute('/api/notifications', notificationRoutes);
mountRoute('/api/activity-logs', activityLogRoutes);
mountRoute('/api/admin', adminRoutes);
mountRoute('/api/reviews', reviewRoutes);
mountRoute('/api/analytics', analyticsRoutes);

// API Endpoints
app.get('/api/subscription-plans', (req, res) => {
    const subscriptionPlans = [
        { id: 1, name: 'Basic', price: 9.99, features: ['Feature 1', 'Feature 2'] },
        { id: 2, name: 'Pro', price: 19.99, features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        { id: 3, name: 'Enterprise', price: 29.99, features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] },
    ];
    res.json(subscriptionPlans);
});

app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to ZeckoV2 API' });
});

// Production Setup - Update this section
if (process.env.NODE_ENV === 'production') {
    // Log the build path
    console.log('Serving static files from:', path.join(__dirname, '../client/build'));
    
    // Serve static files from the client/build directory
    app.use(express.static(path.join(__dirname, '../client/build')));
    
    // Handle all other routes by serving the index.html
    app.get('*', (req, res, next) => {
        if (req.url.startsWith('/api/')) {
            return next();
        }
        console.log('Serving index.html for path:', req.path);
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Process Error Handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Socket helper functions
const socketHelpers = {
    getIO: () => io,
    notifyAdmins: (type, notification) => {
        global.connectedClients.forEach((sockets, userId) => {
            sockets.forEach(socket => {
                if (socket.userType === 'admin') {
                    socket.emit(type, notification);
                }
            });
        });
    },
    sendNotificationToUser: (userId, notification) => {
        const userSockets = global.connectedClients.get(userId);
        if (userSockets) {
            userSockets.forEach(socket => {
                socket.emit('notification', notification);
            });
        }
    },
    broadcastActivity: (activity) => {
        io.emit('activityUpdate', activity);
    }
};

// Start Server
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Exports
module.exports = {
    io: socketHelpers.getIO,
    ...socketHelpers
};

