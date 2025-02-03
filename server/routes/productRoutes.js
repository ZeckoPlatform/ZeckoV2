const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const { upload } = require('../config/cloudinary');

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

// Seller products route (must be before /:id routes)
router.get('/seller/products', 
    auth, 
    isVendor, 
    productController.getSellerProducts
);

// Protected routes
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

router.delete('/:id',
    auth,
    isVendor,
    productController.deleteProduct
);

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

// Public routes (must be last)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

module.exports = router;
