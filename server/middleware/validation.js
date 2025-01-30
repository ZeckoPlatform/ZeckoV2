const { body, param, query, validationResult } = require('express-validator');
const { sanitizeHtml, sanitizeResponse, sanitizeInput } = require('../utils/securityUtils');
const AppError = require('../utils/appError');

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

// Define validation chains first
const emailValidation = body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .custom(value => sanitizeInput(value))
    .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long');

const nameValidation = body('name')
    .trim()
    .not()
    .isEmpty()
    .custom(value => sanitizeInput(value))
    .withMessage('Please provide your name');

const loginPasswordValidation = body('password')
    .not()
    .isEmpty()
    .withMessage('Please provide your password');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        return next(new AppError(errorMessages.join(', '), 400));
    }
    next();
};

const validationMiddleware = {
    validateUser: [
        emailValidation,
        passwordValidation,
        nameValidation,
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
    sanitizeAndValidate,
    validateRegistration: [
        emailValidation,
        passwordValidation,
        nameValidation,
        handleValidationErrors
    ],
    validateLogin: [
        emailValidation,
        loginPasswordValidation,
        handleValidationErrors
    ]
}; 