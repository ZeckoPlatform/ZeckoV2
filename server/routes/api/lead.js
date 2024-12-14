const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Lead = require('../../models/Lead');

router.get('/', async (req, res) => {
    try {
        const leads = await Lead.find();
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const lead = new Lead({
            ...req.body,
            user: req.user.id
        });
        const newLead = await lead.save();
        res.status(201).json(newLead);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;