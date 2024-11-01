const express = require('express');
const router = express.Router();
const Business = require('../models/businessModel');
const { auth } = require('../middleware/auth');

// Create a new business profile
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, location, contactEmail, contactPhone, website } = req.body;
    const newBusiness = new Business({
      name,
      description,
      category,
      location,
      contactEmail,
      contactPhone,
      website,
      owner: req.user.id
    });
    const savedBusiness = await newBusiness.save();
    res.json(savedBusiness);
  } catch (error) {
    res.status(500).json({ message: 'Error creating business profile', error: error.message });
  }
});

// Get all businesses
router.get('/', async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching businesses', error: error.message });
  }
});

// Search businesses
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const businesses = await Business.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ message: 'Error searching businesses', error: error.message });
  }
});

// Get featured businesses
router.get('/featured', async (req, res) => {
  try {
    const featuredBusinesses = await Business.find({ isFeatured: true }).sort({ createdAt: -1 });
    res.json(featuredBusinesses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured businesses', error: error.message });
  }
});

module.exports = router;
