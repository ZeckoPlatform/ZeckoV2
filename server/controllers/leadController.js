const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Credit = require('../models/Credit');

// Get all leads with filtering
exports.getLeads = async (req, res) => {
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
};

// Create new lead
exports.createLead = async (req, res) => {
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
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
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
};

// Update lead
exports.updateLead = async (req, res) => {
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
};

// Get latest leads
exports.getLatestLeads = async (req, res) => {
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
};

exports.purchaseLead = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { leadId } = req.params;
    const businessId = req.user._id;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new Error('Lead not found');
    }

    if (lead.contractors.includes(businessId)) {
      throw new Error('Already purchased this lead');
    }

    // Check credit balance
    const credit = await Credit.findOne({ business: businessId });
    if (!credit || credit.balance < lead.leadPrice) {
      throw new Error('Insufficient credits');
    }

    // Update credit balance
    await Credit.findByIdAndUpdate(credit._id, {
      $inc: { balance: -lead.leadPrice }
    }, { session });

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
};

// Submit proposal
exports.submitProposal = async (req, res) => {
    try {
        const { leadId } = req.params; // Changed from id to leadId to match route
        const { amount, message } = req.body;
        const businessId = req.user.id;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }

        // Check if user has already submitted a proposal
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
        
        // Populate the new proposal's contractor info
        await lead.populate('proposals.contractor', 'username businessName');
        
        res.status(201).json(lead);
    } catch (error) {
        console.error('Submit proposal error:', error);
        res.status(500).json({ message: 'Error submitting proposal' });
    }
};

// Update proposal status
exports.updateProposalStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { leadId, proposalId } = req.params;
        const { status } = req.body;

        const lead = await Lead.findById(leadId);
        if (!lead) {
            throw new Error('Lead not found');
        }

        // Verify user owns the lead
        if (lead.client.toString() !== req.user.id.toString()) { // Changed from postedBy to client
            throw new Error('Unauthorized to update proposal status');
        }

        const proposal = lead.proposals.id(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.status !== 'pending') {
            throw new Error('Can only update pending proposals');
        }

        // Update proposal status
        proposal.status = status;

        // If accepting proposal, update lead status and selected contractor
        if (status === 'accepted') {
            // Check if any other proposal is already accepted
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

        // Populate necessary fields before sending response
        await lead.populate('proposals.contractor', 'username businessName');
        
        res.json(lead);
    } catch (error) {
        await session.abortTransaction();
        console.error('Update proposal status error:', error);
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
}; 