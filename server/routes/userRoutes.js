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

console.log('Loading userRoutes.js - START');

// Import controllers
const userController = require('../controllers/userController');

// Auth routes
router.post('/register', async (req, res) => {
    try {
        const { 
            username, 
            email, 
            password, 
            accountType,
            businessName,
            businessType,
            vendorCategory,
            location,
            description
        } = req.body;

        // Check if email already exists in any user collection
        const existingUser = await User.findOne({ email }) || 
                            await BusinessUser.findOne({ email }) || 
                            await VendorUser.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create user based on account type
        let newUser;

        switch(accountType) {
            case 'business':
                newUser = new BusinessUser({
                    username,
                    email,
                    password,
                    businessName,
                    businessType,
                    location,
                    description
                });
                break;
            case 'vendor':
                newUser = new VendorUser({
                    username,
                    email,
                    password,
                    businessName,
                    businessType,
                    vendorCategory
                });
                break;
            default:
                newUser = new User({
                    username,
                    email,
                    password,
                    role: 'user'
                });
        }

        await newUser.save();

        res.status(201).json({ 
            message: 'Registration successful',
            accountType
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            error: 'Registration failed', 
            details: error.message 
        });
    }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if 2FA is enabled
    if (user.securitySettings?.twoFactorEnabled) {
      // Return temp token for 2FA verification
      const tempToken = jwt.sign(
        { tempUserId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '5m' }
      );

      return res.json({
        need2FA: true,
        tempToken
      });
    }

    // If 2FA is not enabled, proceed with normal login
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new route for 2FA verification during login
router.post('/verify-2fa', async (req, res) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Verification code is required' });
    }

    // Log the verification attempt
    console.log('2FA verification attempt:', { code });

    // Verify temp token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.tempUserId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Find user and include twoFactorSecret
    const user = await User.findById(decoded.tempUserId).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify 2FA code
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      console.log('Invalid 2FA code:', { code, userId: user._id });
      return res.status(401).json({ message: 'Invalid verification code' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, phone, bio } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.profile.phone = phone || user.profile.phone;
    user.profile.bio = bio || user.profile.bio;

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Delete account
router.delete('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: 'Error deleting account' });
  }
});

// Security Settings routes
router.get('/security-settings', auth, async (req, res) => {
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

// Add this route to your existing userRoutes.js
router.post('/refresh-token', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Error refreshing token' });
  }
});

// Get all addresses
router.get('/addresses', auth, async (req, res) => {
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
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Error deleting address' });
  }
});

console.log('Loading userRoutes.js - END');

module.exports = router;
