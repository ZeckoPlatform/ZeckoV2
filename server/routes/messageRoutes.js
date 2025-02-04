const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validationMiddleware = require('../middleware/validation');

// Validation middleware
const validateMessage = [
    body('content').trim().notEmpty().withMessage('Message content is required'),
    body('conversationId').isMongoId().withMessage('Valid conversation ID is required'),
    validationMiddleware.handleValidationErrors
];

// Routes
router.get('/conversation/:conversationId', protect, messageController.getMessages);

router.post('/', 
    protect, 
    validateMessage,
    messageController.sendMessage
);

router.put('/:messageId',
    protect,
    [
        body('content').trim().notEmpty().withMessage('Message content is required'),
        validationMiddleware.handleValidationErrors
    ],
    messageController.updateMessage
);

router.delete('/:messageId', protect, messageController.deleteMessage);

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Message route error:', err);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

module.exports = router; 