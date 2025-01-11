const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Lead = require('../models/Lead');
const { validateCategory, validateSubcategory } = require('../data/leadCategories');

// Get all leads with filtering
router.get('/', async (req, res) => {
    try {
        const { userId, category } = req.query;
        let query = {};
        
        if (userId && userId !== 'undefined') {
            query.client = userId;
        } else {
            query = {
                status: { $in: ['active', 'open'] },
                visibility: 'public'
            };
        }

        if (category && validateCategory(category)) {
            query.category = category;
        }
        
        const leads = await Lead.find(query)
            .populate('client', 'username businessName')
            .sort({ createdAt: -1 })
            .limit(10);
        
        console.log('Leads being sent:', JSON.stringify(leads, null, 2));
            
        res.json(leads);
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ 
            message: 'Error fetching leads',
            error: error.message 
        });
    }
});

// Create new lead
router.post('/', auth, async (req, res) => {
    try {
        const { category, subcategory, location = {} } = req.body;

        // Ensure location object has all required fields
        const sanitizedLocation = {
            address: location.address || '',
            city: location.city || '',
            state: location.state || '',
            country: location.country || '',
            postalCode: location.postalCode || ''
        };

        // Validate category and subcategory
        if (!validateCategory(category)) {
            return res.status(400).json({ error: 'Invalid category' });
        }

        if (subcategory && !validateSubcategory(category, subcategory)) {
            return res.status(400).json({ error: 'Invalid subcategory' });
        }

        const lead = new Lead({
            ...req.body,
            location: sanitizedLocation,
            client: req.user.id,
            status: 'active'
        });

        await lead.save();
        res.status(201).json(lead);
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

// Put lead
router.put('/:id', auth, async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json(lead);
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ message: 'Error updating lead' });
    }
});

module.exports = router;
