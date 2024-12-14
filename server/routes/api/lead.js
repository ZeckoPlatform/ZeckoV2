const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Lead = require('../../models/Lead');

// Get all leads
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const leads = await Lead.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments();

    res.json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's leads
router.get('/user', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const leads = await Lead.find({ client: req.user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Lead.countDocuments({ client: req.user.id });

    res.json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = new Lead({
      ...req.body,
      client: req.user.id
    });
    const newLead = await lead.save();
    res.status(201).json(newLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get single lead
router.get('/:id', async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    if (lead.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    Object.assign(lead, req.body);
    const updatedLead = await lead.save();
    res.json(updatedLead);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    if (lead.client.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await lead.remove();
    res.json({ message: 'Lead deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 