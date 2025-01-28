const { body, param, query, validationResult } = require('express-validator');
const { sanitizeHtml, sanitizeResponse } = require('../utils/securityUtils');

const sanitizeAndValidate = (value, options = {}) => {
    return body(value)
        .trim()
        .escape()
        .customSanitizer(value => sanitizeHtml(value))
        .custom((value, { req }) => {
            // Check for common XSS patterns
            const xssPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /onerror=/gi,
                /onload=/gi,
                /onclick=/gi
            ];
            
            const hasXSS = xssPatterns.some(pattern => pattern.test(value));
            if (hasXSS) {
                throw new Error('Potential XSS attack detected');
            }
            return true;
        });
};

const validationMiddleware = {
    validateUser: [
        body('email').isEmail().normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
        body('name').trim().isLength({ min: 2 }),
        handleValidationErrors
    ],

    validateLead: [
        body('title').trim().isLength({ min: 3, max: 100 }),
        body('description').trim().isLength({ min: 10 }),
        body('budget').isNumeric(),
        body('category').isMongoId(),
        handleValidationErrors
    ],

    validateBid: [
        body('amount').isNumeric().isFloat({ min: 0 }),
        body('proposal').trim().isLength({ min: 10 }),
        body('leadId').isMongoId(),
        handleValidationErrors
    ],

    validatePayment: [
        body('amount').isNumeric().isFloat({ min: 0 }),
        body('currency').isIn(['USD', 'EUR', 'GBP']),
        body('paymentMethod').isIn(['card', 'bank_transfer']),
        handleValidationErrors
    ]
};

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(sanitizeResponse({
            errors: errors.array()
        }));
    }
    
    // Add response sanitization to res.json
    const originalJson = res.json;
    res.json = function (data) {
        return originalJson.call(this, sanitizeResponse(data));
    };
    
    next();
};

// Common validation patterns that can be reused across routes
const commonValidations = {
    // MongoDB ID validation
    mongoId: param => param.isMongoId(),
    
    // Pagination validation
    pagination: [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 })
    ],

    // String validations with XSS protection
    description: sanitizeAndValidate('description')
        .isLength({ min: 10, max: 1000 }),
    name: sanitizeAndValidate('name')
        .isLength({ min: 2, max: 50 }),
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .escape(),
    
    // Other existing validations...
};

module.exports = {
    validationMiddleware,
    commonValidations,
    handleValidationErrors,
    sanitizeAndValidate
}; 