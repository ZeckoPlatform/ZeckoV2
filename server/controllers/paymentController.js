const stripe = require('../services/stripe');
const Credit = require('../models/Credit');
const User = require('../models/userModel');
const mongoose = require('mongoose');

exports.createCheckoutSession = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { priceId } = req.body;
        const userId = req.user._id;

        // Get or create Stripe customer
        let user = await User.findById(userId);
        if (!user.stripeCustomerId) {
            const customer = await stripe.createCustomer({
                email: user.email,
                metadata: { userId: user._id.toString() }
            });
            user.stripeCustomerId = customer.id;
            await user.save({ session });
        }

        // Create checkout session
        const checkoutSession = await stripe.createSubscriptionSession(
            priceId,
            user.stripeCustomerId
        );

        await session.commitTransaction();
        res.json({ sessionId: checkoutSession.id });
    } catch (error) {
        await session.abortTransaction();
        console.error('Create checkout session error:', error);
        res.status(500).json({ message: 'Error creating checkout session' });
    } finally {
        session.endSession();
    }
};

exports.handleWebhook = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'];
        const event = stripe.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

        const result = await stripe.handleWebhook(event);

        if (result.status === 'success') {
            // Handle successful payment
            if (event.type === 'checkout.session.completed') {
                const session = result.session;
                await handleSuccessfulPayment(session);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).json({ message: error.message });
    }
};

async function handleSuccessfulPayment(session) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findOne({ stripeCustomerId: session.customer });
        if (!user) throw new Error('User not found');

        // Update user's subscription status
        user.subscriptionStatus = 'active';
        user.subscriptionId = session.subscription;
        await user.save({ session });

        // Add credits if applicable
        if (session.metadata.creditAmount) {
            let credit = await Credit.findOne({ business: user._id });
            if (!credit) {
                credit = new Credit({ business: user._id });
            }
            credit.balance += parseInt(session.metadata.creditAmount);
            await credit.save({ session });
        }

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        console.error('Payment handling error:', error);
        throw error;
    } finally {
        session.endSession();
    }
}

module.exports = exports; 