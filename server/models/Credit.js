const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: {
    type: String,
    enum: ['purchase', 'refund', 'usage', 'bonus'],
    required: true
  },
  description: String,
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  createdAt: { type: Date, default: Date.now }
});

const creditBalanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  balance: { type: Number, default: 0 },
  transactions: [creditTransactionSchema]
});

module.exports = mongoose.model('CreditBalance', creditBalanceSchema); 