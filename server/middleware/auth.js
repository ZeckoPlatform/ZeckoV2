const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const cache = require('memory-cache');

// Main authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authorization token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Handle both formats of user ID in token
        req.user = {
            id: decoded.userId || decoded.id,
            userId: decoded.userId || decoded.id,
            role: decoded.role,
            accountType: decoded.accountType
        };

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Please authenticate' });
    }
};

// Role-based middleware with caching
const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }
    };
};

// Simplified role checks using checkRole
const isAdmin = checkRole(['admin']);
const isVendor = checkRole(['vendor', 'admin']);

// Change authenticateToken to auth for consistency
const authenticateToken = auth;  // Add this line to maintain backward compatibility

module.exports = {
    auth,
    authenticateToken, // For backward compatibility
    isAdmin,
    isVendor
};

