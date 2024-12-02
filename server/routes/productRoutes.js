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
    const business = await Business.findOne({ owner: req.user.id });
    if (!business) {
      return res.status(400).json({ message: 'You must have a business profile to list products' });
    }
    const newProduct = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      seller: business._id
    });
    const savedProduct = await newProduct.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error listing product', error: error.message });
  }
});

// Get all products
router.get('/', productController.getAllProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

module.exports = router;
