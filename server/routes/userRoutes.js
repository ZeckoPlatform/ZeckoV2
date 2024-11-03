const express = require('express');
const router = express.Router();
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

console.log('Loading userRoutes.js - START');

// Try both import methods
const userController = require('../controllers/userController');
const userControllerAlt = require(path.join(__dirname, '../controllers/userController.js'));

console.log('userController (regular import):', Object.keys(userController));
console.log('userController (alt import):', Object.keys(userControllerAlt));
console.log('register function exists:', typeof userController.register === 'function');

// Auth routes
router.post('/register', userController.register);
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send response
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

// Add these routes to your existing userRoutes.js
router.get('/security-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return default settings if none exist
    const securitySettings = user.securitySettings || {
      twoFactorEnabled: false,
      emailNotifications: true,
      loginAlerts: true
    };

    res.json(securitySettings);
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/security-settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update security settings
    user.securitySettings = {
      ...user.securitySettings,
      ...req.body
    };

    await user.save();
    res.json(user.securitySettings);
  } catch (error) {
    console.error('Error updating security settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

console.log('Loading userRoutes.js - END');

module.exports = router;
