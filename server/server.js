const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

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

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Debug route types
console.log({
    userRoutes: typeof userRoutes,
    productRoutes: typeof productRoutes,
    cartRoutes: typeof cartRoutes,
    orderRoutes: typeof orderRoutes,
    checkoutRoutes: typeof checkoutRoutes,
    subscriptionRoutes: typeof subscriptionRoutes,
    notificationRoutes: typeof notificationRoutes,
    activityLogRoutes: typeof activityLogRoutes,
    adminRoutes: typeof adminRoutes,
    reviewRoutes: typeof reviewRoutes,
    analyticsRoutes: typeof analyticsRoutes
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add headers middleware
app.use((req, res, next) => {
    // Increase header limits
    req.maxHeadersCount = 100;
    req.setTimeout(5000);
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    // Option 1: Send 204 No Content
    res.status(204).end();
    
    // OR Option 2: Send an actual favicon if you have one
    // res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// Mount routes with debugging
const mountRoute = (path, router) => {
    console.log(`Mounting route ${path}, type:`, typeof router);
    if (typeof router === 'function') {
        app.use(path, router);
    } else {
        console.error(`Invalid router for path ${path}:`, router);
    }
};

// Mount routes using the helper function
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

// Debug log
console.log('Routes mounted');

// Subscription plans route
app.get('/api/subscription-plans', (req, res) => {
  const subscriptionPlans = [
    { id: 1, name: 'Basic', price: 9.99, features: ['Feature 1', 'Feature 2'] },
    { id: 2, name: 'Pro', price: 19.99, features: ['Feature 1', 'Feature 2', 'Feature 3'] },
    { id: 3, name: 'Enterprise', price: 29.99, features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'] },
  ];
  res.json(subscriptionPlans);
});

// Welcome route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to ZeckoV2 API' });
});

// Socket.io connection handling
const connectedClients = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userType = decoded.userType;

      if (!connectedClients.has(decoded.userId)) {
        connectedClients.set(decoded.userId, new Set());
      }
      connectedClients.get(decoded.userId).add(socket);

      // Emit admin stats if user is admin
      if (decoded.userType === 'admin') {
        emitAdminStats(socket);
      }

      console.log(`User ${decoded.userId} authenticated`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Authentication error:', error);
      socket.emit('authenticated', { success: false, error: 'Invalid token' });
    }
  });

  // Existing socket event handlers...
  socket.on('order_created', async (order) => {
    if (socket.userId) {
      try {
        await ActivityLog.create({
          userId: socket.userId,
          type: 'order_created',
          description: `New order created: #${order.orderNumber}`,
          metadata: { orderId: order._id }
        });

        // Notify admin of new order
        notifyAdmins('new_order', {
          message: `New order #${order.orderNumber} created`,
          data: order
        });

        if (order.items) {
          const vendorIds = new Set(order.items.map(item => item.product.seller));
          vendorIds.forEach(vendorId => {
            sendNotificationToUser(vendorId, {
              type: 'new_order',
              message: `New order received: #${order.orderNumber}`,
              data: order
            });
          });
        }
      } catch (error) {
        console.error('Error handling order creation:', error);
      }
    }
  });

  // Add admin-specific socket events
  socket.on('admin_request_stats', () => {
    if (socket.userType === 'admin') {
      emitAdminStats(socket);
    }
  });

  // Existing disconnect handler...
  socket.on('disconnect', () => {
    if (socket.userId) {
      const userSockets = connectedClients.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          connectedClients.delete(socket.userId);
        }
      }
      console.log(`User ${socket.userId} disconnected`);
    }
    console.log('Client disconnected');
  });
});

// Helper function to emit admin stats
async function emitAdminStats(socket) {
  try {
    const stats = await require('./controllers/adminController').getAdminStats();
    socket.emit('admin_stats_update', stats);
  } catch (error) {
    console.error('Error emitting admin stats:', error);
  }
}

// Helper function to notify all admin users
function notifyAdmins(type, notification) {
  connectedClients.forEach((sockets, userId) => {
    sockets.forEach(socket => {
      if (socket.userType === 'admin') {
        socket.emit(type, notification);
      }
    });
  });
}

// Existing notification helper functions...
function sendNotificationToUser(userId, notification) {
  const userSockets = connectedClients.get(userId);
  if (userSockets) {
    userSockets.forEach(socket => {
      socket.emit('notification', notification);
    });
  }
}

function sendActivityNotification(userId, activity) {
  const userSockets = connectedClients.get(userId);
  if (userSockets) {
    userSockets.forEach(socket => {
      socket.emit('activity_update', activity);
    });
  }
}

function sendOrderNotification(userId, orderData) {
  const userSockets = connectedClients.get(userId);
  if (userSockets) {
    userSockets.forEach(socket => {
      socket.emit('order_notification', orderData);
    });
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    // Serve static files
    app.use(express.static(path.join(__dirname, '../build')));
    
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        // Skip API routes
        if (req.url.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(__dirname, '../build', 'index.html'));
    });
}

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

module.exports = { 
  io, 
  sendNotificationToUser, 
  sendActivityNotification,
  sendOrderNotification,
  notifyAdmins
};

// Debug route exports
console.log('userRoutes type:', typeof userRoutes);
console.log('activityLogRoutes type:', typeof activityLogRoutes);
console.log('adminRoutes type:', typeof adminRoutes);

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});

// Add near the top after dotenv.config()
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});
