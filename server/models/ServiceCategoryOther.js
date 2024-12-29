const mongoose = require('mongoose');

// This defines how our category data will be structured
const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'default-icon.png'
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Automatically add createdAt and updatedAt fields
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema); 
