const jwt = require('jsonwebtoken');

// Main authentication middleware
const auth = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        // Check if no token
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

// Admin authentication middleware
const adminAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
    });
};

// Vendor authentication middleware (if needed)
const vendorAuth = (req, res, next) => {
    auth(req, res, () => {
        if (req.user && (req.user.role === 'vendor' || req.user.role === 'admin')) {
            next();
        } else {
            res.status(403).json({ error: 'Access denied. Vendor privileges required.' });
        }
    });
};

module.exports = {
    auth,
    adminAuth,
    vendorAuth
};
