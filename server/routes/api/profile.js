const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../../middleware/auth');
const User = require('../../models/userModel');
const BusinessUser = require('../../models/businessUserModel');
const VendorUser = require('../../models/vendorUserModel');
const bcrypt = require('bcrypt');

// Define base upload path - pointing to root directory
const uploadPath = path.join(__dirname, '../../../../uploads/avatars');
console.log('Upload path:', uploadPath); // Debug log

// Create directory if it doesn't exist
fs.mkdirSync(uploadPath, { recursive: true });

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Saving file to:', uploadPath); // Debug log
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'avatar-' + uniqueSuffix + path.extname(file.originalname);
    console.log('Generated filename:', filename); // Debug log
    cb(null, filename);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image file.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

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

// Avatar upload endpoint
router.post('/avatar', authenticateToken, (req, res, next) => {
  console.log('Avatar upload endpoint hit');
  console.log('User from token:', req.user);
  
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        console.log('No file received');
        return res.status(400).json({ message: 'No file uploaded' });
      }

      let Model;
      console.log('Account type:', req.user.accountType);
      
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

      console.log('Looking for user with ID:', req.user.userId);
      const user = await Model.findById(req.user.userId);
      
      if (!user) {
        console.log('User not found in database');
        return res.status(404).json({ message: 'User not found' });
      }

      // Update avatar URL (remove leading slash since it's relative to uploads directory)
      const avatarUrl = `uploads/avatars/${req.file.filename}`;
      console.log('Setting avatar URL:', avatarUrl);
      user.avatarUrl = avatarUrl;
      await user.save();

      res.json({ avatarUrl });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Error uploading avatar', error: error.message });
    }
  });
});

// Change password endpoint
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
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

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Error changing password' });
  }
});

module.exports = router; 