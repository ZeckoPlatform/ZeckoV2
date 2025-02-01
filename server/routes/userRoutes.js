const express = require('express');
const router = express.Router();
const path = require('path');
const { auth } = require('../middleware/auth');
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
const { protect: authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const RateLimitService = require('../services/rateLimitService');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

console.log('Loading userRoutes.js - START');

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

// Authentication routes
router.post('/register', 
    RateLimitService.registrationLimiter,
    userController.register
);

router.post('/login', 
    RateLimitService.authLimiter,
    [
        body('email').isEmail(),
        body('password').exists(),
        handleValidationErrors
    ],
    userController.login
);

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
    userController.changePassword
);

router.post('/forgot-password', 
    RateLimitService.passwordResetLimiter,
    userController.forgotPassword
);

router.post('/reset-password/:token', 
    RateLimitService.passwordResetLimiter,
    userController.resetPassword
);

// Profile routes
router.get('/me', 
    authenticateToken,
    userController.getProfile
);

router.put('/me', 
    authenticateToken,
    userController.updateProfile
);

// If you need the verify functionality, move it to a new route name
router.get('/verify-token', auth, async (req, res) => {
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
router.delete('/me', auth, async (req, res) => {
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
router.get('/security-settings', [auth, cache(300)], async (req, res) => {
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

router.patch('/security-settings', auth, async (req, res) => {
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
router.post('/2fa/setup', auth, async (req, res) => {
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

router.post('/2fa/verify', auth, async (req, res) => {
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
router.get('/addresses', [auth, cache(300)], async (req, res) => {
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
router.post('/addresses', auth, async (req, res) => {
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
router.put('/addresses/:addressId', auth, async (req, res) => {
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
router.delete('/addresses/:addressId', auth, async (req, res) => {
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
router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
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

// Debug logging
console.log('Loading userRoutes.js - END');

// Log configured routes
router.stack
    .filter(r => r.route)
    .forEach(r => {
        console.log(`Route configured: ${r.route.path} [${Object.keys(r.route.methods)}]`);
    });

module.exports = router;
