const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');

const socketAuth = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.accountType === 'business') {
            user = await BusinessUser.findById(decoded.userId);
        } else {
            user = await User.findById(decoded.userId);
        }

        if (!user) {
            return next(new Error('User not found'));
        }

        socket.user = {
            id: user._id,
            accountType: decoded.accountType,
            role: user.role
        };
        
        next();
    } catch (error) {
        console.error('Socket auth error:', error);
        next(new Error('Authentication error'));
    }
};

module.exports = socketAuth; 