const MatchHistory = require('../models/matchHistoryModel');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const socketService = require('./socketService');
const NotificationService = require('./notificationService');
const mongoose = require('mongoose');

class MatchCommunicationService {
    async sendMessage(matchId, senderId, content, attachments = []) {
        const match = await MatchHistory.findById(matchId)
            .populate('business')
            .populate('lead');
            
        if (!match) {
            throw new Error('Match not found');
        }

        const message = await Message.create({
            match: matchId,
            sender: senderId,
            content,
            attachments,
            readBy: [senderId]
        });

        await this.updateMatchCommunicationMetrics(match, message);
        await this.notifyRecipient(match, message);
        
        return message;
    }

    async getMatchMessages(matchId, userId, page = 1, limit = 50) {
        const skip = (page - 1) * limit;
        
        const messages = await Message.find({ match: matchId })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name avatar role')
            .lean();

        await this.markMessagesAsRead(matchId, userId, messages);
        
        return {
            messages: messages.reverse(),
            hasMore: messages.length === limit
        };
    }

    async markMessagesAsRead(matchId, userId, messages) {
        const unreadMessageIds = messages
            .filter(msg => !msg.readBy.includes(userId))
            .map(msg => msg._id);

        if (unreadMessageIds.length > 0) {
            await Message.updateMany(
                { _id: { $in: unreadMessageIds } },
                { $addToSet: { readBy: userId } }
            );

            await this.updateUnreadCount(matchId, userId);
        }
    }

    async updateMatchCommunicationMetrics(match, message) {
        const metrics = match.metrics || {};
        metrics.lastInteraction = new Date();
        metrics.communicationCount = (metrics.communicationCount || 0) + 1;

        if (!metrics.firstResponseTime && match.status === 'pending') {
            metrics.firstResponseTime = new Date() - match.createdAt;
            match.status = 'active';
        }

        match.metrics = metrics;
        await match.save();
    }

    async notifyRecipient(match, message) {
        const recipientId = message.sender.toString() === match.business.toString() 
            ? match.lead.user 
            : match.business;

        await NotificationService.sendNotification(recipientId, {
            type: 'NEW_MESSAGE',
            title: 'New Message Received',
            message: this.truncateMessage(message.content),
            data: {
                matchId: match._id,
                messageId: message._id
            }
        });

        socketService.emitToUser(recipientId, 'new_message', {
            matchId: match._id,
            message: {
                ...message.toObject(),
                sender: await User.findById(message.sender).select('name avatar role')
            }
        });
    }

    async getUnreadCount(userId) {
        const matches = await MatchHistory.find({
            $or: [
                { 'business': userId },
                { 'lead.user': userId }
            ]
        }).select('_id');

        const matchIds = matches.map(match => match._id);

        const unreadCount = await Message.countDocuments({
            match: { $in: matchIds },
            sender: { $ne: userId },
            readBy: { $ne: userId }
        });

        return unreadCount;
    }

    async updateUnreadCount(matchId, userId) {
        const unreadCount = await Message.countDocuments({
            match: matchId,
            sender: { $ne: userId },
            readBy: { $ne: userId }
        });

        socketService.emitToUser(userId, 'unread_count_update', {
            matchId,
            unreadCount
        });
    }

    truncateMessage(content, length = 100) {
        if (content.length <= length) return content;
        return content.substring(0, length) + '...';
    }

    async getMessageStats(matchId) {
        const messages = await Message.find({ match: matchId });
        
        return {
            totalMessages: messages.length,
            responseTime: this.calculateAverageResponseTime(messages),
            messageFrequency: this.calculateMessageFrequency(messages),
            participationRate: this.calculateParticipationRate(messages)
        };
    }

    calculateAverageResponseTime(messages) {
        let totalResponseTime = 0;
        let responseCount = 0;

        for (let i = 1; i < messages.length; i++) {
            if (messages[i].sender !== messages[i-1].sender) {
                totalResponseTime += messages[i].createdAt - messages[i-1].createdAt;
                responseCount++;
            }
        }

        return responseCount > 0 ? totalResponseTime / responseCount : 0;
    }

    calculateMessageFrequency(messages) {
        if (messages.length < 2) return 0;
        
        const timeSpan = messages[messages.length-1].createdAt - messages[0].createdAt;
        const days = timeSpan / (1000 * 60 * 60 * 24);
        
        return messages.length / days;
    }

    calculateParticipationRate(messages) {
        const senders = new Set(messages.map(m => m.sender.toString()));
        return senders.size;
    }
}

module.exports = new MatchCommunicationService(); 