const express = require('express');
const router = express.Router();
const { protect: authenticateToken } = require('../middleware/auth');
const upload = require('../config/cloudinary'); // We'll create this
const profileController = require('../controllers/profileController'); // We'll create this

// Profile routes
router.get('/', authenticateToken, profileController.getProfile);
router.put('/', authenticateToken, profileController.updateProfile);
router.delete('/', authenticateToken, profileController.deleteProfile);

// Avatar routes
router.post('/avatar', authenticateToken, upload.single('avatar'), profileController.uploadAvatar);

// Address routes
router.get('/addresses', authenticateToken, profileController.getAddresses);
router.post('/addresses', authenticateToken, profileController.addAddress);
router.put('/addresses/:addressId', authenticateToken, profileController.updateAddress);
router.delete('/addresses/:addressId', authenticateToken, profileController.deleteAddress);

module.exports = router; 