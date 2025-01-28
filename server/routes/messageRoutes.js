const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    sendMessage,
    getMessages,
    getUnreadCount
} = require('../controllers/messageController');
const validationMiddleware = require('../middleware/validation');
const { body, param } = require('express-validator');

const messageValidations = [
    body('recipientId').isMongoId(),
    body('content').trim().isLength({ min: 1, max: 1000 }),
    body('type').isIn(['text', 'image', 'file']),
    body('metadata').optional().isObject(),
    validationMiddleware.handleValidationErrors
];

router.post('/messages', auth, sendMessage);
router.get('/messages/:requestId', auth, getMessages);
router.get('/messages/unread/count', auth, getUnreadCount);
router.post('/send', messageValidations, sendMessage);
router.put('/:messageId/read', [
    param('messageId').isMongoId()
], sendMessage);

module.exports = router; 