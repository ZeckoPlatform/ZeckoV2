const express = require('express');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const timeout = require('connect-timeout');
const validationMiddleware = require('../middleware/validation');
const userController = require('../controllers/userController');
const refreshTokenLimiter = require('../middleware/refreshTokenRateLimit');
const RateLimitService = require('../services/rateLimitService');
const { AppError } = require('../utils/appError');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Add this debug logging
console.log('Available controller methods:', Object.keys(userController));

const router = express.Router();

// Basic middleware
router.use(timeout('25s'));
router.use((req, res, next) => {
    if (!req.timedout) next();
});

// Helper function
const formatAccountType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
};

// Debug logging
console.log('Setting up routes with controller methods:', Object.keys(userController));

// Authentication routes (POST methods first)
router.post('/register', RateLimitService.registrationLimiter, userController.register);
router.post('/login', RateLimitService.authLimiter, [
    body('email').isEmail(),
    body('password').exists(),
    handleValidationErrors
], userController.login);
router.post('/logout', authenticateToken, userController.logout);
router.post('/refresh-token', RateLimitService.refreshTokenLimiter, userController.refreshToken);
router.post('/change-password', authenticateToken, userController.changePassword);
router.post('/forgot-password', RateLimitService.passwordResetLimiter, async (req, res) => {
    try {
        const { email, accountType = 'user' } = req.body;
        
        let Model;
        switch(accountType.toLowerCase()) {
            case 'business':
                Model = BusinessUser;
                break;
            case 'vendor':
                Model = VendorUser;
                break;
            default:
                Model = User;
        }

        const user = await Model.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.generatePasswordReset();
        // TODO: Send password reset email using your email service
        
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Error processing request' });
    }
});
router.post('/reset-password/:token', RateLimitService.passwordResetLimiter, async (req, res) => {
    try {
        const { password, accountType = 'user' } = req.body;
        
        let Model;
        switch(accountType.toLowerCase()) {
            case 'business':
                Model = BusinessUser;
                break;
            case 'vendor':
                Model = VendorUser;
                break;
            default:
                Model = User;
        }

        const user = await Model.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// Protected GET routes
router.get('/profile', authenticateToken, userController.getProfile);
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        console.log('Verify endpoint called with user:', req.user);
        
        let Model;
        switch(req.user.accountType) {
            case 'business':
                Model = BusinessUser;
                break;
            case 'vendor':
                Model = VendorUser;
                break;
            default:
                Model = User;
        }

        const user = await Model.findById(req.user.userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = {
            id: user._id,
            userId: user._id,
            email: user.email,
            username: user.username || user.email,
            accountType: req.user.accountType.toLowerCase(),
            role: user.role,
            createdAt: user.createdAt,
            avatarUrl: user.avatarUrl || null,
            address: user.address || '',
            phone: user.phone || '',
            businessName: ['business', 'vendor'].includes(req.user.accountType) ? user.businessName : '',
            vendorCategory: req.user.accountType === 'vendor' ? user.vendorCategory : undefined,
            serviceCategories: req.user.accountType === 'business' ? user.serviceCategories : undefined
        };

        console.log('Verify response:', userData);
        res.json({ user: userData, verified: true });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error during verification' });
    }
});

// Protected PUT routes
router.put('/profile', authenticateToken, userController.updateProfile);

// Final debug check
router.stack
    .filter(r => r.route)
    .forEach(r => {
        console.log(`Route: ${r.route.path}, Methods: ${Object.keys(r.route.methods)}`);
    });

module.exports = router; 