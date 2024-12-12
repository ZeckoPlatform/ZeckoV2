const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  analytics: {
    views: { type: Number, default: 0 },
    sales: { type: Number, default: 0 },
    lastViewed: { type: Date }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active'
  },
  tags: [String],
  discount: {
    percentage: { type: Number, min: 0, max: 100 },
    validUntil: { type: Date }
  }
});

// Add indexes for commonly queried fields
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ createdAt: -1 });

// Add query timeout
productSchema.pre('find', function() {
    this.maxTimeMS(5000);
});

// Pre-save middleware to update timestamps
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to update product rating
productSchema.methods.updateRating = async function() {
  if (this.reviews.length > 0) {
    const reviews = await mongoose.model('Review').find({ _id: { $in: this.reviews } });
    if (reviews.length > 0) {
      this.rating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
      this.totalReviews = reviews.length;
      await this.save();
    }
  }
};

module.exports = mongoose.model('Product', productSchema);
