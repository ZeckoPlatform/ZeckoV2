const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Main authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No auth token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Set both id and _id to ensure compatibility
        req.user = {
            id: decoded.userId,
            _id: decoded.userId
        };
        
        console.log('Auth middleware - user set:', req.user); // Debug log
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Admin check middleware
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
};

// Vendor check middleware
const isVendor = (req, res, next) => {
    if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Vendor privileges required.' });
    }
};

module.exports = {
    auth,
    isAdmin,
    isVendor
};
