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
  },

  async createPaymentIntent(amount, currency = 'usd') {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency
      });
      return paymentIntent;
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      throw error;
    }
  },

  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error) {
      console.error('Stripe confirm payment error:', error);
      throw error;
    }
  },

  async createSubscriptionSession(priceId, customerId) {
    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [{
          price: priceId,
          quantity: 1,
        }],
        success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
      });
      return session;
    } catch (error) {
      console.error('Create subscription session error:', error);
      throw error;
    }
  },

  async handleWebhook(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          // Handle successful payment
          return { status: 'success', session };
        
        case 'invoice.payment_succeeded':
          const invoice = event.data.object;
          // Handle successful subscription payment
          return { status: 'success', invoice };
        
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object;
          // Handle failed subscription payment
          return { status: 'failed', invoice: failedInvoice };
        
        default:
          return { status: 'ignored' };
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }
};

module.exports = stripeService; 