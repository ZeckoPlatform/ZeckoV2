const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const { upload } = require('../config/cloudinary');

// Debug log to verify controller methods
console.log('Available product controller methods:', Object.keys(productController));

// Validation arrays
const productValidations = [
    body('title').trim().isLength({ min: 2, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price.current').isFloat({ min: 0 }),
    body('category').isMongoId(),
    body('inventory.quantity').optional().isInt({ min: 0 }),
    validationMiddleware.handleValidationErrors
];

const productQueryValidations = [
    query('category').optional().isMongoId(),
    query('priceMin').optional().isFloat({ min: 0 }),
    query('priceMax').optional().isFloat({ min: 0 }),
    query('sort').optional(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validationMiddleware.handleValidationErrors
];

// Define routes
const routes = [
    {
        path: '/seller/products',
        method: 'get',
        middleware: [auth, isVendor],
        handler: productController.getSellerProducts
    },
    {
        path: '/',
        method: 'get',
        handler: productController.getProducts
    },
    {
        path: '/:id',
        method: 'get',
        handler: productController.getProduct
    },
    {
        path: '/',
        method: 'post',
        middleware: [
            auth,
            isVendor,
            upload.array('images', 5),
            body('title').trim().isLength({ min: 2 }),
            body('description').trim().isLength({ min: 10 }),
            body('price.current').isFloat({ min: 0 }),
            body('category').trim().notEmpty(),
            validationMiddleware.handleValidationErrors
        ],
        handler: productController.createProduct
    },
    {
        path: '/:id',
        method: 'put',
        middleware: [
            auth,
            isVendor,
            upload.array('images', 5),
            body('title').optional().trim().isLength({ min: 2 }),
            body('description').optional().trim().isLength({ min: 10 }),
            body('price.current').optional().isFloat({ min: 0 }),
            body('category').optional().trim().notEmpty(),
            validationMiddleware.handleValidationErrors
        ],
        handler: productController.updateProduct
    },
    {
        path: '/:id',
        method: 'delete',
        middleware: [auth, isVendor],
        handler: productController.deleteProduct
    },
    {
        path: '/:id/stock',
        method: 'patch',
        middleware: [
            auth,
            isVendor,
            body('quantity').isInt({ min: 1 }),
            body('operation').isIn(['add', 'subtract']),
            validationMiddleware.handleValidationErrors
        ],
        handler: productController.updateStock
    }
];

// Register routes
routes.forEach(route => {
    const { path, method, middleware = [], handler } = route;
    if (!handler) {
        console.error(`Missing handler for route: ${method.toUpperCase()} ${path}`);
        return;
    }
    router[method](path, ...middleware, handler);
});

// Add error handling middleware
router.use((err, req, res, next) => {
    console.error('Route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router;
