const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const Job = require('../models/jobModel');
const Business = require('../models/businessModel');
const Product = require('../models/productModel');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);
    if (username) user.username = username;
    if (email) user.email = email;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
});

// Get user's jobs (for customers)
router.get('/jobs', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user jobs', error: error.message });
  }
});

// Get user's business profile (for business accounts)
router.get('/business', auth, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching business profile', error: error.message });
  }
});

// Get user's products (for seller accounts)
router.get('/products', auth, async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }
    const products = await Product.find({ seller: business._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user products', error: error.message });
  }
});

// Get user's subscription info
router.get('/subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subscription.plan');
    if (!user.subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription info', error: error.message });
  }
});

module.exports = router;
