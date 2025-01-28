const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');

exports.createCustomer = async (user) => {
    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: user._id.toString()
            }
        });

        user.stripeCustomerId = customer.id;
        await user.save();

        return customer;
    } catch (error) {
        throw new Error(`Error creating Stripe customer: ${error.message}`);
    }
};

exports.createPaymentIntent = async (amount, customerId, metadata = {}) => {
    try {
        return await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'gbp',
            customer: customerId,
            metadata,
            automatic_payment_methods: {
                enabled: true
            }
        });
    } catch (error) {
        throw new Error(`Error creating payment intent: ${error.message}`);
    }
};

exports.createSubscription = async (customerId, priceId) => {
    try {
        return await stripe.subscriptions.create({
            customer: customerId,
            items: [{ price: priceId }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent']
        });
    } catch (error) {
        throw new Error(`Error creating subscription: ${error.message}`);
    }
};

exports.handleWebhook = async (event) => {
    switch (event.type) {
        case 'payment_intent.succeeded':
            await handlePaymentSuccess(event.data.object);
            break;
        case 'payment_intent.payment_failed':
            await handlePaymentFailure(event.data.object);
            break;
        case 'customer.subscription.updated':
            await handleSubscriptionUpdate(event.data.object);
            break;
        case 'customer.subscription.deleted':
            await handleSubscriptionCancellation(event.data.object);
            break;
    }
};

const handlePaymentSuccess = async (paymentIntent) => {
    const order = await Order.findById(paymentIntent.metadata.orderId);
    if (order) {
        order.payment.status = 'completed';
        order.status = 'processing';
        await order.save();
    }
};

const handlePaymentFailure = async (paymentIntent) => {
    const order = await Order.findById(paymentIntent.metadata.orderId);
    if (order) {
        order.payment.status = 'failed';
        await order.save();
    }
};

const handleSubscriptionUpdate = async (subscription) => {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (user) {
        user.subscription.status = subscription.status;
        user.subscription.endDate = new Date(subscription.current_period_end * 1000);
        await user.save();
    }
};

const handleSubscriptionCancellation = async (subscription) => {
    const user = await User.findOne({ stripeCustomerId: subscription.customer });
    if (user) {
        user.subscription.status = 'cancelled';
        await user.save();
    }
}; 