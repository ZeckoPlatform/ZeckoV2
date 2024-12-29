const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ServiceCategory', 
    required: true 
  },
  subCategory: { type: String },
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: [{
    question: String,
    answer: String
  }],
  attachments: [{
    url: String,
    name: String,
    type: String
  }],
  status: {
    type: String,
    enum: ['draft', 'active', 'assigned', 'completed', 'cancelled'],
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
      ref: 'User'
    },
    amount: {
      value: Number,
      currency: String
    },
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    submittedAt: { type: Date, default: Date.now }
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: { type: Date, default: Date.now }
  }],
  expiresAt: Date,
  completedAt: Date,
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
leadSchema.index({ 'location.coordinates': '2dsphere' });
leadSchema.index({ createdAt: -1 });

// Update metrics when new proposal is added
leadSchema.pre('save', function(next) {
  if (this.isModified('proposals')) {
    this.metrics.proposalCount = this.proposals.length;
    if (this.proposals.length > 0) {
      const total = this.proposals.reduce((sum, proposal) => sum + proposal.amount.value, 0);
      this.metrics.averageProposal = total / this.proposals.length;
    }
  }
  next();
});

module.exports = mongoose.model('Lead', leadSchema);