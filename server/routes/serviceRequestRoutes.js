const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validation');
const { body, param, query } = require('express-validator');
const {
    createServiceRequest,
    getAllServiceRequests,
    getServiceRequest,
    updateServiceRequest,
    deleteServiceRequest
} = require('../controllers/serviceRequestController');

const router = express.Router();

const serviceRequestValidations = [
    body('title').trim().isLength({ min: 5, max: 100 }),
    body('description').trim().isLength({ min: 20, max: 1000 }),
    body('category').isMongoId(),
    body('budget').optional().isFloat({ min: 0 }),
    body('deadline').optional().isISO8601(),
    body('location').optional().isObject(),
    body('location.address').optional().trim().isLength({ min: 5 }),
    body('location.coordinates').optional().isArray(),
    body('location.coordinates.*').optional().isFloat(),
    body('attachments').optional().isArray(),
    body('attachments.*.url').optional().isURL(),
    body('attachments.*.type').optional().isIn(['image', 'document', 'other']),
    validationMiddleware.handleValidationErrors
];

// Protect all routes after this middleware
router.use(protect);

router.route('/')
    .get([
        query('status').optional().isIn(['pending', 'active', 'completed', 'cancelled']),
        query('category').optional().isMongoId(),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 50 }),
        validationMiddleware.handleValidationErrors
    ], getAllServiceRequests)
    .post(serviceRequestValidations, createServiceRequest);

router.route('/:id')
    .get([
        param('id').isMongoId(),
        validationMiddleware.handleValidationErrors
    ], getServiceRequest)
    .patch([
        param('id').isMongoId(),
        ...serviceRequestValidations
    ], updateServiceRequest)
    .delete([
        param('id').isMongoId(),
        validationMiddleware.handleValidationErrors
    ], deleteServiceRequest);

// Admin routes
router.use(restrictTo('admin'));
router.route('/admin/all').get(getAllServiceRequests);

module.exports = router; 