const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../../middleware/auth');
const User = require('../../models/userModel');
const BusinessUser = require('../../models/businessUserModel');
const VendorUser = require('../../models/vendorUserModel');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'uploads/avatars',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Update profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { username, address, phone, businessName } = req.body;
    let Model;

    // Determine which model to use based on account type
    switch(req.user.accountType) {
      case 'business':
        Model = BusinessUser;
        break;
      case 'vendor':
        Model = VendorUser;
        break;
      default:
        Model = User;
    }

    const user = await Model.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (username) user.username = username;
    if (address) user.address = address;
    if (phone) user.phone = phone;
    if (businessName && ['business', 'vendor'].includes(req.user.accountType)) {
      user.businessName = businessName;
    }

    await user.save();

    // Return updated user data
    const userData = {
      id: user._id,
      email: user.email,
      username: user.username,
      address: user.address,
      phone: user.phone,
      accountType: req.user.accountType,
      businessName: user.businessName
    };

    res.json(userData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let Model;
    switch(req.user.accountType) {
      case 'business':
        Model = BusinessUser;
        break;
      case 'vendor':
        Model = VendorUser;
        break;
      default:
        Model = User;
    }

    const user = await Model.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatarUrl = avatarUrl;
    await user.save();

    res.json({ avatarUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
});

module.exports = router; 