const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, isVendor } = require('../middleware/auth');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const validationMiddleware = require('../middleware/validation');

// Debug log
console.log('Product controller:', {
    type: typeof productController,
    methods: Object.keys(productController),
    createProduct: typeof productController.createProduct
});

// GET routes
router.get('/', async (req, res, next) => {
    try {
        await productController.getProducts(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/seller/products', protect, isVendor, async (req, res, next) => {
    try {
        await productController.getSellerProducts(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        await productController.getProduct(req, res);
    } catch (error) {
        next(error);
    }
});

// POST route
router.post('/', [
    protect,
    isVendor,
    upload.array('images', 5),
    body('title').trim().isLength({ min: 2 }),
    body('description').trim().isLength({ min: 10 }),
    body('price.current').isFloat({ min: 0 }),
    body('category').trim().notEmpty(),
    validationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            await productController.createProduct(req, res);
        } catch (error) {
            next(error);
        }
    }
]);

// PUT route
router.put('/:id', [
    protect,
    isVendor,
    upload.array('images', 5),
    body('title').optional().trim().isLength({ min: 2 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('price.current').optional().isFloat({ min: 0 }),
    body('category').optional().trim().notEmpty(),
    validationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            await productController.updateProduct(req, res);
        } catch (error) {
            next(error);
        }
    }
]);

// DELETE route
router.delete('/:id', protect, isVendor, async (req, res, next) => {
    try {
        await productController.deleteProduct(req, res);
    } catch (error) {
        next(error);
    }
});

// PATCH route for stock updates
router.patch('/:id/stock', [
    protect,
    isVendor,
    body('quantity').isInt({ min: 1 }),
    body('operation').isIn(['add', 'subtract']),
    validationMiddleware.handleValidationErrors,
    async (req, res, next) => {
        try {
            await productController.updateStock(req, res);
        } catch (error) {
            next(error);
        }
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
