const Product = require('../models/productModel');
const Business = require('../models/Business');
const cache = require('memory-cache');

const productController = {
  // Create new product
  createProduct: async (req, res) => {
    try {
      const { name, description, price, category, imageUrl, stock } = req.body;
      const business = await Business.findOne({ owner: req.user.id });
      
      if (!business) {
        return res.status(400).json({ 
          message: 'You must have a business profile to list products' 
        });
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
      res.status(500).json({ 
        message: 'Error listing product', 
        error: error.message 
      });
    }
  },

  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find()
        .sort({ createdAt: -1 });
      res.json(products);
    } catch (error) {
      res.status(500).json({ 
        message: 'Error fetching products', 
        error: error.message 
      });
    }
  },

  // Search products
  searchProducts: async (req, res) => {
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
      res.status(500).json({ 
        message: 'Error searching products', 
        error: error.message 
      });
    }
  },

  // Get featured products
  getFeaturedProducts: async (req, res) => {
    try {
      const cachedProducts = cache.get('featured_products');
      if (cachedProducts) {
        return res.json(cachedProducts);
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database timeout')), 5000);
      });

      const queryPromise = Product.find({ featured: true })
        .select('title description price images featured')
        .limit(6)
        .lean()
        .exec();

      const products = await Promise.race([queryPromise, timeoutPromise]);
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
  }
};

module.exports = productController; 