const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['login', 'security', 'profile', 'order', 'other'],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Compound indexes for common queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ type: 1, timestamp: -1 });
activityLogSchema.index({ userId: 1, type: 1, timestamp: -1 });

// Add method to format activity for client
activityLogSchema.methods.toClient = function() {
  return {
    id: this._id,
    type: this.type,
    description: this.description,
    timestamp: this.timestamp,
    metadata: this.metadata
  };
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;