const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const multer = require('multer');

// Configure multer
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

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

// Public routes
router.get('/', productQueryValidations, productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected routes
router.post('/', [
    auth,
    isVendor,
    upload.array('images', 5),
    ...productValidations
], productController.createProduct);

router.put('/:id', [
    auth,
    isVendor,
    upload.array('images', 5),
    param('id').isMongoId(),
    ...productValidations
], productController.updateProduct);

router.delete('/:id', [
    auth,
    isVendor,
    param('id').isMongoId(),
    validationMiddleware.handleValidationErrors
], productController.deleteProduct);

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
