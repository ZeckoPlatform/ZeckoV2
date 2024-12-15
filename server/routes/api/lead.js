const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const Lead = require('../../models/Lead');

// Get all leads or featured leads
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.featured === 'true') {
            query.featured = true;
        }
        
        const limit = parseInt(req.query.limit) || 10;
        const leads = await Lead.find(query)
            .limit(limit)
            .sort({ createdAt: -1 });

        res.header('Content-Type', 'application/json');
        res.json(leads);
    } catch (err) {
        console.error('Error fetching leads:', err);
        res.status(500).json({ message: err.message });
    }
});

// Create new lead
router.post('/', authenticateToken, async (req, res) => {
    try {
        const lead = new Lead({
            ...req.body,
            user: req.user.id,
            createdAt: new Date()
        });
        
        const newLead = await lead.save();
        res.header('Content-Type', 'application/json');
        res.status(201).json(newLead);
    } catch (err) {
        console.error('Error creating lead:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get lead by ID
router.get('/:id', async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.header('Content-Type', 'application/json');
        res.json(lead);
    } catch (err) {
        console.error('Error fetching lead by ID:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;