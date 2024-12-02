const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const productController = require('../controllers/productController');

// Create new product
router.post('/', auth, productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get featured products
router.get('/featured', productController.getFeaturedProducts);

module.exports = router;
