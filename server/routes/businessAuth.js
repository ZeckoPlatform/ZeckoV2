const express = require('express');
const router = express.Router();
const BusinessUser = require('../models/businessUserModel');
const Business = require('../models/businessModel');
const jwt = require('jsonwebtoken');
const validationMiddleware = require('../middleware/validation');
const { body } = require('express-validator');
const {
    registerBusiness,
    loginBusiness,
    logoutBusiness,
    forgotBusinessPassword,
    resetBusinessPassword,
    verifyBusinessEmail,
    resendVerificationEmail,
    refreshToken,
    changePassword
} = require('../controllers/businessAuthController');
const { verifyToken } = require('../middleware/authMiddleware');
const RateLimitService = require('../services/rateLimitService');

// Business Registration
router.post('/register', RateLimitService.registrationLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    body('businessName').trim().isLength({ min: 2 }),
    body('businessType').isIn(['contractor', 'company', 'individual']),
    body('phone').matches(/^\+?[\d\s-]{10,}$/),
    validationMiddleware.handleValidationErrors
], registerBusiness);

// Business Login
router.post('/login', RateLimitService.authLimiter, [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    validationMiddleware.handleValidationErrors
], loginBusiness);

router.post('/logout', verifyToken, logoutBusiness);

router.post('/forgot-password', RateLimitService.passwordResetLimiter, [
    body('email').isEmail().normalizeEmail(),
    validationMiddleware.handleValidationErrors
], forgotBusinessPassword);

router.post('/reset-password', RateLimitService.passwordResetLimiter, [
    body('token').exists(),
    body('password').isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    validationMiddleware.handleValidationErrors
], resetBusinessPassword);

router.post('/verify-email', [
    body('token').exists(),
    validationMiddleware.handleValidationErrors
], verifyBusinessEmail);

router.post('/resend-verification', [
    body('email').isEmail().normalizeEmail(),
    validationMiddleware.handleValidationErrors
], resendVerificationEmail);

router.post('/refresh-token', [
    body('refreshToken').exists(),
    validationMiddleware.handleValidationErrors
], refreshToken);

router.post('/change-password', [
    body('currentPassword').exists(),
    body('newPassword').isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    validationMiddleware.handleValidationErrors
], verifyToken, changePassword);

module.exports = router; 