require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

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
app.use(cors({
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
  ]
}));

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

app.use(express.static(path.join(__dirname, '../client/build'), staticOptions));

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

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  }
});

// Optimize error handling
app.use((err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: true,
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred' 
        : err.message,
      code: err.code || 'INTERNAL_ERROR'
    });
  }

  // For client routes, return index.html
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

