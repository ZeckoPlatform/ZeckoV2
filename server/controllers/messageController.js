const Message = require('../models/messageModel');
const ServiceRequest = require('../models/serviceRequestModel');
const { validateRequest } = require('../utils/validator');
const Lead = require('../models/leadModel');

exports.sendMessage = async (req, res) => {
    try {
        const { error } = validateRequest(req.body, {
            requestId: 'required|mongoId',
            recipientId: 'required|mongoId',
            content: 'required|string|min:1'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const { requestId, recipientId, content } = req.body;

        // Verify the request exists and user is involved
        const request = await ServiceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Verify user is involved in the request
        const isInvolved = 
            request.client.toString() === req.user.id ||
            request.quotes.some(quote => quote.provider.toString() === req.user.id);

        if (!isInvolved) {
            return res.status(403).json({ error: 'Not authorized to send messages for this request' });
        }

        const message = new Message({
            requestId,
            sender: req.user.id,
            recipient: recipientId,
            content
        });

        await message.save();

        // Populate sender details
        await message.populate('sender', 'name profile.avatar');

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Verify the request exists and user is involved
        const request = await ServiceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        const isInvolved = 
            request.client.toString() === req.user.id ||
            request.quotes.some(quote => quote.provider.toString() === req.user.id);

        if (!isInvolved) {
            return res.status(403).json({ error: 'Not authorized to view these messages' });
        }

        const messages = await Message.find({ requestId })
            .sort('createdAt')
            .populate('sender', 'name profile.avatar')
            .populate('recipient', 'name profile.avatar');

        // Mark messages as read
        await Message.updateMany(
            {
                requestId,
                recipient: req.user.id,
                read: false
            },
            { read: true }
        );

        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({
            recipient: req.user.id,
            read: false
        });

        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add lead-specific messaging functionality
exports.getLeadConversation = async (req, res) => {
  try {
    const { leadId } = req.params;
    const userId = req.user._id;

    const lead = await Lead.findById(leadId)
      .populate('postedBy')
      .populate('selectedContractor');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user is authorized to view conversation
    const isAuthorized = 
      lead.postedBy._id.toString() === userId.toString() ||
      lead.contractors.includes(userId) ||
      (lead.selectedContractor && lead.selectedContractor._id.toString() === userId.toString());

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized to view this conversation' });
    }

    const messages = await Message.find({
      leadId: leadId,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name businessName')
    .populate('recipient', 'name businessName');

    res.json(messages);
  } catch (error) {
    console.error('Get lead conversation error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.sendLeadMessage = async (req, res) => {
  try {
    const { leadId, recipientId, content } = req.body;
    const senderId = req.user._id;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Verify sender and recipient are involved in the lead
    const isValidParticipant = (userId) => 
      lead.postedBy.toString() === userId.toString() ||
      lead.contractors.includes(userId) ||
      (lead.selectedContractor && lead.selectedContractor.toString() === userId.toString());

    if (!isValidParticipant(senderId) || !isValidParticipant(recipientId)) {
      return res.status(403).json({ message: 'Unauthorized to send message' });
    }

    const message = new Message({
      leadId,
      sender: senderId,
      recipient: recipientId,
      content,
      read: false
    });

    await message.save();

    // Use existing socket.io instance for real-time delivery
    if (global.io) {
      global.io.to(`user:${recipientId}`).emit('new_message', {
        message: await Message.findById(message._id)
          .populate('sender', 'name businessName')
          .populate('recipient', 'name businessName')
      });
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Send lead message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
}; 