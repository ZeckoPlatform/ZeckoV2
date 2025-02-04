const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const validationMiddleware = require('../middleware/validation');

// Debug log
console.log('Product controller:', {
    type: typeof productController,
    methods: Object.keys(productController),
    createProduct: typeof productController.createProduct
});

// GET routes with error handling
router.get('/', (req, res, next) => {
    productController.getProducts(req, res).catch(next);
});

router.get('/seller/products', auth, isVendor, (req, res, next) => {
    productController.getSellerProducts(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
    productController.getProduct(req, res).catch(next);
});

// POST route with validation
router.post('/', [
    auth,
    isVendor,
    upload.array('images', 5),
    body('title').trim().isLength({ min: 2 }),
    body('description').trim().isLength({ min: 10 }),
    body('price.current').isFloat({ min: 0 }),
    body('category').trim().notEmpty(),
    validationMiddleware.handleValidationErrors,
    (req, res, next) => {
        productController.createProduct(req, res).catch(next);
    }
]);

// PUT route with validation
router.put('/:id', [
    auth,
    isVendor,
    upload.array('images', 5),
    body('title').optional().trim().isLength({ min: 2 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('price.current').optional().isFloat({ min: 0 }),
    body('category').optional().trim().notEmpty(),
    validationMiddleware.handleValidationErrors,
    (req, res, next) => {
        productController.updateProduct(req, res).catch(next);
    }
]);

// DELETE route
router.delete('/:id', auth, isVendor, (req, res, next) => {
    productController.deleteProduct(req, res).catch(next);
});

// PATCH route for stock updates
router.patch('/:id/stock', [
    auth,
    isVendor,
    body('quantity').isInt({ min: 1 }),
    body('operation').isIn(['add', 'subtract']),
    validationMiddleware.handleValidationErrors,
    (req, res, next) => {
        productController.updateStock(req, res).catch(next);
    }
]);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Product route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
