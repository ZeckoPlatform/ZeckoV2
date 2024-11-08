require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const initializeSocket = require('./socket');

// Import routes
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
const businessRoutes = require('./routes/businessRoutes'); // Only declare once
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

// Initialize socket
const io = initializeSocket(server);
global.connectedClients = new Map();
app.set('io', io);

// Middleware Setup
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount Routes
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityLogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/business/auth', businessAuthRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/vendor/auth', vendorAuthRoutes);
app.use('/api/addresses', addressRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    if (req.url.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error Handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB Connected');

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
    });
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = {
  io: () => io,
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
  }
};

