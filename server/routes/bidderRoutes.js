const express = require('express');
const router = express.Router();
const validationMiddleware = require('../middleware/validation');
const bidderController = require('../controllers/bidderController');
const { body, param, query } = require('express-validator');

const bidderProfileValidations = [
    body('specialties').isArray(),
    body('specialties.*').isMongoId(),
    body('experience').isInt({ min: 0 }),
    body('certifications').optional().isArray(),
    body('certifications.*.name').trim().isLength({ min: 2 }),
    body('certifications.*.issuer').trim().isLength({ min: 2 }),
    body('certifications.*.year').isInt({ min: 1900, max: new Date().getFullYear() }),
    body('portfolio').optional().isArray(),
    body('portfolio.*.title').trim().isLength({ min: 2 }),
    body('portfolio.*.description').trim().isLength({ min: 10 }),
    body('portfolio.*.images').optional().isArray(),
    body('portfolio.*.images.*').isURL(),
    validationMiddleware.handleValidationErrors
];

router.put('/profile', bidderProfileValidations, bidderController.updateProfile);

router.get('/stats', [
    query('period').optional().isIn(['week', 'month', 'year', 'all']),
    validationMiddleware.handleValidationErrors
], bidderController.getBidderStats);

router.get('/active-bids', [
    query('status').optional().isIn(['pending', 'accepted', 'rejected']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    validationMiddleware.handleValidationErrors
], bidderController.getActiveBids);

module.exports = router; 