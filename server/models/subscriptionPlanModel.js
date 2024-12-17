const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['subscription', 'contractor', 'vendor'],
        required: true
    },
    price: {
        monthly: Number,
        yearly: Number
    },
    features: [{
        name: String,
        included: Boolean
    }],
    limits: {
        requestsPerMonth: Number,
        productsAllowed: Number,
        teamMembers: Number
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema); 