const express = require('express');
const router = express.Router();
const Product = require('../models/productModel');
const { authenticateToken } = require('../middleware/auth');

// Add error handling and logging
router.get('/', async (req, res) => {
    try {
        console.log('GET /products request received');
        const startTime = Date.now();

        const products = await Product.find({})
            .lean()
            .timeout(5000) // 5 second timeout
            .maxTimeMS(5000);

        console.log(`GET /products completed in ${Date.now() - startTime}ms`);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ 
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'production' ? null : error.message
        });
    }
});

// Add monitoring for slow queries
router.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 1000) {
            console.warn(`Slow product route: ${req.method} ${req.url} took ${duration}ms`);
        }
    });
    next();
});

module.exports = router;
