const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: true
  },
  subcategory: String,
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  answers: [{
    question: String,
    answer: mongoose.Schema.Types.Mixed
  }],
  location: {
    postcode: {
      type: String,
      required: true
    },
    city: String,
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  timing: {
    preferredDate: Date,
    flexibility: {
      type: String,
      enum: ['flexible', 'specific_date', 'urgent'],
      default: 'flexible'
    }
  },
  budget: {
    range: {
      type: String,
      enum: ['not_sure', 'less_than_500', '500_to_1000', '1000_to_5000', 'more_than_5000']
    },
    specific: Number
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'matched', 'completed', 'cancelled'],
    default: 'draft'
  },
  quotes: [{
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    amount: Number,
    message: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  selectedProvider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  quoteCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for geospatial queries
serviceRequestSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 