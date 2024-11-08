const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');

// Main authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No auth token' });
        }

        console.log('Token received:', token.substring(0, 20) + '...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', {
            userId: decoded.userId,
            accountType: decoded.accountType,
            role: decoded.role
        });

        // Ensure userId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            throw new Error('Invalid user ID format');
        }

        let user;
        if (decoded.accountType === 'business') {
            user = await BusinessUser.findById(decoded.userId)
                .select('-password')
                .lean();
            console.log('Business user found:', !!user);
        } else {
            user = await User.findById(decoded.userId)
                .select('-password')
                .lean();
            console.log('Regular user found:', !!user);
        }

        if (!user) {
            console.log('No user found for ID:', decoded.userId);
            throw new Error('User not found');
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: decoded.accountType || user.role,
            accountType: decoded.accountType,
            businessName: user.businessName // Include for business users
        };
        
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
