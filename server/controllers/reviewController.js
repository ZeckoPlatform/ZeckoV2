const Review = require('../models/Review');
const Product = require('../models/Product');
const Lead = require('../models/Lead');

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
  },

  // Add lead-specific review methods
  createLeadReview: async (req, res) => {
    try {
      const { leadId } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      const lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      // Verify user owns the lead
      if (lead.postedBy.toString() !== userId.toString()) {
        return res.status(403).json({ message: 'Not authorized to review this lead' });
      }

      // Check if lead is completed
      if (lead.status !== 'completed') {
        return res.status(400).json({ message: 'Can only review completed leads' });
      }

      // Create review using existing review creation logic
      const review = await Review.create({
        leadId,
        contractorId: lead.selectedContractor,
        clientId: userId,
        rating,
        comment
      });

      res.status(201).json(review);
    } catch (error) {
      console.error('Create lead review error:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  },

  reportReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { reason } = req.body;
      const reportedBy = req.user._id;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      if (review.status !== 'active') {
        return res.status(400).json({ message: 'Review is not active' });
      }

      // Update review status
      review.status = 'reported';
      review.reportDetails = {
        reason,
        reportedBy,
        reportedAt: new Date()
      };

      await review.save();

      // Notify admins using existing notification system
      if (global.io) {
        global.io.to('admin').emit('review_reported', {
          reviewId: review._id,
          reason
        });
      }

      res.json({ message: 'Review reported successfully' });
    } catch (error) {
      console.error('Report review error:', error);
      res.status(500).json({ message: 'Error reporting review' });
    }
  }
}; 