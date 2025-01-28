const MatchHistory = require('../models/matchHistoryModel');
const Rating = require('../models/ratingModel');
const Business = require('../models/businessModel');
const NotificationService = require('./notificationService');
const mongoose = require('mongoose');

class MatchRatingService {
    async submitRating(matchId, userId, ratingData) {
        const match = await MatchHistory.findById(matchId)
            .populate('business')
            .populate('lead');

        if (!match) {
            throw new Error('Match not found');
        }

        const rating = await Rating.create({
            match: matchId,
            rater: userId,
            ratingType: this.determineRatingType(userId, match),
            overallRating: ratingData.overall,
            categoryRatings: {
                communication: ratingData.communication,
                professionalism: ratingData.professionalism,
                quality: ratingData.quality,
                valueForMoney: ratingData.valueForMoney,
                timeliness: ratingData.timeliness
            },
            review: ratingData.review,
            tags: ratingData.tags || [],
            status: 'published',
            metrics: {
                helpfulCount: 0,
                reportCount: 0
            }
        });

        await this.updateMatchRatingStatus(match, rating);
        await this.updateBusinessRatings(match.business._id);
        await this.notifyRatingSubmission(match, rating);
        
        return rating;
    }

    async updateRating(ratingId, updates) {
        const rating = await Rating.findById(ratingId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            });

        if (!rating) {
            throw new Error('Rating not found');
        }

        Object.assign(rating, updates);
        rating.lastUpdated = new Date();
        
        await rating.save();
        await this.updateBusinessRatings(rating.match.business._id);
        
        return rating;
    }

    async getRatingDetails(ratingId) {
        const rating = await Rating.findById(ratingId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            })
            .populate('rater');

        if (!rating) {
            throw new Error('Rating not found');
        }

        const metrics = await this.calculateRatingMetrics(rating.match._id);
        
        return {
            rating,
            metrics,
            recommendations: this.generateRecommendations(rating, metrics)
        };
    }

    async getBusinessRatings(businessId, filters = {}) {
        const query = {
            'match.business': businessId,
            status: 'published'
        };

        if (filters.minRating) {
            query['overallRating'] = { $gte: filters.minRating };
        }

        if (filters.category) {
            query['tags'] = filters.category;
        }

        const ratings = await Rating.find(query)
            .populate({
                path: 'match',
                populate: ['lead']
            })
            .populate('rater')
            .sort('-createdAt');

        const stats = await this.calculateBusinessRatingStats(businessId);
        
        return {
            ratings,
            stats
        };
    }

    async markRatingHelpful(ratingId, userId) {
        const rating = await Rating.findById(ratingId);
        
        if (!rating) {
            throw new Error('Rating not found');
        }

        if (!rating.helpfulVotes.includes(userId)) {
            rating.helpfulVotes.push(userId);
            rating.metrics.helpfulCount += 1;
            await rating.save();
        }

        return rating;
    }

    async reportRating(ratingId, userId, reason) {
        const rating = await Rating.findById(ratingId);
        
        if (!rating) {
            throw new Error('Rating not found');
        }

        rating.reports.push({
            user: userId,
            reason,
            timestamp: new Date()
        });

        rating.metrics.reportCount += 1;

        if (rating.metrics.reportCount >= 3) {
            rating.status = 'under_review';
            await this.notifyAdminOfReports(rating);
        }

        await rating.save();
        return rating;
    }

    determineRatingType(userId, match) {
        return userId === match.business._id.toString() ? 'business_to_lead' : 'lead_to_business';
    }

    async updateMatchRatingStatus(match, rating) {
        const ratingType = rating.ratingType;
        const ratingField = ratingType === 'business_to_lead' ? 'businessRating' : 'leadRating';
        
        match[ratingField] = rating._id;
        match.timeline.push({
            action: 'rating_submitted',
            timestamp: new Date(),
            details: {
                ratingType,
                rating: rating.overallRating
            }
        });

        await match.save();
    }

    async updateBusinessRatings(businessId) {
        const ratings = await Rating.find({
            'match.business': businessId,
            status: 'published',
            ratingType: 'lead_to_business'
        });

        const stats = this.calculateRatingStats(ratings);
        
        await Business.findByIdAndUpdate(businessId, {
            'metrics.rating': stats.averageRating,
            'metrics.ratingCount': ratings.length,
            'metrics.categoryRatings': stats.categoryAverages
        });
    }

    calculateRatingStats(ratings) {
        if (ratings.length === 0) {
            return {
                averageRating: 0,
                categoryAverages: {
                    communication: 0,
                    professionalism: 0,
                    quality: 0,
                    valueForMoney: 0,
                    timeliness: 0
                }
            };
        }

        const sum = ratings.reduce((acc, rating) => acc + rating.overallRating, 0);
        const categorySums = ratings.reduce((acc, rating) => {
            Object.entries(rating.categoryRatings).forEach(([category, value]) => {
                acc[category] = (acc[category] || 0) + value;
            });
            return acc;
        }, {});

        return {
            averageRating: sum / ratings.length,
            categoryAverages: Object.entries(categorySums).reduce((acc, [category, sum]) => {
                acc[category] = sum / ratings.length;
                return acc;
            }, {})
        };
    }

    async calculateRatingMetrics(matchId) {
        const ratings = await Rating.find({ match: matchId });
        
        return {
            totalRatings: ratings.length,
            averageRating: this.calculateAverageRating(ratings),
            categoryBreakdown: this.calculateCategoryBreakdown(ratings),
            sentimentAnalysis: await this.analyzeSentiment(ratings)
        };
    }

    calculateAverageRating(ratings) {
        if (ratings.length === 0) return 0;
        return ratings.reduce((acc, rating) => acc + rating.overallRating, 0) / ratings.length;
    }

    calculateCategoryBreakdown(ratings) {
        const categories = {};
        ratings.forEach(rating => {
            rating.tags.forEach(tag => {
                categories[tag] = (categories[tag] || 0) + 1;
            });
        });
        return categories;
    }

    async analyzeSentiment(ratings) {
        // Implement sentiment analysis logic here
        // This could be integrated with a third-party service or use a local NLP library
        return {
            positive: 0,
            neutral: 0,
            negative: 0
        };
    }

    async notifyRatingSubmission(match, rating) {
        const recipientId = rating.ratingType === 'business_to_lead' ?
            match.lead.user :
            match.business._id;

        await NotificationService.sendNotification(recipientId, {
            type: 'NEW_RATING',
            title: 'New Rating Received',
            message: `You have received a new rating for match #${match._id}`,
            data: {
                matchId: match._id,
                ratingId: rating._id,
                rating: rating.overallRating
            }
        });
    }

    async notifyAdminOfReports(rating) {
        await NotificationService.notifyAdmins({
            type: 'RATING_REPORTED',
            title: 'Rating Requires Review',
            message: `Rating #${rating._id} has received multiple reports`,
            data: {
                ratingId: rating._id,
                reportCount: rating.metrics.reportCount
            }
        });
    }

    generateRecommendations(rating, metrics) {
        const recommendations = [];

        if (rating.overallRating < metrics.averageRating - 1) {
            recommendations.push({
                type: 'warning',
                message: 'Rating is significantly below average. Consider reviewing feedback carefully.'
            });
        }

        if (rating.review.length < 50) {
            recommendations.push({
                type: 'info',
                message: 'Consider providing more detailed feedback for better insights.'
            });
        }

        return recommendations;
    }
}

module.exports = new MatchRatingService(); 