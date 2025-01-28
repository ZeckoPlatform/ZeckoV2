const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const mongoose = require('mongoose');
const ml = require('ml-regression-multivariate-linear');

class MatchRecommendationService {
    constructor() {
        this.weightFactors = {
            categoryMatch: 0.25,
            locationScore: 0.15,
            budgetFit: 0.15,
            experienceLevel: 0.20,
            availabilityScore: 0.15,
            successRate: 0.10
        };
    }

    async generateRecommendations(leadId, limit = 10) {
        const lead = await Lead.findById(leadId);
        if (!lead) throw new Error('Lead not found');

        const recommendations = await this.findPotentialMatches(lead);
        const scoredMatches = await this.scoreMatches(lead, recommendations);
        const rankedMatches = this.rankMatches(scoredMatches);
        const enhancedRecommendations = await this.enhanceRecommendations(rankedMatches.slice(0, limit));

        await this.logRecommendations(leadId, enhancedRecommendations);
        return enhancedRecommendations;
    }

    async findPotentialMatches(lead) {
        // Initial filtering of potential businesses
        const baseQuery = {
            isActive: true,
            categories: { $in: lead.categories },
            'subscription.status': 'active',
            'metrics.availability': { $gt: 0 }
        };

        if (lead.location?.coordinates) {
            baseQuery.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: lead.location.coordinates
                    },
                    $maxDistance: 50000 // 50km radius
                }
            };
        }

        return await Business.find(baseQuery)
            .select('name categories metrics location subscription expertise')
            .limit(50);
    }

    async scoreMatches(lead, businesses) {
        const scoredMatches = await Promise.all(businesses.map(async business => {
            const scores = {
                categoryMatch: this.calculateCategoryMatch(lead, business),
                locationScore: this.calculateLocationScore(lead, business),
                budgetFit: this.calculateBudgetFit(lead, business),
                experienceLevel: await this.calculateExperienceScore(business),
                availabilityScore: this.calculateAvailabilityScore(business),
                successRate: await this.calculateSuccessRate(business)
            };

            const weightedScore = Object.entries(scores).reduce((total, [factor, score]) => {
                return total + (score * this.weightFactors[factor]);
            }, 0);

            return {
                business,
                scores,
                weightedScore
            };
        }));

        return scoredMatches;
    }

    calculateCategoryMatch(lead, business) {
        const matchingCategories = lead.categories.filter(cat => 
            business.categories.includes(cat)
        ).length;
        return matchingCategories / lead.categories.length;
    }

    calculateLocationScore(lead, business) {
        if (!lead.location?.coordinates || !business.location?.coordinates) {
            return 0.5; // Default score if location data is missing
        }

        const distance = this.calculateDistance(
            lead.location.coordinates,
            business.location.coordinates
        );
        
        // Convert distance to score (closer = higher score)
        return Math.max(0, 1 - (distance / 50000)); // 50km as max distance
    }

    calculateBudgetFit(lead, business) {
        if (!lead.budget || !business.metrics?.averageProjectCost) {
            return 0.5; // Default score if budget data is missing
        }

        const difference = Math.abs(lead.budget - business.metrics.averageProjectCost);
        const percentDifference = difference / lead.budget;
        
        return Math.max(0, 1 - percentDifference);
    }

    async calculateExperienceScore(business) {
        const completedProjects = await MatchHistory.countDocuments({
            business: business._id,
            status: 'completed'
        });

        // Normalize experience score
        return Math.min(1, completedProjects / 50); // Cap at 50 projects
    }

    calculateAvailabilityScore(business) {
        return business.metrics?.availability || 0.5;
    }

    async calculateSuccessRate(business) {
        const [completed, total] = await Promise.all([
            MatchHistory.countDocuments({
                business: business._id,
                status: 'completed'
            }),
            MatchHistory.countDocuments({
                business: business._id,
                status: { $in: ['completed', 'declined', 'expired'] }
            })
        ]);

        return total > 0 ? completed / total : 0.5;
    }

    rankMatches(scoredMatches) {
        return scoredMatches.sort((a, b) => b.weightedScore - a.weightedScore);
    }

    async enhanceRecommendations(recommendations) {
        return await Promise.all(recommendations.map(async rec => {
            const recentFeedback = await this.getRecentFeedback(rec.business._id);
            const businessMetrics = await this.getBusinessMetrics(rec.business._id);

            return {
                ...rec,
                feedback: recentFeedback,
                metrics: businessMetrics,
                matchConfidence: this.calculateMatchConfidence(rec.scores)
            };
        }));
    }

    async getRecentFeedback(businessId) {
        return await MatchHistory.find({
            business: businessId,
            'feedback.businessFeedback': { $exists: true }
        })
        .sort('-createdAt')
        .limit(3)
        .select('feedback.businessFeedback');
    }

    async getBusinessMetrics(businessId) {
        const business = await Business.findById(businessId)
            .select('metrics');
        return business.metrics || {};
    }

    calculateMatchConfidence(scores) {
        const varianceThreshold = 0.2;
        const scoreValues = Object.values(scores);
        const average = scoreValues.reduce((a, b) => a + b) / scoreValues.length;
        const variance = scoreValues.reduce((acc, score) => 
            acc + Math.pow(score - average, 2), 0
        ) / scoreValues.length;

        return variance < varianceThreshold ? 'high' : 'medium';
    }

    async logRecommendations(leadId, recommendations) {
        // Log recommendations for analysis and improvement
        await mongoose.model('RecommendationLog').create({
            lead: leadId,
            recommendations: recommendations.map(rec => ({
                business: rec.business._id,
                score: rec.weightedScore,
                confidence: rec.matchConfidence
            })),
            timestamp: new Date()
        });
    }

    calculateDistance(coords1, coords2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(coords2[0] - coords1[0]);
        const dLon = this.toRad(coords2[1] - coords1[1]);
        const lat1 = this.toRad(coords1[0]);
        const lat2 = this.toRad(coords2[0]);

        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * 
                Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRad(value) {
        return value * Math.PI / 180;
    }
}

module.exports = new MatchRecommendationService(); 