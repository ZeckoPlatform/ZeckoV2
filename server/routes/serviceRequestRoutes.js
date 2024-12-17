const express = require('express');
const router = express.Router();
const { auth, isVendor } = require('../middleware/auth');
const {
    createRequest,
    getRequests,
    submitQuote
} = require('../controllers/serviceRequestController');

// Protected routes
router.post('/requests', auth, createRequest);
router.get('/requests', auth, getRequests);
router.post('/requests/:id/quote', auth, isVendor, submitQuote);

module.exports = router; 