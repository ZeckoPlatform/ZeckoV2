const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const NotificationService = require('./notificationService');

class MatchFeedbackService {
    async submitFeedback(matchId, userId, feedbackType, data) {
        const match = await MatchHistory.findById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        const feedback = {
            rating: data.rating,
            feedback: data.feedback,
            categories: data.categories || [],
            metrics: {
                communication: data.metrics?.communication,
                professionalism: data.metrics?.professionalism,
                expertise: data.metrics?.expertise,
                overall: data.metrics?.overall
            },
            timestamp: new Date(),
            submittedBy: userId
        };

        if (feedbackType === 'business') {
            match.feedback.businessFeedback = feedback;
            await this.updateBusinessMetrics(match.business, feedback);
        } else {
            match.feedback.leadFeedback = feedback;
            await this.updateLeadMetrics(match.lead, feedback);
        }

        match.timeline.push({
            action: 'feedback_submitted',
            performedBy: userId,
            details: {
                type: feedbackType,
                rating: feedback.rating
            }
        });

        await match.save();
        await this.notifyFeedbackSubmission(match, feedbackType);
        await this.analyzeFeedbackPatterns(match.business);

        return match;
    }

    async updateBusinessMetrics(businessId, feedback) {
        const business = await Business.findById(businessId);
        if (!business) return;

        business.metrics = business.metrics || {};
        business.metrics.totalFeedbacks = (business.metrics.totalFeedbacks || 0) + 1;
        business.metrics.averageRating = this.calculateNewAverage(
            business.metrics.averageRating || 0,
            business.metrics.totalFeedbacks,
            feedback.rating
        );

        // Update specific metrics
        Object.keys(feedback.metrics).forEach(metric => {
            if (feedback.metrics[metric]) {
                business.metrics[metric] = this.calculateNewAverage(
                    business.metrics[metric] || 0,
                    business.metrics.totalFeedbacks,
                    feedback.metrics[metric]
                );
            }
        });

        await business.save();
    }

    async updateLeadMetrics(leadId, feedback) {
        const lead = await Lead.findById(leadId);
        if (!lead) return;

        lead.metrics = lead.metrics || {};
        lead.metrics.totalFeedbacks = (lead.metrics.totalFeedbacks || 0) + 1;
        lead.metrics.averageRating = this.calculateNewAverage(
            lead.metrics.averageRating || 0,
            lead.metrics.totalFeedbacks,
            feedback.rating
        );

        await lead.save();
    }

    calculateNewAverage(currentAvg, totalCount, newValue) {
        return ((currentAvg * (totalCount - 1)) + newValue) / totalCount;
    }

    async notifyFeedbackSubmission(match, feedbackType) {
        const recipientId = feedbackType === 'business' ? match.lead.user : match.business;
        await NotificationService.sendNotification(recipientId, {
            type: 'FEEDBACK_RECEIVED',
            title: 'New Feedback Received',
            message: 'You have received new feedback for a match',
            data: {
                matchId: match._id,
                rating: match.feedback[`${feedbackType}Feedback`].rating
            }
        });
    }

    async analyzeFeedbackPatterns(businessId) {
        const recentMatches = await MatchHistory.find({
            business: businessId,
            'feedback.businessFeedback': { $exists: true }
        })
        .sort('-createdAt')
        .limit(50);

        const patterns = this.extractFeedbackPatterns(recentMatches);
        await this.updateBusinessInsights(businessId, patterns);
    }

    extractFeedbackPatterns(matches) {
        const patterns = {
            strengths: new Map(),
            weaknesses: new Map(),
            trends: {
                ratings: [],
                categories: new Map()
            }
        };

        matches.forEach(match => {
            const feedback = match.feedback.businessFeedback;
            
            // Analyze categories
            feedback.categories.forEach(category => {
                if (feedback.rating >= 4) {
                    patterns.strengths.set(
                        category,
                        (patterns.strengths.get(category) || 0) + 1
                    );
                } else if (feedback.rating <= 2) {
                    patterns.weaknesses.set(
                        category,
                        (patterns.weaknesses.get(category) || 0) + 1
                    );
                }
            });

            // Track rating trends
            patterns.trends.ratings.push({
                date: match.createdAt,
                rating: feedback.rating
            });
        });

        return patterns;
    }

    async updateBusinessInsights(businessId, patterns) {
        const business = await Business.findById(businessId);
        if (!business) return;

        business.insights = business.insights || {};
        business.insights.feedbackPatterns = {
            strengths: Array.from(patterns.strengths.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            weaknesses: Array.from(patterns.weaknesses.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5),
            ratingTrend: patterns.trends.ratings
        };

        await business.save();
    }

    async getFeedbackSummary(businessId) {
        const matches = await MatchHistory.find({
            business: businessId,
            'feedback.businessFeedback': { $exists: true }
        });

        return {
            totalFeedbacks: matches.length,
            averageRating: this.calculateAverageRating(matches),
            ratingDistribution: this.calculateRatingDistribution(matches),
            categoryPerformance: this.analyzeCategoryPerformance(matches),
            recentFeedback: await this.getRecentFeedback(matches.slice(0, 5))
        };
    }

    calculateAverageRating(matches) {
        return matches.reduce((acc, match) => 
            acc + match.feedback.businessFeedback.rating, 0
        ) / matches.length;
    }

    calculateRatingDistribution(matches) {
        const distribution = new Array(5).fill(0);
        matches.forEach(match => {
            const rating = Math.floor(match.feedback.businessFeedback.rating);
            distribution[rating - 1]++;
        });
        return distribution;
    }

    analyzeCategoryPerformance(matches) {
        const categoryStats = new Map();

        matches.forEach(match => {
            const feedback = match.feedback.businessFeedback;
            feedback.categories.forEach(category => {
                if (!categoryStats.has(category)) {
                    categoryStats.set(category, {
                        total: 0,
                        sum: 0,
                        count: 0
                    });
                }

                const stats = categoryStats.get(category);
                stats.total++;
                stats.sum += feedback.rating;
                stats.count++;
            });
        });

        return Array.from(categoryStats.entries()).map(([category, stats]) => ({
            category,
            averageRating: stats.sum / stats.count,
            frequency: stats.total
        }));
    }

    async getRecentFeedback(matches) {
        return Promise.all(matches.map(async match => ({
            matchId: match._id,
            rating: match.feedback.businessFeedback.rating,
            feedback: match.feedback.businessFeedback.feedback,
            date: match.feedback.businessFeedback.timestamp,
            lead: await this.getLeadSummary(match.lead)
        })));
    }

    async getLeadSummary(leadId) {
        const lead = await Lead.findById(leadId).select('title description');
        return {
            title: lead.title,
            description: lead.description
        };
    }
}

module.exports = new MatchFeedbackService(); 