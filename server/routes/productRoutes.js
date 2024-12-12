const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');

// GET /api/products
router.get('/', async (req, res) => {
    try {
        console.log('Fetching products with query:', req.query);
        const query = {};
        
        // Add featured filter if specified
        if (req.query.featured) {
            query.featured = req.query.featured === 'true';
        }
        
        const products = await Product.find(query)
            .lean()
            .select('-__v')
            .limit(50);
            
        console.log(`Found ${products.length} products`);
        res.json(products);
    } catch (error) {
        console.error('Product route error:', error);
        res.status(500).json({
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
});

module.exports = router;
