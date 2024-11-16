const express = require('express');
const User = require('../models/User');
const BusinessUser = require('../models/businessUserModel');
const { authenticateToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);

    let user = await User.findOne({ email }) || await BusinessUser.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        accountType: user.accountType || 'user',
        role: user.role || 'user'
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
        accountType: user.accountType || 'user',
        role: user.role || 'user',
        businessName: user.businessName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, accountType, businessName } = req.body;

    const existingUser = await User.findOne({ email }) || await BusinessUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      accountType,
      businessName
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

module.exports = router; 