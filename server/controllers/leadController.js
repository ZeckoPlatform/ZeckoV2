const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const Credit = require('../models/Credit');

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

exports.submitProposal = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { amount, description } = req.body;
    const businessId = req.user._id;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    if (!lead.contractors.includes(businessId)) {
      return res.status(403).json({ message: 'Must purchase lead before submitting proposal' });
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
      description
    });

    await lead.save();
    res.json({ message: 'Proposal submitted successfully' });
  } catch (error) {
    console.error('Submit proposal error:', error);
    res.status(500).json({ message: 'Error submitting proposal' });
  }
};

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
    if (lead.postedBy.toString() !== req.user._id.toString()) {
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

    res.json({ message: 'Proposal status updated successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Update proposal status error:', error);
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
}; 