const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');
const Lead = require('../../models/Lead');
const mongoose = require('mongoose');

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

// Create new lead
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Validate required fields based on the schema
        const requiredFields = ['title', 'description', 'category', 'subcategory', 'budget', 'leadPrice'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }

        // Validate budget structure
        if (!req.body.budget.min || !req.body.budget.max || !req.body.budget.currency) {
            return res.status(400).json({
                message: 'Budget must include min, max, and currency'
            });
        }

        const leadData = {
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            subcategory: req.body.subcategory,
            budget: {
                min: req.body.budget.min,
                max: req.body.budget.max,
                currency: req.body.budget.currency
            },
            location: req.body.location || {
                address: '',
                city: '',
                state: '',
                country: '',
                postalCode: ''
            },
            client: req.user.id,
            requirements: req.body.requirements || [],
            attachments: req.body.attachments || [],
            status: 'active',
            visibility: req.body.visibility || 'public',
            leadPrice: req.body.leadPrice,
            metrics: {
                viewCount: 0,
                proposalCount: 0
            }
        };

        const lead = new Lead(leadData);
        const newLead = await lead.save();
        
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

// Purchase lead
router.post('/:id/purchase', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const businessId = req.user._id;

        const lead = await Lead.findById(id);
        if (!lead) {
            throw new Error('Lead not found');
        }

        if (lead.contractors.includes(businessId)) {
            throw new Error('Already purchased this lead');
        }

        // Add contractor to lead
        lead.contractors.push(businessId);
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
        const { id } = req.params;
        const { amount, message } = req.body;
        const businessId = req.user.id;

        const lead = await Lead.findById(id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        const existingProposal = lead.proposals.find(
            p => p.contractor.toString() === businessId.toString()
        );
        if (existingProposal) {
            return res.status(400).json({ message: 'Already submitted a proposal' });
        }

        lead.proposals.push({
            contractor: businessId,
            amount,
            message
        });

        await lead.save();
        await lead.populate('proposals.contractor', 'username businessName');
        
        res.status(201).json(lead);
    } catch (error) {
        console.error('Submit proposal error:', error);
        res.status(500).json({ message: 'Error submitting proposal' });
    }
});

// Update proposal status
router.patch('/:id/proposals/:proposalId/status', authenticateToken, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id, proposalId } = req.params;
        const { status } = req.body;

        const lead = await Lead.findById(id);
        if (!lead) {
            throw new Error('Lead not found');
        }

        if (lead.client.toString() !== req.user.id.toString()) {
            throw new Error('Unauthorized to update proposal status');
        }

        const proposal = lead.proposals.id(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'pending') {
            throw new Error('Can only update pending proposals');
        }

        proposal.status = status;

        if (status === 'accepted') {
            const hasAcceptedProposal = lead.proposals.some(
                p => p.status === 'accepted' && p._id.toString() !== proposalId
            );
            
            if (hasAcceptedProposal) {
                throw new Error('Another proposal has already been accepted');
            }

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