const express = require('express');
const router = express.Router();
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const cache = require('../middleware/cache');
const redis = require('../config/redis');
const multer = require('multer');
const productController = require('../controllers/productController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const productValidations = [
    body('title').trim().isLength({ min: 2, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price.current').isFloat({ min: 0 }),
    body('category').isMongoId(),
    body('inventory.quantity').optional().isInt({ min: 0 }),
    body('condition').isIn(['new', 'like-new', 'good', 'fair', 'poor']),
    body('status').optional().isIn(['draft', 'active', 'paused', 'sold', 'suspended']),
    validationMiddleware.handleValidationErrors
];

const productQueryValidations = [
    query('category').optional().isMongoId(),
    query('priceMin').optional().isFloat({ min: 0 }),
    query('priceMax').optional().isFloat({ min: 0 }),
    query('sort').optional().isIn(['price.current', '-price.current', 'title', '-title', 'createdAt', '-createdAt']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validationMiddleware.handleValidationErrors
];

// Public routes with caching
router.get('/', [cache(300), ...productQueryValidations], productController.getProducts);
router.get('/:id', [
    cache(600),
    param('id').trim().isLength({ min: 1 }),
    validationMiddleware.handleValidationErrors
], productController.getProduct);

// Protected seller routes with cache invalidation
router.post('/', [
    auth, 
    isVendor,
    upload.array('images', 5),
    ...productValidations
], async (req, res, next) => {
    try {
        await productController.createProduct(req, res, next);
        await redis.del('cache:/api/products');
    } catch (error) {
        next(error);
    }
});

router.put('/:id', [
    auth, 
    isVendor,
    upload.array('images', 5),
    param('id').isMongoId(),
    ...productValidations
], async (req, res, next) => {
    try {
        await productController.updateProduct(req, res, next);
        // Clear related caches
        await redis.del('cache:/api/products');
        await redis.del(`cache:/api/products/${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', [
    auth, 
    isVendor,
    param('id').isMongoId(),
    validationMiddleware.handleValidationErrors
], async (req, res, next) => {
    try {
        await productController.deleteProduct(req, res, next);
        // Clear related caches
        await redis.del('cache:/api/products');
        await redis.del(`cache:/api/products/${req.params.id}`);
    } catch (error) {
        next(error);
    }
});

// Seller products route
router.get('/seller/products', auth, productController.getSellerProducts);

// Stock update route
router.patch('/:id/stock', [
    auth,
    isVendor,
    param('id').isMongoId(),
    body('quantity').isInt({ min: 1 }),
    body('operation').isIn(['add', 'subtract']),
    validationMiddleware.handleValidationErrors
], productController.updateStock);

module.exports = router;
