const express = require('express');
const router = express.Router();

// GET /api/contractors
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    const contractors = [];
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 