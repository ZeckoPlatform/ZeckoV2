const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  metrics: {
    totalSales: {
      type: Number,
      default: 0
    },
    orderCount: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    newUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    productViews: {
      type: Number,
      default: 0
    }
  },
  topProducts: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    views: Number,
    sales: Number,
    revenue: Number
  }],
  topCategories: [{
    category: String,
    sales: Number,
    revenue: Number
  }],
  userMetrics: {
    totalUsers: Number,
    activeUsers: Number,
    newRegistrations: Number
  },
  conversionRate: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Add index for date-based queries
analyticsSchema.index({ date: 1 });

module.exports = mongoose.model('Analytics', analyticsSchema); 