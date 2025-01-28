const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Protected route example
router.get('/profile', auth, (req, res) => {
  res.json({ msg: 'This is a protected route', userId: req.user.id });
});

module.exports = router;
