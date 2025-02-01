const express = require('express');
const router = express.Router();
const { protect: authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');
const RateLimitService = require('../services/rateLimitService');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// Authentication routes
router.post('/register', 
    RateLimitService.registrationLimiter,
    [
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        body('username').trim().isLength({ min: 3 }),
        handleValidationErrors
    ],
    userController.register
);

router.post('/login', 
    RateLimitService.authLimiter,
    [
        body('email').isEmail(),
        body('password').exists(),
        handleValidationErrors
    ],
    userController.login
);

router.post('/logout', authenticateToken, userController.logout);
router.post('/refresh-token', RateLimitService.authLimiter, userController.refreshToken);

// Password management
router.post('/change-password', 
    authenticateToken,
    [
        body('currentPassword').exists(),
        body('newPassword').isLength({ min: 6 }),
        handleValidationErrors
    ],
    userController.changePassword
);

router.post('/forgot-password', 
    RateLimitService.passwordResetLimiter,
    [body('email').isEmail(), handleValidationErrors],
    userController.forgotPassword
);

router.post('/reset-password/:token', 
    RateLimitService.passwordResetLimiter,
    [body('password').isLength({ min: 6 }), handleValidationErrors],
    userController.resetPassword
);

// Verification
router.get('/verify-token', authenticateToken, userController.verifyToken);

// Security settings
router.get('/security-settings', authenticateToken, userController.getSecuritySettings);
router.patch('/security-settings', authenticateToken, userController.updateSecuritySettings);

// 2FA
router.post('/2fa/setup', authenticateToken, userController.setup2FA);
router.post('/2fa/verify', authenticateToken, userController.verify2FA);

module.exports = router;
