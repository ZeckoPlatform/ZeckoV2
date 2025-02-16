const express = require('express');
const router = express.Router();
const { protect: authenticateToken } = require('../../middleware/auth');
const Lead = require('../../models/Lead');
const mongoose = require('mongoose');

// Add debugging at the start
console.log('Setting up lead routes');
console.log('authenticateToken exists:', typeof authenticateToken === 'function');

// Create new lead - Define the function before using it
const createLead = async (req, res) => {
    console.log('Creating lead with user:', req.user);
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const leadData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            budget: req.body.budget,
            client: req.user.id,
            leadPrice: req.body.leadPrice,
            location: req.body.location || {},
            requirements: req.body.requirements || [],
            attachments: req.body.attachments || [],
            status: 'active',
            visibility: req.body.visibility || 'public'
        };

        const lead = new Lead(leadData);
        const savedLead = await lead.save();
        
        await savedLead.populate([
            { path: 'category' },
            { path: 'client', select: 'username businessName' }
        ]);
        
        res.status(201).json(savedLead);
    } catch (err) {
        console.error('Error creating lead:', err);
        res.status(400).json({ message: err.message });
    }
};

// Now we can log it after it's defined
console.log('createLead exists:', typeof createLead === 'function');

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

// Use the createLead function in the route
router.post('/', authenticateToken, createLead);

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

// Purchase lead
router.post('/:id/purchase', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            throw new Error('Lead not found');
        }

        if (lead.contractors.includes(req.user.id)) {
            throw new Error('Already purchased this lead');
        }

        lead.contractors.push(req.user.id);
        await lead.save({ session });

        await session.commitTransaction();
        res.json({ message: 'Lead purchased successfully' });
    } catch (error) {
        await session.abortTransaction();
        console.error('Purchase lead error:', error);
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
});

// Submit proposal
router.post('/:id/proposals', authenticateToken, async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const existingProposal = lead.proposals.find(
            p => p.contractor.toString() === req.user.id.toString()
        );
        if (existingProposal) {
            return res.status(400).json({ message: 'Already submitted a proposal' });
        }

        lead.proposals.push({
            contractor: req.user.id,
            amount: req.body.amount,
            message: req.body.message
        });

        await lead.save();
        await lead.populate('proposals.contractor', 'username businessName');
        
        res.status(201).json(lead);
    } catch (error) {
        console.error('Submit proposal error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Update proposal status
router.patch('/:id/proposals/:proposalId/status', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const lead = await Lead.findById(req.params.id);
        if (!lead) {
            throw new Error('Lead not found');
        }

        if (lead.client.toString() !== req.user.id.toString()) {
            throw new Error('Unauthorized to update proposal status');
        }

        const proposal = lead.proposals.id(req.params.proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        proposal.status = req.body.status;
        
        if (req.body.status === 'accepted') {
            lead.status = 'in_progress';
            lead.selectedContractor = proposal.contractor;
        }

        await lead.save({ session });
        await session.commitTransaction();
        await lead.populate('proposals.contractor', 'username businessName');
        
        res.json(lead);
    } catch (error) {
        await session.abortTransaction();
        console.error('Update proposal status error:', error);
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
});

module.exports = router;