const express = require('express');
const router = express.Router();
const path = require('path');
const { auth } = require('../middleware/auth');
const User = require('../models/userModel');

console.log('Loading userRoutes.js - START');

// Try both import methods
const userController = require('../controllers/userController');
const userControllerAlt = require(path.join(__dirname, '../controllers/userController.js'));

console.log('userController (regular import):', Object.keys(userController));
console.log('userController (alt import):', Object.keys(userControllerAlt));
console.log('register function exists:', typeof userController.register === 'function');

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);

console.log('Loading userRoutes.js - END');

module.exports = router;
