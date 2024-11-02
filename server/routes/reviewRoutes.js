const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

// Add a review
router.post('/:productId', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = new Review({
      user: req.user.id,
      product: req.params.productId,
      rating,
      comment
    });

    await review.save();

    // Update product rating
    const reviews = await Review.find({ product: req.params.productId });
    const avgRating = reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
    
    product.rating = avgRating;
    product.reviews.push(review._id);
    await product.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Get product reviews
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});

module.exports = router; 