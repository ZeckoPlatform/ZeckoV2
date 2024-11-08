const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const initializeSocket = require('./socket');

dotenv.config();

// Debug logs at the top
console.log('Loading routes...');

// Import routes (keep your existing route imports)
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
const dashboardRoutes = require('./routes/dashboardRoutes');
const jobRoutes = require('./routes/jobRoutes');
const businessRoutes = require('./routes/businessRoutes');
const securityRoutes = require('./routes/securityRoutes');
const businessAuthRoutes = require('./routes/businessAuth');
const vendorAuthRoutes = require('./routes/vendorAuth');
const addressRoutes = require('./routes/addressRoutes');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "https://zeckov2-deceb43992ac.herokuapp.com",
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize socket with the server
const io = initializeSocket(server);

// Initialize global socket clients map
global.connectedClients = new Map();

// Add socket instance to app context
app.set('io', io);

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

// Mount Routes helper
const mountRoute = (path, router) => {
    console.log(`Mounting route ${path}`);
    if (typeof router === 'function') {
        app.use(path, router);
    } else {
        console.error(`Invalid router for path ${path}:`, router);
    }
};

// Mount your routes (keep your existing route mounting)
mountRoute('/api/auth', userRoutes);
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
mountRoute('/api/dashboard', dashboardRoutes);
mountRoute('/api/admin/dashboard', adminRoutes);
mountRoute('/api/jobs', jobRoutes);
mountRoute('/api/businesses', businessRoutes);
mountRoute('/api/security-settings', securityRoutes);
mountRoute('/api', productRoutes);
mountRoute('/api/business', businessAuthRoutes);
mountRoute('/api/vendor', vendorAuthRoutes);
mountRoute('/api/users/addresses', addressRoutes);
mountRoute('/api/business/addresses', addressRoutes);
mountRoute('/api/vendor/addresses', addressRoutes);

// Add this before your routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Add this with your other route imports
const businessRoutes = require('./routes/businessRoutes');

// Add this with your other route middleware
app.use('/api/business', businessRoutes);

// API Endpoints (keep your existing endpoints)
app.get('/api/subscription-plans', (req, res) => {
    const subscriptionPlans = [
        { id: 1, name: 'Basic', price: 9.99, features: ['Feature 1', 'Feature 2'] },
        { id: 2, name: 'Pro', price: 19.99, features: ['Feature 1', 'Feature 2', 'Feature 3'] },
        { id: 3, name: 'Enterprise', price: 29.99, features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] },
    ];
    res.json(subscriptionPlans);
});

// Production Setup
if (process.env.NODE_ENV === 'production') {
    console.log('Serving static files from:', path.join(__dirname, '../client/build'));
    app.use(express.static(path.join(__dirname, '../client/build')));
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
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Process Error Handlers
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Socket helpers
const socketHelpers = {
    getIO: () => io,
    
    notifyAdmins: (type, notification) => {
        try {
            global.connectedClients.forEach((sockets, userId) => {
                sockets.forEach(socket => {
                    if (socket.user?.role === 'admin') {
                        socket.emit(type, notification);
                    }
                });
            });
        } catch (error) {
            console.error('Error notifying admins:', error);
        }
    },

    sendNotificationToUser: (userId, notification) => {
        try {
            const userSockets = global.connectedClients.get(userId);
            if (userSockets) {
                userSockets.forEach(socket => {
                    socket.emit('notification', notification);
                });
            }
        } catch (error) {
            console.error('Error sending notification to user:', error);
        }
    },

    broadcastActivity: (activity) => {
        try {
            io.emit('activityUpdate', activity);
        } catch (error) {
            console.error('Error broadcasting activity:', error);
        }
    }
};

// Start Server
const port = process.env.PORT || 5000;
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected');

        server.listen(port, () => {
            console.log(`Server running on port ${port}`);
            console.log('Environment:', process.env.NODE_ENV);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startServer();

// Exports
module.exports = {
    io: socketHelpers.getIO,
    ...socketHelpers
};

