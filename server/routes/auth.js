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
const RateLimitService = require('../services/rateLimitService');
const { AppError } = require('../utils/appError');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Add this debug logging
console.log('Available controller methods:', Object.keys(userController));

// Debug the actual controller object
console.log('userController object:', userController);
console.log('userController.register type:', typeof userController.register);
console.log('userController.login type:', typeof userController.login);

// Add debug logging for RateLimitService
console.log('RateLimitService methods:', Object.keys(RateLimitService));

const router = express.Router();

// Basic middleware
router.use(timeout('25s'));
router.use((req, res, next) => {
    if (!req.timedout) next();
});

// Verify RateLimitService methods exist
if (!RateLimitService || !RateLimitService.registrationLimiter) {
    console.error('RateLimitService or its methods are not properly defined');
    throw new Error('Rate limit service not properly configured');
}

// Helper function
const formatAccountType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
};

// Debug logging
console.log('Setting up routes with controller methods:', Object.keys(userController));

// Authentication routes (POST methods first)
router.post('/register', 
    (req, res, next) => {
        if (RateLimitService && typeof RateLimitService.registrationLimiter === 'function') {
            RateLimitService.registrationLimiter(req, res, next);
        } else {
            next();
        }
    },
    async (req, res, next) => {
        try {
            await userController.register(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/login', 
    (req, res, next) => {
        if (RateLimitService && typeof RateLimitService.authLimiter === 'function') {
            RateLimitService.authLimiter(req, res, next);
        } else {
            next();
        }
    },
    [
        body('email').isEmail(),
        body('password').exists(),
        handleValidationErrors
    ],
    async (req, res, next) => {
        try {
            await userController.login(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/logout', 
    authenticateToken,
    async (req, res, next) => {
        try {
            await userController.logout(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/refresh-token', 
    (req, res, next) => {
        if (RateLimitService && typeof RateLimitService.authLimiter === 'function') {
            RateLimitService.authLimiter(req, res, next);
        } else {
            next();
        }
    },
    async (req, res, next) => {
        try {
            await userController.refreshToken(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/change-password', 
    authenticateToken,
    async (req, res, next) => {
        try {
            await userController.changePassword(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/forgot-password', 
    (req, res, next) => {
        if (RateLimitService && typeof RateLimitService.passwordResetLimiter === 'function') {
            RateLimitService.passwordResetLimiter(req, res, next);
        } else {
            next();
        }
    },
    async (req, res) => {
        try {
            const { email, accountType = 'user' } = req.body;
            let Model = accountType.toLowerCase() === 'business' ? BusinessUser : 
                       accountType.toLowerCase() === 'vendor' ? VendorUser : User;
            
            const user = await Model.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await user.generatePasswordReset();
            res.json({ message: 'Password reset email sent' });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Error processing request' });
        }
    }
);

router.post('/reset-password/:token', 
    (req, res, next) => {
        if (RateLimitService && typeof RateLimitService.passwordResetLimiter === 'function') {
            RateLimitService.passwordResetLimiter(req, res, next);
        } else {
            next();
        }
    },
    async (req, res) => {
        try {
            const { password, accountType = 'user' } = req.body;
            let Model = accountType.toLowerCase() === 'business' ? BusinessUser : 
                       accountType.toLowerCase() === 'vendor' ? VendorUser : User;

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
    }
);

// Protected GET routes
router.get('/profile', 
    authenticateToken,
    async (req, res, next) => {
        try {
            await userController.getProfile(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

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

// Single PUT route for profile
router.put('/profile', 
    authenticateToken,
    async (req, res, next) => {
        try {
            await userController.updateProfile(req, res, next);
        } catch (error) {
            next(error);
        }
    }
);

// Debug logging
router.stack
    .filter(r => r.route)
    .forEach(r => {
        console.log(`Route configured: ${r.route.path} [${Object.keys(r.route.methods)}]`);
    });

// Add final check for rate limiters
console.log('Rate limiters configured:', {
    registration: !!RateLimitService.registrationLimiter,
    auth: !!RateLimitService.authLimiter,
    refreshToken: !!RateLimitService.refreshTokenLimiter,
    passwordReset: !!RateLimitService.passwordResetLimiter
});

// Add debug logging for rate limiters
console.log('RateLimitService status:', {
    exists: !!RateLimitService,
    registrationLimiter: typeof RateLimitService?.registrationLimiter,
    authLimiter: typeof RateLimitService?.authLimiter,
    passwordResetLimiter: typeof RateLimitService?.passwordResetLimiter
});

// Add debug logging for userController methods
console.log('userController logout method:', {
    exists: !!userController?.logout,
    type: typeof userController?.logout
});

module.exports = router; 