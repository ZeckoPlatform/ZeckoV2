const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  budget: {
    min: { type: Number, required: true, min: 0 },
    max: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'GBP', enum: ['GBP', 'USD', 'EUR'] }
  },
  location: {
    address: { type: String, default: '', trim: true },
    city: { type: String, default: '', trim: true },
    state: { type: String, default: '', trim: true },
    country: { type: String, default: '', trim: true },
    postalCode: { type: String, default: '', trim: true }
  },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requirements: [{
    question: { type: String },
    answer: { type: String }
  }],
  attachments: [{
    url: String,
    name: String,
    type: String
  }],
  status: {
    type: String,
    enum: ['active', 'in-progress', 'completed', 'cancelled'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited'],
    default: 'public'
  },
  proposals: [{
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      value: { type: Number, required: true },
      currency: { type: String, default: 'GBP' }
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  metrics: {
    viewCount: { type: Number, default: 0 },
    proposalCount: { type: Number, default: 0 },
    averageProposal: Number
  }
}, {
  timestamps: true
});

// Indexes
leadSchema.index({ category: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ createdAt: -1 });

// Pre-save middleware
leadSchema.pre('save', function(next) {
  // Update metrics
  if (this.isModified('proposals')) {
    this.metrics.proposalCount = this.proposals.length;
    if (this.proposals.length > 0) {
      const total = this.proposals.reduce((sum, proposal) => sum + proposal.amount.value, 0);
      this.metrics.averageProposal = total / this.proposals.length;
    }
  }

  // Ensure location exists
  if (!this.location) {
    this.location = {
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    };
  }
  
  next();
});

module.exports = mongoose.model('Lead', leadSchema);