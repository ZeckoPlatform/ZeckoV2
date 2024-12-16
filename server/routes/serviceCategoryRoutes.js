const express = require('express');
const router = express.Router();
const { createCategory, getCategories } = require('../controllers/serviceCategoryController');
const { auth, adminOnly } = require('../middleware/auth');

// Public route to get all categories
router.get('/categories', getCategories);

// Protected route - only admins can create categories
router.post('/categories', auth, adminOnly, createCategory);

module.exports = router; 
