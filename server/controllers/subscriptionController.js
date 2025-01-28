const Subscription = require('../models/Subscription');
const Transaction = require('../models/Transaction');
const User = require('../models/userModel');
const stripeService = require('../services/stripe');

const subscriptionController = {
  async getPlans(req, res) {
    try {
      const plans = await Subscription.find({ active: true });
      res.json(plans);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCurrentSubscription(req, res) {
    try {
      const user = await User.findById(req.user.id);
      res.json(user.subscription);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async subscribe(req, res) {
    try {
      const { planId, paymentMethodId } = req.body;
      const subscription = await stripeService.createSubscription(
        req.user.id,
        planId,
        paymentMethodId
      );

      const plan = await Subscription.findOne({ name: subscription.plan });
      
      // Update user's subscription details
      await User.findByIdAndUpdate(req.user.id, {
        subscription: {
          plan: plan.name,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          autoRenew: true
        },
        credits: plan.credits.monthly
      });

      res.json({ success: true, subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async cancelSubscription(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user.subscription || user.subscription.plan === 'free') {
        throw new Error('No active subscription found');
      }

      // Cancel subscription in Stripe
      await stripeService.cancelSubscription(user.billing.customerId);

      // Update user subscription status
      await User.findByIdAndUpdate(req.user.id, {
        'subscription.autoRenew': false
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async upgradeSubscription(req, res) {
    try {
      const { newPlanId, paymentMethodId } = req.body;
      const user = await User.findById(req.user.id);

      // Cancel current subscription if exists
      if (user.subscription && user.subscription.plan !== 'free') {
        await stripeService.cancelSubscription(user.billing.customerId);
      }

      // Create new subscription
      const subscription = await stripeService.createSubscription(
        req.user.id,
        newPlanId,
        paymentMethodId
      );

      res.json({ success: true, subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async purchaseCredits(req, res) {
    try {
      const { amount, credits, paymentMethodId } = req.body;
      const paymentIntent = await stripeService.purchaseCredits(
        req.user.id,
        amount,
        credits,
        paymentMethodId
      );

      res.json({ success: true, paymentIntent });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreditsBalance(req, res) {
    try {
      const user = await User.findById(req.user.id);
      res.json({ credits: user.credits });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCreditsHistory(req, res) {
    try {
      const transactions = await Transaction.find({
        user: req.user.id,
        type: 'credits'
      }).sort({ createdAt: -1 });
      
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = subscriptionController; 