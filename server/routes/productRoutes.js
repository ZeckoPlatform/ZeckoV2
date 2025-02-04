const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const { upload } = require('../config/cloudinary');

// Debug log to verify controller methods
console.log('Available product controller methods:', Object.keys(productController));

// Verify all required controller methods exist
const requiredMethods = [
    'getProducts',
    'getProduct',
    'getSellerProducts',
    'createProduct',
    'updateProduct',
    'deleteProduct',
    'updateStock'
];

requiredMethods.forEach(method => {
    if (!productController[method]) {
        throw new Error(`Missing required controller method: ${method}`);
    }
    console.log(`Controller method ${method} exists:`, typeof productController[method]);
});

// Protected seller routes
router.get('/seller/products', auth, isVendor, productController.getSellerProducts);

// Product CRUD routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

router.post('/',
    auth,
    isVendor,
    upload.array('images', 5),
    [
        body('title').trim().isLength({ min: 2 }),
        body('description').trim().isLength({ min: 10 }),
        body('price.current').isFloat({ min: 0 }),
        body('category').trim().notEmpty(),
        validationMiddleware.handleValidationErrors
    ],
    productController.createProduct
);

router.put('/:id',
    auth,
    isVendor,
    upload.array('images', 5),
    [
        body('title').optional().trim().isLength({ min: 2 }),
        body('description').optional().trim().isLength({ min: 10 }),
        body('price.current').optional().isFloat({ min: 0 }),
        body('category').optional().trim().notEmpty(),
        validationMiddleware.handleValidationErrors
    ],
    productController.updateProduct
);

router.delete('/:id', auth, isVendor, productController.deleteProduct);

router.patch('/:id/stock',
    auth,
    isVendor,
    [
        body('quantity').isInt({ min: 1 }),
        body('operation').isIn(['add', 'subtract']),
        validationMiddleware.handleValidationErrors
    ],
    productController.updateStock
);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
