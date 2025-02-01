const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const Lead = require('../../models/Lead');
const leadController = require('../../controllers/leadController');

// Get all leads with filtering
router.get('/', async (req, res) => {
    try {
        const { 
            featured, 
            category, 
            status, 
            search,
            limit = 10,
            page = 1
        } = req.query;

        const query = {};
        
        if (featured === 'true') query.featured = true;
        if (category) query.category = category;
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const leads = await Lead.find(query)
            .populate('category')
            .populate('client', 'username businessName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Lead.countDocuments(query);

        res.json({
            leads,
            total,
            pages: Math.ceil(total / limit)
        });
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
            client: req.user.id,
            status: 'active'
        });
        
        const newLead = await lead.save();
        await newLead.populate('category');
        await newLead.populate('client', 'username businessName');
        
        res.status(201).json(newLead);
    } catch (err) {
        console.error('Error creating lead:', err);
        res.status(400).json({ message: err.message });
    }
});

// Get lead by ID
router.get('/:id', async (req, res) => {
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
    } catch (err) {
        console.error('Error fetching lead:', err);
        res.status(500).json({ message: err.message });
    }
});

// Update lead
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        const lead = await Lead.findOne({ 
            _id: req.params.id,
            client: req.user.id 
        });

        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        Object.assign(lead, req.body);
        await lead.save();
        
        await lead.populate('category');
        await lead.populate('client', 'username businessName');

        res.json(lead);
    } catch (err) {
        console.error('Error updating lead:', err);
        res.status(400).json({ message: err.message });
    }
});

// Submit proposal
router.post('/:leadId/proposals', 
    authenticateToken, 
    leadController.submitProposal
);

// Get latest leads for carousel
router.get('/latest', async (req, res) => {
    try {
        const latestLeads = await Lead.find({
            status: 'active',
            visibility: 'public'
        })
        .populate('category')
        .populate('client', 'username businessName')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title description budget location createdAt category client')
        .lean();

        res.json(latestLeads);
    } catch (err) {
        console.error('Error fetching latest leads:', err);
        res.status(500).json({ message: 'Error fetching latest leads' });
    }
});

// Update proposal status
router.patch('/:leadId/proposals/:proposalId/status', 
    authenticateToken, 
    leadController.updateProposalStatus
);

// Add the new routes that use controller methods
router.post('/:leadId/purchase', 
    authenticateToken, 
    leadController.purchaseLead
);

module.exports = router;