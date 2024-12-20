const express = require('express');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const VendorUser = require('../models/vendorUserModel');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const timeout = require('connect-timeout');

const router = express.Router();

router.use(timeout('25s'));

router.use((req, res, next) => {
    if (!req.timedout) next();
});

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    console.log('Verify endpoint called with user:', req.user);
    
    // Find the full user data based on account type
    let user;
    switch(req.user.accountType) {
      case 'business':
        user = await BusinessUser.findById(req.user.userId).select('-password').lean();
        break;
      case 'vendor':
        user = await VendorUser.findById(req.user.userId).select('-password').lean();
        break;
      default:
        user = await User.findById(req.user.userId).select('-password').lean();
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return type-specific user data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      accountType: req.user.accountType,
      role: user.role,
      createdAt: user.createdAt
    };

    // Add business-specific fields
    if (req.user.accountType === 'business') {
      userData.businessName = user.businessName;
      userData.businessType = user.businessType;
      userData.serviceCategories = user.serviceCategories;
      userData.serviceArea = user.serviceArea;
    }

    // Add vendor-specific fields
    if (req.user.accountType === 'vendor') {
      userData.businessName = user.businessName;
      userData.vendorCategory = user.vendorCategory;
      userData.storeSettings = user.storeSettings;
      userData.ratings = user.ratings;
    }

    res.json({ user: userData, verified: true });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let accountType = 'regular';

    // Try each user type in order
    user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      user = await BusinessUser.findOne({ email }).select('+password');
      if (user) {
        accountType = 'business';
      }
    }

    if (!user) {
      user = await VendorUser.findOne({ email }).select('+password');
      if (user) {
        accountType = 'vendor';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        accountType,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountType,
        role: user.role,
        businessName: ['business', 'vendor'].includes(accountType) ? user.businessName : undefined,
        vendorCategory: accountType === 'vendor' ? user.vendorCategory : undefined
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      username, 
      accountType, 
      businessName, 
      businessType,
      vendorCategory,
      serviceCategories,
      serviceArea,
      storeSettings
    } = req.body;

    // Check for existing user across all models
    const existingUser = await User.findOne({ email }) 
      || await BusinessUser.findOne({ email })
      || await VendorUser.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let user;
    switch(accountType) {
      case 'business':
        user = new BusinessUser({
          email,
          password,
          username,
          businessName,
          businessType,
          serviceCategories,
          serviceArea,
          role: 'contractor'
        });
        break;
      
      case 'vendor':
        user = new VendorUser({
          email,
          password,
          username,
          businessName,
          businessType,
          vendorCategory,
          storeSettings,
          role: 'vendor'
        });
        break;
      
      default:
        user = new User({
          email,
          password,
          username,
          role: 'user'
        });
    }

    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id,
        accountType,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return type-specific response
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      accountType,
      role: user.role
    };

    if (accountType === 'business') {
      userData.businessName = user.businessName;
      userData.businessType = user.businessType;
      userData.serviceCategories = user.serviceCategories;
    }

    if (accountType === 'vendor') {
      userData.businessName = user.businessName;
      userData.vendorCategory = user.vendorCategory;
      userData.storeSettings = user.storeSettings;
    }

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Since we're using JWT, we don't need to do server-side logout
    // The client will remove the token
    // But we can blacklist the token if needed
    
    // Optional: Add token to blacklist
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      // You could add the token to a blacklist in Redis or your database
      // await blacklistToken(token);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router; 