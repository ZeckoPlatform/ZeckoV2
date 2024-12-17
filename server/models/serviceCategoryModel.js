const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'default-category-icon.png'
  },
  subcategories: [{
    name: String,
    slug: String,
    description: String
  }],
  questions: [{
    text: String,
    type: {
      type: String,
      enum: ['multiple_choice', 'text', 'date', 'location', 'number'],
      default: 'text'
    },
    options: [String], // For multiple choice questions
    required: {
      type: Boolean,
      default: true
    },
    order: Number
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
serviceCategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
  next();
});

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema); 