const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Lead = require('../models/Lead');
const { validateCategory, validateSubcategory } = require('../data/leadCategories');

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
};

// Get all leads with filtering
router.get('/', async (req, res, next) => {
    try {
        const { 
            userId, 
            category,
            status,
            search,
            limit = 10,
            page = 1,
            featured
        } = req.query;
        
        let query = {};
        
        // If userId is provided, get user's leads
        if (userId && userId !== 'undefined') {
            query.client = userId;
        } else {
            // Otherwise, get public leads
            query.status = { $in: ['active', 'open'] };
            query.visibility = 'public';
        }

        if (featured === 'true') {
            query.featured = true;
        }

        if (category) {
            query.category = category;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const leads = await Lead.find(query)
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
    } catch (error) {
        next(error);
    }
});

// Get latest leads for carousel
router.get('/latest', async (req, res, next) => {
  try {
    console.log('Fetching latest leads');
    const leads = await Lead.find({
      status: { $in: ['active', 'open'] },
      visibility: 'public'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('client', 'username businessName')
    .select('title description budget location category client createdAt');

    console.log('Found latest leads:', leads.length);
    res.json({ leads });
  } catch (error) {
    console.error('Error fetching latest leads:', error);
    next(error);
  }
});

// Get single lead
router.get('/:id', async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id)
            .populate('client', 'username businessName')
            .populate('proposals.contractor', 'username businessName');
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json(lead);
    } catch (error) {
        next(error);
    }
});

// Create new lead
router.post('/', auth, async (req, res, next) => {
    try {
        const lead = new Lead({
            ...req.body,
            client: req.user.id
        });
        
        await lead.save();
        res.status(201).json(lead);
    } catch (error) {
        next(error);
    }
});

// Update lead
router.patch('/:id', auth, async (req, res, next) => {
    try {
        const lead = await Lead.findOneAndUpdate(
            { _id: req.params.id, client: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found or unauthorized' });
        }
        
        res.json(lead);
    } catch (error) {
        next(error);
    }
});

// Delete lead
router.delete('/:id', auth, async (req, res, next) => {
    try {
        const lead = await Lead.findOneAndDelete({
            _id: req.params.id,
            client: req.user.id
        });
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found or unauthorized' });
        }
        
        res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Submit proposal
router.post('/:id/proposals', auth, async (req, res, next) => {
    try {
        const lead = await Lead.findById(req.params.id);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if user already submitted a proposal
        const existingProposal = lead.proposals.find(
            p => p.contractor.toString() === req.user.id
        );

        if (existingProposal) {
            return res.status(400).json({ message: 'You have already submitted a proposal' });
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
        next(error);
    }
});

router.use(errorHandler);

module.exports = router;
