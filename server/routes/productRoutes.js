const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const validationMiddleware = require('../middleware/validation');

// Debug log to verify controller methods
console.log('Product controller methods:', Object.keys(productController));

// Verify controller methods exist and are functions
Object.entries(productController).forEach(([name, method]) => {
    if (typeof method !== 'function') {
        throw new Error(`Controller method ${name} is not a function`);
    }
    console.log(`Verified ${method.name || name} is a function:`, typeof method);
});

// Basic routes
router.route('/')
    .get((req, res, next) => {
        productController.getProducts(req, res).catch(next);
    })
    .post(
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
        (req, res, next) => {
            productController.createProduct(req, res).catch(next);
        }
    );

// Seller products route
router.route('/seller/products')
    .get(auth, isVendor, (req, res, next) => {
        productController.getSellerProducts(req, res).catch(next);
    });

// Single product routes
router.route('/:id')
    .get((req, res, next) => {
        productController.getProduct(req, res).catch(next);
    })
    .put(
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
        (req, res, next) => {
            productController.updateProduct(req, res).catch(next);
        }
    )
    .delete(auth, isVendor, (req, res, next) => {
        productController.deleteProduct(req, res).catch(next);
    });

// Stock update route
router.route('/:id/stock')
    .patch(
        auth,
        isVendor,
        [
            body('quantity').isInt({ min: 1 }),
            body('operation').isIn(['add', 'subtract']),
            validationMiddleware.handleValidationErrors
        ],
        (req, res, next) => {
            productController.updateStock(req, res).catch(next);
        }
    );

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Route error:', err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
