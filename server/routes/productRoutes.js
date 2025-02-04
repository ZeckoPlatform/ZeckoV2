const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isVendor } = require('../middleware/auth');
const { body } = require('express-validator');
const { upload } = require('../config/cloudinary');
const validationMiddleware = require('../middleware/validation');

// Debug log to verify controller methods
console.log('Product controller methods:', Object.keys(productController));

// Basic routes
router.get('/', function(req, res, next) {
    return productController.getProducts(req, res).catch(next);
});

router.get('/:id', function(req, res, next) {
    return productController.getProduct(req, res).catch(next);
});

// Protected seller routes
router.get('/seller/products', auth, isVendor, function(req, res, next) {
    return productController.getSellerProducts(req, res).catch(next);
});

// Create product
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
    function(req, res, next) {
        return productController.createProduct(req, res).catch(next);
    }
);

// Update product
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
    function(req, res, next) {
        return productController.updateProduct(req, res).catch(next);
    }
);

// Delete product
router.delete('/:id', 
    auth, 
    isVendor, 
    function(req, res, next) {
        return productController.deleteProduct(req, res).catch(next);
    }
);

// Update stock
router.patch('/:id/stock',
    auth,
    isVendor,
    [
        body('quantity').isInt({ min: 1 }),
        body('operation').isIn(['add', 'subtract']),
        validationMiddleware.handleValidationErrors
    ],
    function(req, res, next) {
        return productController.updateStock(req, res).catch(next);
    }
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
