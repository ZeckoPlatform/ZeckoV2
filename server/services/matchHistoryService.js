const MatchHistory = require('../models/matchHistoryModel');
const Match = require('../models/matchModel');
const NotificationService = require('./notificationService');

class MatchHistoryService {
    async createHistoryEntry(match, initialStatus = 'pending') {
        const historyEntry = await MatchHistory.create({
            match: match._id,
            lead: match.lead,
            business: match.business,
            score: match.score,
            details: match.details,
            status: initialStatus,
            timeline: [{
                action: 'match_created',
                details: {
                    score: match.score,
                    matchDetails: match.details
                }
            }]
        });

        return historyEntry;
    }

    async updateMatchStatus(matchId, newStatus, userId, additionalDetails = {}) {
        const history = await MatchHistory.findOne({ match: matchId });
        if (!history) {
            throw new Error('Match history not found');
        }

        history.status = newStatus;
        history.timeline.push({
            action: `status_${newStatus}`,
            performedBy: userId,
            details: additionalDetails
        });

        if (newStatus === 'connected') {
            history.metrics.lastInteraction = new Date();
        }

        await history.save();

        // Send notifications for status updates
        await NotificationService.sendMatchUpdateNotification(
            await Match.findById(matchId),
            newStatus
        );

        return history;
    }

    async addTimelineEvent(matchId, action, userId, details = {}) {
        const history = await MatchHistory.findOne({ match: matchId });
        if (!history) {
            throw new Error('Match history not found');
        }

        history.timeline.push({
            action,
            performedBy: userId,
            details
        });

        if (action.includes('communication')) {
            history.metrics.communicationCount = (history.metrics.communicationCount || 0) + 1;
            history.metrics.lastInteraction = new Date();
        }

        await history.save();
        return history;
    }

    async addFeedback(matchId, feedbackType, rating, feedback, userId) {
        const history = await MatchHistory.findOne({ match: matchId });
        if (!history) {
            throw new Error('Match history not found');
        }

        if (feedbackType === 'business') {
            history.feedback.businessRating = rating;
            history.feedback.businessFeedback = feedback;
        } else {
            history.feedback.leadRating = rating;
            history.feedback.leadFeedback = feedback;
        }

        history.timeline.push({
            action: 'feedback_added',
            performedBy: userId,
            details: { feedbackType, rating }
        });

        await history.save();
        return history;
    }

    async getMatchHistory(matchId) {
        return await MatchHistory.findOne({ match: matchId })
            .populate('lead', 'title description')
            .populate('business', 'name')
            .populate('timeline.performedBy', 'name');
    }

    async getBusinessMatchHistory(businessId, filters = {}) {
        const query = {
            business: businessId,
            ...filters
        };

        return await MatchHistory.find(query)
            .populate('lead', 'title description')
            .sort('-createdAt');
    }

    async getLeadMatchHistory(leadId, filters = {}) {
        const query = {
            lead: leadId,
            ...filters
        };

        return await MatchHistory.find(query)
            .populate('business', 'name')
            .sort('-createdAt');
    }

    async getMatchMetrics(matchId) {
        const history = await MatchHistory.findOne({ match: matchId });
        if (!history) {
            throw new Error('Match history not found');
        }

        const timelineEvents = history.timeline.length;
        const daysSinceCreation = Math.floor(
            (Date.now() - history.createdAt) / (1000 * 60 * 60 * 24)
        );

        return {
            responseTime: history.metrics.responseTime,
            communicationCount: history.metrics.communicationCount || 0,
            lastInteraction: history.metrics.lastInteraction,
            timelineEvents,
            daysSinceCreation,
            status: history.status,
            score: history.score
        };
    }

    async calculateAverageMetrics(businessId) {
        const histories = await MatchHistory.find({ business: businessId });
        
        const metrics = histories.reduce((acc, history) => {
            acc.totalScore += history.score;
            acc.totalResponseTime += history.metrics.responseTime || 0;
            acc.totalCommunication += history.metrics.communicationCount || 0;
            acc.total += 1;
            
            if (history.status === 'completed') {
                acc.completed += 1;
            }
            
            return acc;
        }, {
            totalScore: 0,
            totalResponseTime: 0,
            totalCommunication: 0,
            total: 0,
            completed: 0
        });

        return {
            averageScore: metrics.totalScore / metrics.total,
            averageResponseTime: metrics.totalResponseTime / metrics.total,
            averageCommunication: metrics.totalCommunication / metrics.total,
            completionRate: metrics.completed / metrics.total,
            totalMatches: metrics.total
        };
    }
}

module.exports = new MatchHistoryService(); 