const express = require('express');
const router = express.Router();
const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');
const { auth } = require('../middleware/auth');

// Admin Routes

// Create a new subscription plan (admin only)
router.post('/plans', auth, async (req, res) => {
  try {
    const { name, description, price, duration, features } = req.body;
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const newSubscription = new Subscription({
      name,
      description,
      price,
      duration,
      features
    });
    const savedSubscription = await newSubscription.save();
    res.json(savedSubscription);
  } catch (error) {
    res.status(500).json({ message: 'Error creating subscription plan', error: error.message });
  }
});

// Get all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subscription plans', error: error.message });
  }
});

// User Routes

// Get user's current subscription
router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subscription.plan');
    res.json(user.subscription);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user subscription', error: error.message });
  }
});

// Purchase a subscription
router.post('/purchase/:subscriptionId', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.subscription = {
      status: 'active',
      plan: subscription._id,
      startDate: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    await user.save();

    res.json({ message: 'Subscription purchased successfully', subscription: user.subscription });
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing subscription', error: error.message });
  }
});

module.exports = router;
