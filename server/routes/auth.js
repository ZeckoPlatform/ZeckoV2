const express = require('express');
const User = require('../models/userModel');
const BusinessUser = require('../models/businessUserModel');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    console.log('Verify endpoint called with user:', req.user);
    
    // Find the full user data
    let user;
    if (req.user.accountType === 'business') {
      user = await BusinessUser.findById(req.user.id).select('-password').lean();
    } else {
      user = await User.findById(req.user.id).select('-password').lean();
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountType: req.user.accountType,
        role: user.role,
        businessName: user.businessName,
        // Add any other needed user fields
        createdAt: user.createdAt
      },
      verified: true 
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);

    let user = await User.findOne({ email });
    let isBusinessUser = false;

    if (!user) {
      user = await BusinessUser.findOne({ email });
      isBusinessUser = true;
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
        accountType: isBusinessUser ? 'business' : 'user',
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful for:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountType: isBusinessUser ? 'business' : 'user',
        role: user.role,
        businessName: isBusinessUser ? user.businessName : undefined
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, username, accountType, businessName, businessType } = req.body;

    const existingUser = await User.findOne({ email }) || await BusinessUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let user;
    if (accountType === 'business') {
      user = new BusinessUser({
        email,
        password,
        username,
        businessName,
        businessType,
        role: 'vendor'
      });
    } else {
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

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountType,
        role: user.role,
        businessName: accountType === 'business' ? user.businessName : undefined
      }
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