const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
    sendMessage,
    getMessages,
    getUnreadCount
} = require('../controllers/messageController');

router.post('/messages', auth, sendMessage);
router.get('/messages/:requestId', auth, getMessages);
router.get('/messages/unread/count', auth, getUnreadCount);

module.exports = router; 