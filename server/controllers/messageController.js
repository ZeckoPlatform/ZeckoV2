const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');

class MessageController {
    // Send a new message
    async sendMessage(req, res) {
        const { conversationId, content } = req.body;
        const senderId = req.user.id;

        try {
            // Check if conversation exists
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                throw new ApiError('Conversation not found', 404);
            }

            // Verify sender is part of conversation
            if (!conversation.participants.includes(senderId)) {
                throw new ApiError('Not authorized to send messages in this conversation', 403);
            }

            const message = await Message.create({
                conversation: conversationId,
                sender: senderId,
                content,
                timestamp: new Date()
            });

            // Populate sender information
            await message.populate('sender', 'name email');

            // Update conversation's last message
            conversation.lastMessage = message._id;
            conversation.lastMessageAt = message.timestamp;
            await conversation.save();

            res.status(201).json({
                status: 'success',
                data: message
            });
        } catch (error) {
            throw new ApiError(error.message, error.statusCode || 500);
        }
    }

    // Get messages for a conversation
    async getMessages(req, res) {
        const { conversationId } = req.params;
        const userId = req.user.id;

        try {
            // Check if conversation exists and user is participant
            const conversation = await Conversation.findOne({
                _id: conversationId,
                participants: userId
            });

            if (!conversation) {
                throw new ApiError('Conversation not found or access denied', 404);
            }

            const messages = await Message.find({ conversation: conversationId })
                .populate('sender', 'name email')
                .sort('timestamp');

            res.status(200).json({
                status: 'success',
                results: messages.length,
                data: messages
            });
        } catch (error) {
            throw new ApiError(error.message, error.statusCode || 500);
        }
    }

    // Delete a message
    async deleteMessage(req, res) {
        const { messageId } = req.params;
        const userId = req.user.id;

        try {
            const message = await Message.findOne({
                _id: messageId,
                sender: userId
            });

            if (!message) {
                throw new ApiError('Message not found or unauthorized', 404);
            }

            await message.remove();

            res.status(204).json({
                status: 'success',
                data: null
            });
        } catch (error) {
            throw new ApiError(error.message, error.statusCode || 500);
        }
    }

    // Update a message
    async updateMessage(req, res) {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        try {
            const message = await Message.findOneAndUpdate(
                { _id: messageId, sender: userId },
                { 
                    content,
                    edited: true,
                    editedAt: new Date()
                },
                { new: true, runValidators: true }
            ).populate('sender', 'name email');

            if (!message) {
                throw new ApiError('Message not found or unauthorized', 404);
            }

            res.status(200).json({
                status: 'success',
                data: message
            });
        } catch (error) {
            throw new ApiError(error.message, error.statusCode || 500);
        }
    }
}

module.exports = new MessageController(); 