const express = require('express');
const router = express.Router();
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const cache = require('../middleware/cache');
const redis = require('../config/redis');
const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const productValidations = [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price').isFloat({ min: 0 }),
    body('category').isMongoId(),
    body('stock').optional().isInt({ min: 0 }),
    body('images').optional().isArray(),
    body('images.*').isURL(),
    body('specifications').optional().isObject(),
    validationMiddleware.handleValidationErrors
];

const productQueryValidations = [
    query('category').optional().isMongoId(),
    query('minPrice').optional().isFloat({ min: 0 }),
    query('maxPrice').optional().isFloat({ min: 0 }),
    query('sort').optional().isIn(['price', '-price', 'name', '-name', 'createdAt', '-createdAt']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validationMiddleware.handleValidationErrors
];

// Public routes with caching
router.get('/products', [cache(300), ...productQueryValidations], getProducts);
router.get('/products/:slug', [
    cache(600),
    param('slug').trim().isLength({ min: 1 }),
    validationMiddleware.handleValidationErrors
], getProduct);

// Protected vendor routes with cache invalidation
router.post('/products', [auth, isVendor, ...productValidations], async (req, res) => {
    try {
        const product = await createProduct(req, res);
        await redis.del('cache:/api/products');
        return product;
    } catch (error) {
        throw error;
    }
});

router.put('/products/:id', [
    auth, 
    isVendor,
    param('id').isMongoId(),
    ...productValidations
], async (req, res) => {
    try {
        const product = await updateProduct(req, res);
        // Clear related caches
        await redis.del('cache:/api/products');
        await redis.del(`cache:/api/products/${req.params.id}`);
        return product;
    } catch (error) {
        throw error;
    }
});

router.delete('/products/:id', [
    auth, 
    isVendor,
    param('id').isMongoId(),
    validationMiddleware.handleValidationErrors
], async (req, res) => {
    try {
        const result = await deleteProduct(req, res);
        // Clear related caches
        await redis.del('cache:/api/products');
        await redis.del(`cache:/api/products/${req.params.id}`);
        return result;
    } catch (error) {
        throw error;
    }
});

module.exports = router;
