const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const BusinessUser = require('../../models/businessUserModel');

// GET /api/contractors
router.get('/', async (req, res) => {
  try {
    const contractors = await BusinessUser.find()
      .select('username businessName avatarUrl rating')
      .lean();
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/contractors/:id
router.get('/:id', async (req, res) => {
  try {
    const contractor = await BusinessUser.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }
    
    res.json(contractor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/contractors (for creating new contractor profiles)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { businessName, description, services, location } = req.body;
    
    const contractor = await BusinessUser.findByIdAndUpdate(
      req.user.id,
      {
        businessName,
        description,
        services,
        location,
        isContractor: true
      },
      { new: true }
    ).select('-password');

    if (!contractor) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json(contractor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/contractors/:id (for updating contractor profiles)
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    // Ensure user can only update their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const contractor = await BusinessUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    res.json(contractor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 