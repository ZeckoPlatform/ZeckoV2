const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const mongoose = require('mongoose');

class MatchAnalyticsService {
    async generateBusinessAnalytics(businessId, timeRange = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - timeRange);

        const matches = await MatchHistory.find({
            business: businessId,
            createdAt: { $gte: startDate }
        }).populate('lead');

        return {
            matchQuality: await this.analyzeMatchQuality(matches),
            performanceMetrics: await this.calculatePerformanceMetrics(matches),
            leadInsights: await this.analyzeleadPatterns(matches),
            competitiveAnalysis: await this.generateCompetitiveAnalysis(businessId, matches),
            recommendations: await this.generateRecommendations(matches)
        };
    }

    async analyzeMatchQuality(matches) {
        const qualityScores = matches.map(match => ({
            score: match.score,
            factors: match.details,
            outcome: match.status
        }));

        const averageScore = qualityScores.reduce((acc, curr) => acc + curr.score, 0) / qualityScores.length;
        const successfulMatches = qualityScores.filter(match => ['accepted', 'completed'].includes(match.outcome));
        const successRate = (successfulMatches.length / qualityScores.length) * 100;

        const factorAnalysis = {
            expertise: this.analyzeMatchFactor(qualityScores, 'expertise'),
            availability: this.analyzeMatchFactor(qualityScores, 'availability'),
            location: this.analyzeMatchFactor(qualityScores, 'location'),
            responseTime: this.analyzeMatchFactor(qualityScores, 'responseTime')
        };

        return {
            averageScore,
            successRate,
            factorAnalysis,
            qualityTrend: this.calculateQualityTrend(qualityScores)
        };
    }

    analyzeMatchFactor(scores, factor) {
        const factorScores = scores.map(score => score.factors[factor]);
        const average = factorScores.reduce((acc, curr) => acc + curr, 0) / factorScores.length;
        const impact = this.calculateFactorImpact(scores, factor);

        return {
            average,
            impact,
            trend: this.calculateFactorTrend(scores, factor)
        };
    }

    calculateFactorImpact(scores, factor) {
        const successfulScores = scores.filter(score => 
            ['accepted', 'completed'].includes(score.outcome)
        );

        const avgSuccessfulFactor = successfulScores.reduce(
            (acc, curr) => acc + curr.factors[factor], 0
        ) / successfulScores.length;

        const avgOverallFactor = scores.reduce(
            (acc, curr) => acc + curr.factors[factor], 0
        ) / scores.length;

        return (avgSuccessfulFactor - avgOverallFactor) / avgOverallFactor * 100;
    }

    async calculatePerformanceMetrics(matches) {
        const responseRates = matches.map(match => ({
            initialResponseTime: this.calculateInitialResponseTime(match),
            engagementRate: this.calculateEngagementRate(match),
            conversionTime: this.calculateConversionTime(match)
        }));

        return {
            averageResponseTime: this.calculateAverage(responseRates, 'initialResponseTime'),
            averageEngagementRate: this.calculateAverage(responseRates, 'engagementRate'),
            averageConversionTime: this.calculateAverage(responseRates, 'conversionTime'),
            trends: {
                responseTimeTrend: this.calculateMetricTrend(responseRates, 'initialResponseTime'),
                engagementTrend: this.calculateMetricTrend(responseRates, 'engagementRate'),
                conversionTrend: this.calculateMetricTrend(responseRates, 'conversionTime')
            }
        };
    }

    async analyzeleadPatterns(matches) {
        const leadCategories = matches.map(match => match.lead.categories).flat();
        const categoryFrequency = this.calculateFrequencyDistribution(leadCategories);

        const leadBudgets = matches.map(match => match.lead.budget);
        const budgetAnalysis = this.analyzeBudgetDistribution(leadBudgets);

        const locationPatterns = await this.analyzeLocationPatterns(matches);

        return {
            categoryInsights: {
                mostCommonCategories: categoryFrequency.slice(0, 5),
                categorySuccess: await this.analyzeCategorySuccess(matches)
            },
            budgetInsights: budgetAnalysis,
            locationInsights: locationPatterns,
            timePatterns: this.analyzeTimePatterns(matches)
        };
    }

    async generateCompetitiveAnalysis(businessId, matches) {
        const marketAverages = await this.calculateMarketAverages(businessId);
        const businessMetrics = this.calculateBusinessMetrics(matches);

        return {
            marketPosition: this.compareToMarket(businessMetrics, marketAverages),
            strengthsWeaknesses: this.identifyStrengthsWeaknesses(businessMetrics, marketAverages),
            opportunities: await this.identifyOpportunities(businessId, matches),
            competitiveAdvantage: this.calculateCompetitiveAdvantage(businessMetrics, marketAverages)
        };
    }

    async generateRecommendations(matches) {
        const analysis = {
            qualityFactors: this.analyzeQualityFactors(matches),
            performanceGaps: this.identifyPerformanceGaps(matches),
            opportunities: await this.findOpportunities(matches)
        };

        return {
            immediate: this.generateImmediateActions(analysis),
            shortTerm: this.generateShortTermStrategies(analysis),
            longTerm: this.generateLongTermStrategies(analysis)
        };
    }

    // Helper methods for calculations and analysis
    calculateInitialResponseTime(match) {
        const firstResponse = match.timeline.find(event => 
            event.action === 'first_response'
        );
        return firstResponse ? 
            (new Date(firstResponse.timestamp) - new Date(match.createdAt)) / (1000 * 60) : 
            null;
    }

    calculateEngagementRate(match) {
        const communications = match.timeline.filter(event => 
            event.action.includes('communication')
        ).length;
        const matchDuration = (new Date() - new Date(match.createdAt)) / (1000 * 60 * 60 * 24);
        return communications / matchDuration;
    }

    calculateConversionTime(match) {
        if (match.status !== 'completed') return null;
        const completion = match.timeline.find(event => 
            event.action === 'status_completed'
        );
        return completion ? 
            (new Date(completion.timestamp) - new Date(match.createdAt)) / (1000 * 60 * 60 * 24) : 
            null;
    }

    calculateAverage(array, key) {
        const validValues = array.filter(item => item[key] !== null);
        return validValues.length ? 
            validValues.reduce((acc, curr) => acc + curr[key], 0) / validValues.length : 
            0;
    }

    calculateMetricTrend(data, metric) {
        // Implementation of trend calculation using linear regression
        // Returns trend data points and direction
    }
}

module.exports = new MatchAnalyticsService(); 