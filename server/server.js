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

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/api/lead');
const productRoutes = require('./routes/productRoutes');

// Initialize Express and create server
const app = express();
const server = http.createServer(app);

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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/products', productRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
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

