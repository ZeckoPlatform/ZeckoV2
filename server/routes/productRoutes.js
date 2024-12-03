const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Business = require('../models/Business');
const { auth } = require('../middleware/auth');
const cache = require('memory-cache');

// List a new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, price, and category are required'
      });
    }

    // Validate price format
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({
        message: 'Price must be a positive number'
      });
    }

    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(400).json({ 
        message: 'You must have a business profile to list products' 
      });
    }

    // Cache business for future requests
    cache.put(`business_${req.user.id}`, business, 300000); // 5 minute cache

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock: stock || 0,
      seller: business._id
    });

    const savedProduct = await newProduct.save();
    res.json(savedProduct);
    
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ 
      message: 'Error listing product', 
      error: error.message 
    });
  }
});

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ featured: true });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
