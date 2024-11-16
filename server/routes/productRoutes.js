const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
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
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error searching products', error: error.message });
  }
});

// Get products by seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const products = await Product.find({ seller: req.params.sellerId }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching seller products', error: error.message });
  }
});

// Get all shop products
router.get('/shop/products', async (req, res) => {
  try {
    const products = await Product.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .populate('seller', 'name');
    res.json(products);
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({ message: 'Error fetching shop products' });
  }
});

// Get featured shop products
router.get('/shop/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ 
      isPublished: true,
      isFeatured: true 
    })
    .sort({ createdAt: -1 })
    .populate('seller', 'name');
    res.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Error fetching featured products' });
  }
});

// Search shop products
router.get('/shop/search', async (req, res) => {
  try {
    const { query } = req.query;
    const products = await Product.find({
      isPublished: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('seller', 'name');
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products' });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
    try {
        // Check cache first
        const cachedProducts = cache.get('featured_products');
        if (cachedProducts) {
            return res.json(cachedProducts);
        }

        // Set timeout for query
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database timeout')), 5000);
        });

        // Database query
        const queryPromise = Product.find({ featured: true })
            .select('title description price images featured')
            .limit(6)
            .lean()
            .exec();

        // Race between timeout and query
        const products = await Promise.race([queryPromise, timeoutPromise]);

        // Cache results for 5 minutes
        cache.put('featured_products', products, 5 * 60 * 1000);

        res.json(products);
    } catch (error) {
        console.error('Featured products error:', error);
        if (error.message === 'Database timeout') {
            return res.status(503).json({ 
                message: 'Service temporarily unavailable' 
            });
        }
        res.status(500).json({ 
            message: 'Error fetching featured products' 
        });
    }
});

module.exports = router;
