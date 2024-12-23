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

const formatAccountType = (type) => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

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

    // Build response object with ALL fields
    const userData = {
      id: user._id,
      userId: user._id,
      email: user.email,
      username: user.username || user.email,
      accountType: formatAccountType(req.user.accountType),
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = null;
    let accountType = null;
    let userModel = null;

    // Try each user type in order and set the correct model
    user = await User.findOne({ email }).select('+password');
    if (user) {
      accountType = 'regular';
      userModel = User;
    }
    
    if (!user) {
      user = await BusinessUser.findOne({ email }).select('+password');
      if (user) {
        accountType = 'business';
        userModel = BusinessUser;
      }
    }

    if (!user) {
      user = await VendorUser.findOne({ email }).select('+password');
      if (user) {
        accountType = 'vendor';
        userModel = VendorUser;
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    user.activity = user.activity || {};
    user.activity.lastLogin = new Date();
    user.activity.loginCount = (user.activity.loginCount || 0) + 1;
    await user.save();

    // Get fresh user data without password
    const freshUser = await userModel.findById(user._id).select('-password');

    const token = jwt.sign(
      { 
        userId: user._id,
        accountType,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', {
      userId: user._id,
      accountType,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: freshUser._id,
        email: freshUser.email,
        username: freshUser.username,
        accountType: formatAccountType(accountType),
        role: freshUser.role,
        avatarUrl: freshUser.avatarUrl,
        address: freshUser.address || '',
        phone: freshUser.phone || '',
        businessName: ['business', 'vendor'].includes(accountType) ? freshUser.businessName : '',
        vendorCategory: accountType === 'vendor' ? freshUser.vendorCategory : undefined,
        serviceCategories: accountType === 'business' ? freshUser.serviceCategories : undefined
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