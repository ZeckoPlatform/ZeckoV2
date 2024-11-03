const express = require('express');
const router = express.Router();
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

console.log('Loading userRoutes.js - START');

// Import controllers
const userController = require('../controllers/userController');

// Auth routes
router.post('/register', userController.register);
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

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

console.log('Loading userRoutes.js - END');

module.exports = router;
