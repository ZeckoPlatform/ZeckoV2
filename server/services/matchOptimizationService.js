const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const mongoose = require('mongoose');
const ml = require('ml-regression-multivariate-linear');

class MatchOptimizationService {
    constructor() {
        this.optimizationFactors = {
            categoryWeight: 0.25,
            locationWeight: 0.15,
            budgetWeight: 0.15,
            experienceWeight: 0.20,
            availabilityWeight: 0.15,
            successRateWeight: 0.10
        };
    }

    async optimizeMatchingAlgorithm() {
        const historicalData = await this.getHistoricalMatchData();
        const optimizedWeights = await this.calculateOptimalWeights(historicalData);
        await this.updateMatchingWeights(optimizedWeights);
        await this.generateOptimizationReport(optimizedWeights, historicalData);
        return optimizedWeights;
    }

    async getHistoricalMatchData() {
        const matches = await MatchHistory.find({
            status: { $in: ['completed', 'declined'] },
            'feedback.businessFeedback': { $exists: true }
        })
        .populate('lead')
        .populate('business')
        .sort('-createdAt')
        .limit(1000);

        return matches.map(match => this.preprocessMatchData(match));
    }

    preprocessMatchData(match) {
        return {
            features: {
                categoryMatch: this.calculateCategoryMatchScore(match),
                locationScore: this.calculateLocationScore(match),
                budgetFit: this.calculateBudgetFitScore(match),
                experienceLevel: this.calculateExperienceScore(match),
                availabilityScore: match.business.metrics?.availability || 0.5,
                successRate: match.business.metrics?.successRate || 0.5
            },
            outcome: this.calculateMatchOutcomeScore(match)
        };
    }

    calculateCategoryMatchScore(match) {
        const leadCategories = new Set(match.lead.categories);
        const businessCategories = new Set(match.business.categories);
        const intersection = new Set(
            [...leadCategories].filter(x => businessCategories.has(x))
        );
        return intersection.size / leadCategories.size;
    }

    calculateLocationScore(match) {
        if (!match.lead.location?.coordinates || !match.business.location?.coordinates) {
            return 0.5;
        }
        const distance = this.calculateDistance(
            match.lead.location.coordinates,
            match.business.location.coordinates
        );
        return Math.max(0, 1 - (distance / 50000));
    }

    calculateBudgetFitScore(match) {
        if (!match.lead.budget || !match.business.metrics?.averageProjectCost) {
            return 0.5;
        }
        const difference = Math.abs(
            match.lead.budget - match.business.metrics.averageProjectCost
        );
        return Math.max(0, 1 - (difference / match.lead.budget));
    }

    calculateExperienceScore(match) {
        const completedProjects = match.business.metrics?.completedProjects || 0;
        return Math.min(1, completedProjects / 50);
    }

    calculateMatchOutcomeScore(match) {
        const baseScore = match.status === 'completed' ? 1 : 0;
        const feedbackScore = match.feedback?.businessFeedback?.rating 
            ? match.feedback.businessFeedback.rating / 5
            : 0.5;
        return (baseScore + feedbackScore) / 2;
    }

    async calculateOptimalWeights(historicalData) {
        const features = historicalData.map(data => Object.values(data.features));
        const outcomes = historicalData.map(data => [data.outcome]);

        const regression = new ml(features, outcomes);
        const weights = regression.weights.map(w => Math.max(0, Math.min(1, w[0])));
        
        // Normalize weights to sum to 1
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const normalizedWeights = weights.map(w => w / totalWeight);

        return {
            categoryWeight: normalizedWeights[0],
            locationWeight: normalizedWeights[1],
            budgetWeight: normalizedWeights[2],
            experienceWeight: normalizedWeights[3],
            availabilityWeight: normalizedWeights[4],
            successRateWeight: normalizedWeights[5]
        };
    }

    async updateMatchingWeights(weights) {
        const optimization = new mongoose.model('MatchOptimization')({
            weights,
            timestamp: new Date(),
            metadata: {
                dataPoints: historicalData.length,
                confidence: this.calculateConfidenceScore(weights)
            }
        });
        await optimization.save();
    }

    async generateOptimizationReport(weights, historicalData) {
        const report = {
            timestamp: new Date(),
            weightChanges: this.compareWeights(this.optimizationFactors, weights),
            performance: await this.evaluatePerformance(weights, historicalData),
            recommendations: this.generateRecommendations(weights)
        };

        await mongoose.model('OptimizationReport').create(report);
        return report;
    }

    compareWeights(oldWeights, newWeights) {
        return Object.keys(oldWeights).map(factor => ({
            factor,
            oldWeight: oldWeights[factor],
            newWeight: newWeights[factor],
            change: ((newWeights[factor] - oldWeights[factor]) / oldWeights[factor]) * 100
        }));
    }

    async evaluatePerformance(weights, historicalData) {
        const predictions = historicalData.map(data => {
            const score = Object.entries(data.features).reduce(
                (acc, [factor, value], index) => acc + value * weights[factor],
                0
            );
            return score;
        });

        const actualOutcomes = historicalData.map(data => data.outcome);
        const mse = this.calculateMSE(predictions, actualOutcomes);
        const accuracy = this.calculateAccuracy(predictions, actualOutcomes);

        return {
            mse,
            accuracy,
            improvement: await this.calculateImprovement(accuracy)
        };
    }

    generateRecommendations(weights) {
        const recommendations = [];
        const threshold = 0.1;

        Object.entries(weights).forEach(([factor, weight]) => {
            if (weight < threshold) {
                recommendations.push({
                    factor,
                    type: 'warning',
                    message: `Consider increasing importance of ${factor}`
                });
            } else if (weight > 0.4) {
                recommendations.push({
                    factor,
                    type: 'info',
                    message: `High reliance on ${factor}, consider diversifying`
                });
            }
        });

        return recommendations;
    }

    calculateMSE(predictions, actuals) {
        return predictions.reduce(
            (acc, pred, i) => acc + Math.pow(pred - actuals[i], 2),
            0
        ) / predictions.length;
    }

    calculateAccuracy(predictions, actuals) {
        const threshold = 0.2;
        const correct = predictions.filter(
            (pred, i) => Math.abs(pred - actuals[i]) <= threshold
        ).length;
        return correct / predictions.length;
    }

    async calculateImprovement(currentAccuracy) {
        const previousOptimization = await mongoose.model('OptimizationReport')
            .findOne()
            .sort('-timestamp');

        if (!previousOptimization) return 0;

        return ((currentAccuracy - previousOptimization.performance.accuracy) /
            previousOptimization.performance.accuracy) * 100;
    }
}

module.exports = new MatchOptimizationService(); 