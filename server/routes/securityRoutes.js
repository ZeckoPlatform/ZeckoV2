const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const { auth } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get security settings
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      twoFactorEnabled: user.twoFactorEnabled || false,
      emailNotifications: user.emailNotifications || false,
      lastPasswordChange: user.lastPasswordChange,
      loginHistory: user.loginHistory || []
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    res.status(500).json({ message: 'Error fetching security settings' });
  }
});

// Update password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.lastPasswordChange = Date.now();

    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Error updating password' });
  }
});

// Toggle two-factor authentication
router.put('/2fa', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.twoFactorEnabled = !user.twoFactorEnabled;
    await user.save();
    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    res.status(500).json({ message: 'Error toggling 2FA' });
  }
});

// Toggle email notifications
router.put('/notifications', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.emailNotifications = !user.emailNotifications;
    await user.save();
    res.json({ emailNotifications: user.emailNotifications });
  } catch (error) {
    console.error('Error toggling notifications:', error);
    res.status(500).json({ message: 'Error toggling notifications' });
  }
});

module.exports = router; 