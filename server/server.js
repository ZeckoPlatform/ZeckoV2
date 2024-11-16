require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Configure CORS with expanded headers
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://zeckov2-deceb43992ac.herokuapp.com' 
    : 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Cache-Control', 
    'Pragma', 
    'Expires'
  ]
}));

// Add cache control middleware
app.use((req, res, next) => {
  // Add cache headers for API routes
  if (req.path.startsWith('/api/')) {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Add content type middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.type('application/json');
  }
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Import and use routes with error handling
try {
  const userRoutes = require('./routes/userRoutes');
  const productRoutes = require('./routes/productRoutes');
  // ... other route imports

  // API Routes
  app.use('/api/auth', userRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/products', productRoutes);
  // ... other route uses
} catch (error) {
  console.error('Route loading error:', error);
}

// The "catchall" handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Ensure JSON response for API routes
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: true,
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message
    });
  }

  next(err);
});

const startServer = async () => {
  try {
    // Add this before connecting to MongoDB
    mongoose.set('strictQuery', false);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
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

