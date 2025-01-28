const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  timeline: {
    startDate: Date,
    endDate: Date,
    flexibility: {
      type: String,
      enum: ['flexible', 'strict'],
      default: 'flexible'
    }
  },
  requirements: [{
    type: String
  }],
  attachments: [{
    url: String,
    type: String,
    name: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled', 'expired'],
    default: 'open'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invited'],
    default: 'public'
  },
  invitedVendors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  preferences: {
    vendorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    vendorVerification: {
      type: Boolean,
      default: false
    },
    responseTime: {
      type: String,
      enum: ['24h', '48h', '72h', 'any'],
      default: 'any'
    }
  },
  quotationPreferences: {
    allowMultiple: {
      type: Boolean,
      default: true
    },
    deadline: Date,
    maxQuotations: Number
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    quotationsReceived: {
      type: Number,
      default: 0
    },
    lastViewed: Date
  }
}, {
  timestamps: true
});

// Indexes
serviceRequestSchema.index({ location: '2dsphere' });
serviceRequestSchema.index({ category: 1 });
serviceRequestSchema.index({ status: 1 });
serviceRequestSchema.index({ 'timeline.startDate': 1 });

// Middleware to handle status changes
serviceRequestSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    // Add any status change logic here
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 
module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 