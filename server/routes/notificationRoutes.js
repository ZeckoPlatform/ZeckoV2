const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Notification = require('../models/notificationModel');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');

// Get all notifications for the authenticated user
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('type').optional().isIn(['bid', 'order', 'message', 'system', 'payment']),
  validationMiddleware.handleValidationErrors
], notificationController.getNotifications);

// Mark a notification as read
router.put('/:notificationId/read', [
  param('notificationId').isMongoId()
], notificationController.markAsRead);

// Mark all notifications as read
router.put('/read-all', [], notificationController.markAllAsRead);

router.use(protect);

router.post('/email', notificationController.sendEmailNotification);

module.exports = router;
