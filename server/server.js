require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const cors = require('cors');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { Server } = require('socket.io');
const fs = require('fs');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/api/profile');
const leadRoutes = require('./routes/api/lead');
const productRoutes = require('./routes/productRoutes');
const serviceCategoryRoutes = require('./routes/serviceCategoryRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://zeckov2-deceb43992ac.herokuapp.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: '/socket.io'
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Set up static file serving for uploads
const uploadsPath = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// Mount routes
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/products', productRoutes);
app.use('/api', serviceCategoryRoutes);
app.use('/api', serviceRequestRoutes);
app.use('/api', messageRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: err.message });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
.catch(err => {
    console.error('MongoDB connection error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        mongoose.connection.close();
        process.exit(0);
    });
});

module.exports = { app, server };

