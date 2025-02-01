const express = require('express');
const router = express.Router();
const path = require('path');
const { protect: authenticateToken } = require('../middleware/auth');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const mongoose = require('mongoose');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cache = require('../middleware/cache');
const redis = require('../config/redis');
const userController = require('../controllers/userController');
const RateLimitService = require('../services/rateLimitService');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

console.log('Loading userRoutes.js - START');

// Debug logging for userController methods
console.log('Available controller methods:', Object.keys(userController));
console.log('userController object:', userController);
console.log('userController.register type:', typeof userController.register);
console.log('userController.login type:', typeof userController.login);
console.log('RateLimitService methods:', Object.keys(RateLimitService));
console.log('authenticateToken type:', typeof authenticateToken);
console.log('Auth middleware:', { protect: typeof authenticateToken, exists: !!authenticateToken });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

const upload = multer({ storage: storage });

// Verify controller methods exist before setting up routes
console.log('Setting up routes with controller methods:', Object.keys(userController));

// Authentication routes
if (typeof userController.register === 'function') {
    router.post('/register', 
        RateLimitService.registrationLimiter,
        [
            body('email').isEmail(),
            body('password').isLength({ min: 6 }),
            body('username').trim().isLength({ min: 3 }),
            handleValidationErrors
        ],
        userController.register
    );
}

if (typeof userController.login === 'function') {
    router.post('/login', 
        RateLimitService.authLimiter,
        [
            body('email').isEmail(),
            body('password').exists(),
            handleValidationErrors
        ],
        userController.login
    );
}

router.post('/logout', 
    authenticateToken,
    userController.logout
);

router.post('/refresh-token', 
    RateLimitService.authLimiter,
    userController.refreshToken
);

// Password management routes
router.post('/change-password', 
    authenticateToken,
    [
        body('currentPassword').exists(),
        body('newPassword').isLength({ min: 6 }),
        handleValidationErrors
    ],
    userController.changePassword
);

router.post('/forgot-password', 
    RateLimitService.passwordResetLimiter,
    [
        body('email').isEmail(),
        handleValidationErrors
    ],
    userController.forgotPassword
);

router.post('/reset-password/:token', 
    RateLimitService.passwordResetLimiter,
    [
        body('password').isLength({ min: 6 }),
        handleValidationErrors
    ],
    userController.resetPassword
);

// Profile routes
router.get('/me', 
    authenticateToken,
    userController.getProfile
);

router.put('/me', 
    authenticateToken,
    [
        body('email').optional().isEmail(),
        body('username').optional().trim().isLength({ min: 3 }),
        handleValidationErrors
    ],
    userController.updateProfile
);

// If you need the verify functionality, move it to a new route name
router.get('/verify-token', authenticateToken, async (req, res) => {
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

// Delete account
router.delete('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.userId || req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Security Settings routes
router.get('/security-settings', [authenticateToken, cache(300)], async (req, res) => {
  console.log('GET security-settings - user:', req.user);
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      console.log('User not found:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securitySettings) {
      user.securitySettings = {
        twoFactorEnabled: false,
        emailNotifications: true,
        loginAlerts: true
      };
      await user.save();
    }

    console.log('Sending security settings:', user.securitySettings);
    res.json(user.securitySettings);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/security-settings', authenticateToken, async (req, res) => {
  console.log('PATCH security-settings - body:', req.body);
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      console.log('User not found:', req.user);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.securitySettings) {
      user.securitySettings = {};
    }

    user.securitySettings = {
      ...user.securitySettings,
      ...req.body
    };

    await user.save();
    console.log('Updated security settings:', user.securitySettings);
    
    // Clear security settings cache
    await redis.del(`cache:/api/users/security-settings`);
    
    res.json(user.securitySettings);
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// 2FA routes
router.post('/2fa/setup', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new secret
    const secret = speakeasy.generateSecret({
      name: `YourApp:${user.email}`
    });

    // Store temporary secret
    user.tempSecret = secret.base32;
    await user.save();

    res.json({ 
      secret: secret.base32,
      message: '2FA setup initiated'
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({ message: 'Error setting up 2FA' });
  }
});

router.post('/2fa/verify', authenticateToken, async (req, res) => {
  try {
    const { code, secret } = req.body;
    const user = await User.findById(req.user.userId || req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: code,
      window: 2 // Allow 2 time steps for clock drift
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Store the verified secret and enable 2FA
    user.twoFactorSecret = secret;
    user.tempSecret = undefined;
    user.securitySettings.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA setup successful' });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
});

// Get all addresses
router.get('/addresses', [authenticateToken, cache(300)], async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.profile.address || []);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ message: 'Error fetching addresses' });
  }
});

// Add cache invalidation to address mutations
const clearAddressCache = async (userId) => {
    await redis.del(`cache:/api/users/addresses`);
};

// Add address
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      ...req.body
    };

    if (!Array.isArray(user.profile.address)) {
      user.profile.address = [];
    }
    
    user.profile.address.push(newAddress);
    await user.save();

    await clearAddressCache(req.user.id);
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ message: 'Error adding address' });
  }
});

// Update address
router.put('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addressIndex = user.profile.address.findIndex(
      addr => addr._id.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    user.profile.address[addressIndex] = {
      ...user.profile.address[addressIndex],
      ...req.body
    };

    await user.save();
    res.json(user.profile.address[addressIndex]);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Error updating address' });
  }
});

// Delete address
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profile.address = user.profile.address.filter(
      addr => addr._id.toString() !== req.params.addressId
    );

    await user.save();
    await clearAddressCache(req.user.id);
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
});

// Avatar upload route
router.post('/me/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.userId || req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If there's an existing avatar, delete it from Cloudinary
    if (user.avatarUrl && user.avatarUrl.includes('cloudinary')) {
      const publicId = user.avatarUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    // Update user's avatar URL
    user.avatarUrl = req.file.path;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: user.avatarUrl
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      message: 'Error uploading avatar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Debug logging for rate limiters
console.log('Rate limiters configured:', {
    registration: !!RateLimitService.registrationLimiter,
    auth: !!RateLimitService.authLimiter,
    refreshToken: !!RateLimitService.refreshToken,
    passwordReset: !!RateLimitService.passwordResetLimiter
});

// Debug logging for auth middleware
console.log('RateLimitService status:', {
    exists: !!RateLimitService,
    registrationLimiter: typeof RateLimitService.registrationLimiter,
    authLimiter: typeof RateLimitService.authLimiter,
    passwordResetLimiter: typeof RateLimitService.passwordResetLimiter
});

// Verify logout method exists
console.log('userController logout method:', {
    exists: !!userController.logout,
    type: typeof userController.logout
});

// Debug auth middleware
console.log('Auth middleware check:', {
    authenticateToken: typeof authenticateToken,
    userControllerLogout: typeof userController.logout
});

// Debug logging
console.log('Loading userRoutes.js - END');

// Log configured routes
if (process.env.NODE_ENV !== 'production') {
    router.stack
        .filter(r => r.route)
        .forEach(r => {
            console.log(`Route configured: ${r.route.path} [${Object.keys(r.route.methods)}]`);
        });
}

module.exports = router;
