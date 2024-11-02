const Review = require('../models/Review');
const Product = require('../models/Product');

module.exports = {
  // Add review
  addReview: async (req, res) => {
    try {
      const { productId, rating, comment } = req.body;
      const review = await Review.create({
        user: req.user.id,
        product: productId,
        rating,
        comment
      });

      // Update product rating
      const product = await Product.findById(productId);
      product.reviews.push(review._id);
      product.rating = (product.rating * (product.reviews.length - 1) + rating) / product.reviews.length;
      await product.save();

      res.status(201).json(review);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}; 