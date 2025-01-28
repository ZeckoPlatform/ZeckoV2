const Credit = require('../models/Credit');
const mongoose = require('mongoose');
const stripeService = require('../services/stripe');

exports.getBalance = async (req, res) => {
    try {
        const credit = await Credit.findOne({ business: req.user._id });
        if (!credit) {
            return res.json({ balance: 0 });
        }
        res.json({ balance: credit.balance });
    } catch (error) {
        console.error('Get balance error:', error);
        res.status(500).json({ message: 'Error fetching credit balance' });
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const credit = await Credit.findOne({ business: req.user._id });
        if (!credit) {
            return res.json({ transactions: [] });
        }
        res.json({ transactions: credit.transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

exports.purchaseCredits = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { amount } = req.body;
        const businessId = req.user._id;

        let credit = await Credit.findOne({ business: businessId });
        if (!credit) {
            credit = new Credit({ business: businessId });
        }

        credit.balance += amount;
        credit.transactions.push({
            amount,
            type: 'purchase',
            description: 'Credit purchase'
        });

        await credit.save({ session });
        await session.commitTransaction();

        res.json({ 
            message: 'Credits purchased successfully',
            newBalance: credit.balance 
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Purchase credits error:', error);
        res.status(500).json({ message: 'Error purchasing credits' });
    } finally {
        session.endSession();
    }
};

exports.createPaymentIntent = async (req, res) => {
    try {
        const { amount } = req.body;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const paymentIntent = await stripeService.createPaymentIntent(amount);
        
        res.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ message: 'Error creating payment' });
    }
};

exports.confirmCreditPurchase = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { paymentIntentId, amount } = req.body;
        const businessId = req.user._id;

        // Verify payment success
        const paymentSucceeded = await stripeService.confirmPayment(paymentIntentId);
        if (!paymentSucceeded) {
            throw new Error('Payment verification failed');
        }

        // Update credits
        let credit = await Credit.findOne({ business: businessId });
        if (!credit) {
            credit = new Credit({ business: businessId });
        }

        credit.balance += amount;
        credit.transactions.push({
            amount,
            type: 'purchase',
            description: `Credit purchase - Payment ID: ${paymentIntentId}`
        });

        await credit.save({ session });
        await session.commitTransaction();

        res.json({
            message: 'Credit purchase successful',
            newBalance: credit.balance
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Confirm credit purchase error:', error);
        res.status(500).json({ message: 'Error processing credit purchase' });
    } finally {
        session.endSession();
    }
}; 