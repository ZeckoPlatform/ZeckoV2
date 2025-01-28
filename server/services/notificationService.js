const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const Match = require('../models/matchModel');
const socketService = require('./socketService');
const BusinessModel = require('../models/businessModel');
const Lead = require('../models/Lead');

// Create notification
const createNotification = async (userId, type, message, data = {}) => {
    try {
        const notification = new Notification({
            user: userId,
            type,
            message,
            data
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Get user notifications
const getUserNotifications = async (userId) => {
    try {
        return await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);
    } catch (error) {
        console.error('Error getting notifications:', error);
        throw error;
    }
};

// Mark notification as read
const markAsRead = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { read: true },
            { new: true }
        );
        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
    try {
        await Notification.updateMany(
            { user: userId, read: false },
            { read: true }
        );
        return true;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Delete notification
const deleteNotification = async (notificationId) => {
    try {
        await Notification.findByIdAndDelete(notificationId);
        return true;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

// Add new notification types for proposals
const sendProposalNotification = async (userId, leadId, type) => {
    try {
        const notificationData = {
            recipient: userId,
            type: type,
            leadId: leadId,
            read: false
        };

        // Use existing notification creation logic
        const notification = await createNotification(notificationData);
        
        // Use existing socket emission if available
        if (global.io) {
            global.io.to(`user:${userId}`).emit('notification', notification);
        }

        return notification;
    } catch (error) {
        console.error('Proposal notification error:', error);
        throw error;
    }
};

class NotificationService {
    async sendMatchNotification(match) {
        const lead = await Lead.findById(match.lead).populate('user');
        const business = await BusinessModel.findById(match.business);

        // Create notification for business
        const businessNotification = await Notification.create({
            recipient: business._id,
            type: 'MATCH_FOUND',
            title: 'New High-Quality Match Found',
            message: `New lead match: ${lead.title} (${Math.round(match.score * 100)}% match)`,
            data: {
                matchId: match._id,
                leadId: lead._id,
                score: match.score,
                leadTitle: lead.title
            },
            priority: match.score >= 0.8 ? 'high' : 'medium'
        });

        // Create notification for lead owner
        const leadNotification = await Notification.create({
            recipient: lead.user._id,
            type: 'BUSINESS_MATCHED',
            title: 'Business Match Found',
            message: `${business.name} has been matched to your lead (${Math.round(match.score * 100)}% match)`,
            data: {
                matchId: match._id,
                businessId: business._id,
                score: match.score,
                businessName: business.name
            },
            priority: match.score >= 0.8 ? 'high' : 'medium'
        });

        // Send real-time notifications via WebSocket
        socketService.sendNotification(business._id, {
            type: 'match',
            notification: businessNotification
        });

        socketService.sendNotification(lead.user._id, {
            type: 'match',
            notification: leadNotification
        });

        // Send email notifications if score is high
        if (match.score >= 0.8) {
            await this.sendHighMatchEmail(business.email, lead, match);
            await this.sendHighMatchEmail(lead.user.email, business, match, false);
        }

        return {
            businessNotification,
            leadNotification
        };
    }

    async sendMatchUpdateNotification(match, updateType) {
        const lead = await Lead.findById(match.lead).populate('user');
        const business = await BusinessModel.findById(match.business);

        let notificationData;
        switch (updateType) {
            case 'accepted':
                notificationData = {
                    type: 'MATCH_ACCEPTED',
                    title: 'Match Accepted',
                    message: 'The match has been accepted. You can now communicate directly.'
                };
                break;
            case 'declined':
                notificationData = {
                    type: 'MATCH_DECLINED',
                    title: 'Match Declined',
                    message: 'The match has been declined.'
                };
                break;
            case 'connected':
                notificationData = {
                    type: 'MATCH_CONNECTED',
                    title: 'Connection Established',
                    message: 'A connection has been established. You can now start discussing the project.'
                };
                break;
        }

        // Create notifications for both parties
        const notifications = await Promise.all([
            Notification.create({
                recipient: business._id,
                ...notificationData,
                data: {
                    matchId: match._id,
                    leadId: lead._id,
                    updateType
                }
            }),
            Notification.create({
                recipient: lead.user._id,
                ...notificationData,
                data: {
                    matchId: match._id,
                    businessId: business._id,
                    updateType
                }
            })
        ]);

        // Send real-time notifications
        socketService.sendNotification(business._id, {
            type: 'matchUpdate',
            notification: notifications[0]
        });

        socketService.sendNotification(lead.user._id, {
            type: 'matchUpdate',
            notification: notifications[1]
        });

        return notifications;
    }

    async sendHighMatchEmail(email, entity, match, isBusiness = true) {
        const emailService = require('./emailService');
        
        const templateData = {
            score: Math.round(match.score * 100),
            matchDetails: match.details,
            entityName: isBusiness ? entity.title : entity.name,
            matchId: match._id,
            actionUrl: `${process.env.FRONTEND_URL}/matches/${match._id}`
        };

        await emailService.sendEmail({
            to: email,
            template: isBusiness ? 'high-match-business' : 'high-match-lead',
            subject: `High-Quality Match Found (${templateData.score}% Match)`,
            data: templateData
        });
    }

    async getUnreadNotifications(userId) {
        return await Notification.find({
            recipient: userId,
            read: false
        }).sort('-createdAt');
    }

    async markNotificationRead(notificationId, userId) {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: userId
            },
            { read: true },
            { new: true }
        );

        return notification;
    }

    async markAllNotificationsRead(userId) {
        await Notification.updateMany(
            {
                recipient: userId,
                read: false
            },
            { read: true }
        );
    }
}

module.exports = new NotificationService(); 