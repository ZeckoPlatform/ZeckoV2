const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');

// Main authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No auth token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check token type and get appropriate user
        let user;
        if (decoded.accountType === 'business') {
            user = await BusinessUser.findOne({ _id: decoded.userId });
        } else {
            user = await User.findOne({ _id: decoded.userId });
        }

        if (!user) {
            throw new Error('User not found');
        }

        // Set user info in request
        req.user = {
            id: user._id,
            email: user.email,
            role: decoded.accountType || user.role,
            accountType: decoded.accountType
        };
        
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Authentication failed' });
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
