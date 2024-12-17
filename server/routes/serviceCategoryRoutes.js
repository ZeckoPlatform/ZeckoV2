const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');
const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory
} = require('../controllers/serviceCategoryController');

// Public routes
router.get('/categories', getCategories);
router.get('/categories/:id', getCategoryById);

// Protected admin routes
router.post('/categories', auth, isAdmin, createCategory);
router.put('/categories/:id', auth, isAdmin, updateCategory);

module.exports = router; 
