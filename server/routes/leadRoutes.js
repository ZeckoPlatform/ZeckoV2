const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Lead = require('../models/Lead');

// Get all leads with filtering
router.get('/', auth, async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { client: userId } : {};
        
        const leads = await Lead.find(query)
            .populate('category')
            .populate('client', 'username businessName')
            .sort({ createdAt: -1 })
            .limit(10);
            
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ message: 'Error fetching leads' });
    }
});

// Create new lead
router.post('/', auth, async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            subcategory,
            budget,
            location,
            requirements
        } = req.body;

        const lead = new Lead({
            title,
            description,
            category,
            subcategory,
            budget: {
                min: Number(budget.min),
                max: Number(budget.max),
                currency: budget.currency || 'GBP'
            },
            location: location || {},
            client: req.user.id,
            requirements: requirements || [{
                question: "Default Question",
                answer: "Default Answer"
            }],
            status: 'active',
            visibility: 'public'
        });
        
        const newLead = await lead.save();
        await newLead.populate('category');
        await newLead.populate('client', 'username businessName');
        
        res.status(201).json(newLead);
    } catch (error) {
        console.error('Error creating lead:', error);
        res.status(400).json({ 
            message: 'Error creating lead', 
            error: error.message 
        });
    }
});

// Get lead by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('category')
            .populate('client', 'username businessName')
            .populate('proposals.contractor', 'username businessName');

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Increment view count
        lead.metrics.viewCount += 1;
        await lead.save();

        res.json(lead);
    } catch (error) {
        console.error('Error fetching lead:', error);
        res.status(500).json({ message: 'Error fetching lead' });
    }
});

// Update lead
router.patch('/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findOneAndUpdate(
            { _id: req.params.id, client: req.user.id },
            req.body,
            { new: true }
        ).populate('category')
         .populate('client', 'username businessName');

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json(lead);
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(400).json({ message: 'Error updating lead' });
    }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findOneAndDelete({
            _id: req.params.id,
            client: req.user.id
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Error deleting lead:', error);
        res.status(500).json({ message: 'Error deleting lead' });
    }
});

// Submit proposal
router.post('/:id/proposals', auth, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        lead.proposals.push({
            contractor: req.user.id,
            amount: {
                value: req.body.amount,
                currency: 'GBP'
            },
            message: req.body.message
        });

        await lead.save();
        res.status(201).json(lead);
    } catch (error) {
        console.error('Error submitting proposal:', error);
        res.status(400).json({ message: 'Error submitting proposal' });
    }
});

module.exports = router;
