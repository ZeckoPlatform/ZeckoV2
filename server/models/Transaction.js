const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'credits', 'lead', 'product'],
    required: true
  },
  amount: {
    value: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  description: String,
  metadata: {
    subscriptionId: String,
    leadId: String,
    productId: String,
    credits: Number
  },
  stripePaymentId: String
}, {
  timestamps: true
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema); 