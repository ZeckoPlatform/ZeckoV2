const express = require('express');
const router = express.Router();
const { auth, isVendor } = require('../middleware/auth');
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

// Public routes
router.get('/products', getProducts);
router.get('/products/:slug', getProduct);

// Protected vendor routes
router.post('/products', auth, isVendor, createProduct);
router.put('/products/:id', auth, isVendor, updateProduct);
router.delete('/products/:id', auth, isVendor, deleteProduct);

module.exports = router;
