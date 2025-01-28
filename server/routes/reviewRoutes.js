const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const reviewController = require('../controllers/reviewController');
const validationMiddleware = require('../middleware/validation');
const { body, param } = require('express-validator');

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

router.post('/lead/:leadId', auth, reviewController.createLeadReview);
router.get('/contractor/:contractorId', reviewController.getContractorReviews);
router.get('/lead/:leadId', auth, reviewController.getLeadReview);

// Add report route
router.post('/:reviewId/report', auth, reviewController.reportReview);

const reviewValidations = [
    body('orderId').isMongoId(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('comment').trim().isLength({ min: 10, max: 500 }),
    body('aspects').isObject(),
    body('aspects.communication').isInt({ min: 1, max: 5 }),
    body('aspects.quality').isInt({ min: 1, max: 5 }),
    body('aspects.timeliness').isInt({ min: 1, max: 5 }),
    body('aspects.value').isInt({ min: 1, max: 5 }),
    validationMiddleware.handleValidationErrors
];

router.post('/create', reviewValidations, reviewController.createReview);
router.put('/:reviewId', [
    param('reviewId').isMongoId(),
    ...reviewValidations
], reviewController.updateReview);

module.exports = router; 