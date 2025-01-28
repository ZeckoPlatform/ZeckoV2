const MatchHistory = require('../models/matchHistoryModel');
const Match = require('../models/matchModel');
const { startOfWeek, startOfMonth, startOfQuarter, startOfYear } = require('date-fns');

class MatchDashboardController {
    async getBusinessMetrics(req, res) {
        const { businessId } = req.user;
        const { timeRange } = req.query;

        let startDate;
        const now = new Date();

        switch (timeRange) {
            case 'week':
                startDate = startOfWeek(now);
                break;
            case 'month':
                startDate = startOfMonth(now);
                break;
            case 'quarter':
                startDate = startOfQuarter(now);
                break;
            case 'year':
                startDate = startOfYear(now);
                break;
            default:
                startDate = startOfMonth(now);
        }

        try {
            const [
                matches,
                qualityTrend,
                statusDistribution,
                metrics
            ] = await Promise.all([
                this.getRecentMatches(businessId),
                this.getQualityTrend(businessId, startDate),
                this.getStatusDistribution(businessId, startDate),
                this.calculateMetrics(businessId, startDate)
            ]);

            res.status(200).json({
                status: 'success',
                data: {
                    matches,
                    qualityTrend,
                    statusDistribution,
                    ...metrics
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async getRecentMatches(businessId) {
        return await Match.find({ business: businessId })
            .sort('-createdAt')
            .limit(10)
            .populate('lead', 'title description')
            .lean();
    }

    async getQualityTrend(businessId, startDate) {
        const matches = await MatchHistory.find({
            business: businessId,
            createdAt: { $gte: startDate }
        })
        .select('score createdAt')
        .sort('createdAt')
        .lean();

        return matches.map(match => ({
            date: match.createdAt,
            score: Math.round(match.score * 100)
        }));
    }

    async getStatusDistribution(businessId, startDate) {
        const distribution = await MatchHistory.aggregate([
            {
                $match: {
                    business: businessId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const statusColors = {
            pending: '#ffd700',
            accepted: '#4caf50',
            declined: '#f44336',
            completed: '#2196f3',
            expired: '#9e9e9e'
        };

        return distribution.map(item => ({
            status: item._id,
            value: item.count,
            color: statusColors[item._id]
        }));
    }

    async calculateMetrics(businessId, startDate) {
        const matches = await MatchHistory.find({
            business: businessId,
            createdAt: { $gte: startDate }
        });

        const totalMatches = matches.length;
        const successfulMatches = matches.filter(
            match => ['accepted', 'completed'].includes(match.status)
        ).length;

        const averageScore = matches.reduce(
            (acc, match) => acc + match.score, 0
        ) / totalMatches;

        const activeMatches = matches.filter(
            match => ['pending', 'accepted'].includes(match.status)
        ).length;

        const convertedMatches = matches.filter(
            match => match.status === 'completed'
        ).length;

        return {
            successRate: Math.round((successfulMatches / totalMatches) * 100) || 0,
            averageScore: Math.round(averageScore * 100) || 0,
            activeMatches,
            conversionRate: Math.round((convertedMatches / totalMatches) * 100) || 0
        };
    }
}

module.exports = new MatchDashboardController(); 