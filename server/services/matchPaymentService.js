const MatchHistory = require('../models/matchHistoryModel');
const Payment = require('../models/paymentModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const NotificationService = require('./notificationService');
const mongoose = require('mongoose');

class MatchPaymentService {
    async createPaymentIntent(matchId, amount, currency = 'usd') {
        const match = await MatchHistory.findById(matchId)
            .populate('business')
            .populate('lead');

        if (!match) {
            throw new Error('Match not found');
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency,
            metadata: {
                matchId,
                businessId: match.business._id.toString(),
                leadId: match.lead._id.toString()
            }
        });

        const payment = await Payment.create({
            match: matchId,
            amount,
            currency,
            status: 'pending',
            paymentIntentId: paymentIntent.id,
            timeline: [{
                action: 'payment_intent_created',
                timestamp: new Date(),
                details: {
                    amount,
                    currency
                }
            }]
        });

        await this.updateMatchPaymentStatus(match, 'pending_payment');
        
        return {
            clientSecret: paymentIntent.client_secret,
            payment
        };
    }

    async handlePaymentWebhook(event) {
        const { type, data } = event;
        const paymentIntent = data.object;
        const matchId = paymentIntent.metadata.matchId;

        const payment = await Payment.findOne({
            paymentIntentId: paymentIntent.id
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        switch (type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(payment, paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(payment, paymentIntent);
                break;
            case 'payment_intent.canceled':
                await this.handlePaymentCancellation(payment, paymentIntent);
                break;
        }

        return payment;
    }

    async handlePaymentSuccess(payment, paymentIntent) {
        payment.status = 'completed';
        payment.timeline.push({
            action: 'payment_succeeded',
            timestamp: new Date(),
            details: {
                transactionId: paymentIntent.charges.data[0].id
            }
        });

        await payment.save();
        await this.updateMatchPaymentStatus(payment.match, 'payment_completed');
        await this.distributePayment(payment);
        await this.notifyPaymentSuccess(payment);
    }

    async handlePaymentFailure(payment, paymentIntent) {
        payment.status = 'failed';
        payment.timeline.push({
            action: 'payment_failed',
            timestamp: new Date(),
            details: {
                error: paymentIntent.last_payment_error?.message
            }
        });

        await payment.save();
        await this.updateMatchPaymentStatus(payment.match, 'payment_failed');
        await this.notifyPaymentFailure(payment);
    }

    async distributePayment(payment) {
        const match = await MatchHistory.findById(payment.match)
            .populate('business');

        const platformFee = this.calculatePlatformFee(payment.amount);
        const businessAmount = payment.amount - platformFee;

        try {
            await stripe.transfers.create({
                amount: Math.round(businessAmount * 100),
                currency: payment.currency,
                destination: match.business.stripeAccountId,
                transfer_group: `match_${match._id}`
            });

            payment.timeline.push({
                action: 'payment_distributed',
                timestamp: new Date(),
                details: {
                    businessAmount,
                    platformFee
                }
            });

            await payment.save();
        } catch (error) {
            console.error('Payment distribution failed:', error);
            await this.notifyPaymentDistributionFailure(payment);
            throw error;
        }
    }

    calculatePlatformFee(amount) {
        // Platform fee calculation logic (e.g., 10%)
        return amount * 0.10;
    }

    async getPaymentHistory(matchId) {
        const payments = await Payment.find({ match: matchId })
            .sort('-createdAt');

        const stats = await this.calculatePaymentStats(payments);
        
        return {
            payments,
            stats
        };
    }

    async calculatePaymentStats(payments) {
        const totalAmount = payments.reduce((sum, payment) => 
            sum + (payment.status === 'completed' ? payment.amount : 0), 0
        );

        const successfulPayments = payments.filter(p => p.status === 'completed');
        const failedPayments = payments.filter(p => p.status === 'failed');

        return {
            totalAmount,
            successfulPayments: successfulPayments.length,
            failedPayments: failedPayments.length,
            averageAmount: totalAmount / (successfulPayments.length || 1)
        };
    }

    async updateMatchPaymentStatus(match, status) {
        match.paymentStatus = status;
        match.timeline.push({
            action: 'payment_status_updated',
            timestamp: new Date(),
            details: { status }
        });
        await match.save();
    }

    async notifyPaymentSuccess(payment) {
        const match = await MatchHistory.findById(payment.match)
            .populate('business')
            .populate('lead');

        await NotificationService.sendNotification(match.business._id, {
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Received',
            message: `Payment of ${payment.amount} ${payment.currency.toUpperCase()} has been received`,
            data: {
                matchId: match._id,
                paymentId: payment._id
            }
        });

        await NotificationService.sendNotification(match.lead.user, {
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Successful',
            message: `Your payment of ${payment.amount} ${payment.currency.toUpperCase()} has been processed`,
            data: {
                matchId: match._id,
                paymentId: payment._id
            }
        });
    }

    async notifyPaymentFailure(payment) {
        const match = await MatchHistory.findById(payment.match)
            .populate('lead');

        await NotificationService.sendNotification(match.lead.user, {
            type: 'PAYMENT_FAILED',
            title: 'Payment Failed',
            message: 'Your payment could not be processed. Please try again.',
            data: {
                matchId: match._id,
                paymentId: payment._id
            }
        });
    }

    async notifyPaymentDistributionFailure(payment) {
        await NotificationService.notifyAdmins({
            type: 'PAYMENT_DISTRIBUTION_FAILED',
            title: 'Payment Distribution Failed',
            message: `Failed to distribute payment for match #${payment.match}`,
            data: {
                matchId: payment.match,
                paymentId: payment._id
            }
        });
    }
}

module.exports = new MatchPaymentService(); 