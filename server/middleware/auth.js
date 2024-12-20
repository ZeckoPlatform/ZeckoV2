const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const cache = require('memory-cache');

// Main authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ message: 'No auth token' });
        }

        // Check token cache first
        const cachedUser = cache.get(`auth_${token}`);
        if (cachedUser) {
            // Add business cache check
            const cachedBusiness = cache.get(`business_${cachedUser.id}`);
            if (cachedBusiness) {
                req.user = cachedUser;
                req.business = cachedBusiness;
                return next();
            }
        }

        console.log('Token received:', token.substring(0, 20) + '...');
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', {
            userId: decoded.userId,
            accountType: decoded.accountType,
            role: decoded.role
        });

        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            throw new Error('Invalid user ID format');
        }

        let user;
        const userQuery = decoded.accountType === 'business' ? 
            BusinessUser.findById(decoded.userId) :
            User.findById(decoded.userId);

        user = await userQuery
            .select('-password -__v')
            .lean()
            .exec();

        if (!user) {
            console.log('No user found for ID:', decoded.userId);
            throw new Error('User not found');
        }

        const userData = {
            id: user._id,
            email: user.email,
            role: decoded.accountType || user.role,
            accountType: decoded.accountType,
            businessName: user.businessName
        };

        // Cache user data for 5 minutes
        cache.put(`auth_${token}`, userData, 5 * 60 * 1000);
        
        // Add error handling for token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            throw new Error('Token has expired');
        }
        
        req.user = userData;
        next();
    } catch (error) {
        console.error('Auth middleware error:', {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
        
        // Enhanced error handling
        const errorResponse = {
            message: 'Authentication failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        };

        // Specific error handling for different scenarios
        if (error.name === 'JsonWebTokenError') {
            errorResponse.message = 'Invalid token';
        } else if (error.name === 'TokenExpiredError') {
            errorResponse.message = 'Token has expired';
        }
        
        res.status(401).json(errorResponse);
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

