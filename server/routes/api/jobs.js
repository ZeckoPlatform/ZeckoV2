const express = require('express');
const router = express.Router();

// GET /api/jobs
router.get('/', async (req, res) => {
  try {
    // TODO: Replace with actual database query
    const jobs = [];
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 