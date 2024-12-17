const Message = require('../models/messageModel');
const ServiceRequest = require('../models/serviceRequestModel');
const { validateRequest } = require('../utils/validator');

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