const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    required: true
  },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  features: [{
    name: String,
    description: String,
    enabled: Boolean
  }],
  credits: {
    monthly: { type: Number, required: true },
    rollover: { type: Boolean, default: false }
  },
  limits: {
    leadsPerMonth: Number,
    proposalsPerLead: Number,
    teamMembers: Number,
    productListings: Number
  },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema); 