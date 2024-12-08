const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Transaction = require('../models/Transaction');

const stripeService = {
  async createCustomer(user) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      await User.findByIdAndUpdate(user._id, {
        'billing.customerId': customer.id
      });
      
      return customer;
    } catch (error) {
      console.error('Stripe customer creation failed:', error);
      throw error;
    }
  },

  async createSubscription(userId, planId, paymentMethodId) {
    try {
      const user = await User.findById(userId);
      if (!user.billing.customerId) {
        throw new Error('No Stripe customer ID found');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.billing.customerId,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: user.billing.customerId,
        items: [{ price: planId }],
        default_payment_method: paymentMethodId,
        expand: ['latest_invoice.payment_intent']
      });

      // Create transaction record
      await Transaction.create({
        user: userId,
        type: 'subscription',
        amount: {
          value: subscription.items.data[0].price.unit_amount / 100,
          currency: subscription.currency.toUpperCase()
        },
        status: 'completed',
        paymentMethod: 'stripe',
        metadata: {
          subscriptionId: subscription.id
        },
        stripePaymentId: subscription.latest_invoice.payment_intent.id
      });

      return subscription;
    } catch (error) {
      console.error('Subscription creation failed:', error);
      throw error;
    }
  },

  async purchaseCredits(userId, amount, credits, paymentMethodId) {
    try {
      const user = await User.findById(userId);
      if (!user.billing.customerId) {
        throw new Error('No Stripe customer ID found');
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'usd',
        customer: user.billing.customerId,
        payment_method: paymentMethodId,
        confirm: true,
        description: `Purchase of ${credits} credits`
      });

      // Create transaction record
      await Transaction.create({
        user: userId,
        type: 'credits',
        amount: {
          value: amount,
          currency: 'USD'
        },
        status: 'completed',
        paymentMethod: 'stripe',
        metadata: {
          credits
        },
        stripePaymentId: paymentIntent.id
      });

      // Update user credits
      await User.findByIdAndUpdate(userId, {
        $inc: { credits: credits }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Credit purchase failed:', error);
      throw error;
    }
  }
};

module.exports = stripeService; 