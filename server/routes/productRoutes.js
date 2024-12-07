const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const Business = require('../models/businessModel');
const { auth } = require('../middleware/auth');
const cache = require('memory-cache');

// Debug logging
console.log('Loading product routes...');
console.log('Auth middleware:', auth);

// List a new product
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, stock } = req.body;
    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      business: req.user.businessId
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ message: 'Error listing product', error: error.message });
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

// Get featured products with timeout and caching
router.get('/featured', async (req, res) => {
  try {
    // Check cache first
    const cachedProducts = cache.get('featured_products');
    if (cachedProducts) {
      return res.json(cachedProducts);
    }

    // Add timeout to prevent H12 errors
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 25000)
    );
    
    const productsPromise = Product.find({ featured: true })
      .select('name description price imageUrl stock') // Only select needed fields
      .limit(10)
      .lean();
    
    const products = await Promise.race([productsPromise, timeoutPromise]);

    // Cache results for 5 minutes
    cache.put('featured_products', products, 300000);

    res.json(products);
  } catch (error) {
    console.error('Featured products error:', error);
    res.status(error.message === 'Request timeout' ? 503 : 500)
      .json({ message: error.message });
  }
});

module.exports = router;
