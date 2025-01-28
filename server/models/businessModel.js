const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String },
  website: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'BusinessUser', required: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add a pre-save middleware to update the updatedAt timestamp
businessSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Business', businessSchema);
