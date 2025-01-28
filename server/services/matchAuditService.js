const AuditLog = require('../models/auditLogModel');
const MatchHistory = require('../models/matchHistoryModel');
const mongoose = require('mongoose');

class MatchAuditService {
    async logAction(data) {
        const auditLog = await AuditLog.create({
            action: data.action,
            entityType: data.entityType,
            entityId: data.entityId,
            performedBy: data.userId,
            changes: data.changes || {},
            metadata: data.metadata || {},
            timestamp: new Date(),
            ipAddress: data.ipAddress,
            userAgent: data.userAgent
        });

        await this.updateEntityAuditTrail(data.entityType, data.entityId, auditLog._id);
        return auditLog;
    }

    async getAuditLogs(filters = {}) {
        const query = {};

        if (filters.entityType) {
            query.entityType = filters.entityType;
        }

        if (filters.entityId) {
            query.entityId = filters.entityId;
        }

        if (filters.action) {
            query.action = filters.action;
        }

        if (filters.userId) {
            query.performedBy = filters.userId;
        }

        if (filters.dateRange) {
            query.timestamp = {
                $gte: filters.dateRange.start,
                $lte: filters.dateRange.end
            };
        }

        const auditLogs = await AuditLog.find(query)
            .populate('performedBy', 'name email avatar')
            .sort('-timestamp')
            .limit(filters.limit || 100)
            .skip(filters.skip || 0);

        const stats = await this.calculateAuditStats(query);
        
        return {
            logs: auditLogs,
            stats
        };
    }

    async getEntityAuditTrail(entityType, entityId) {
        const auditLogs = await AuditLog.find({
            entityType,
            entityId
        })
        .populate('performedBy', 'name email avatar')
        .sort('-timestamp');

        return {
            logs: auditLogs,
            summary: this.generateAuditSummary(auditLogs)
        };
    }

    async searchAuditLogs(searchTerm) {
        return await AuditLog.find({
            $text: { $search: searchTerm }
        })
        .populate('performedBy', 'name email avatar')
        .sort({ score: { $meta: 'textScore' } });
    }

    async generateAuditReport(filters = {}) {
        const { logs, stats } = await this.getAuditLogs(filters);
        
        return {
            summary: stats,
            details: this.formatAuditReport(logs),
            recommendations: this.generateAuditRecommendations(logs, stats)
        };
    }

    async updateEntityAuditTrail(entityType, entityId, auditLogId) {
        switch (entityType) {
            case 'match':
                await MatchHistory.findByIdAndUpdate(entityId, {
                    $push: { auditTrail: auditLogId }
                });
                break;
            // Add other entity types as needed
        }
    }

    async calculateAuditStats(baseQuery = {}) {
        const [
            totalActions,
            actionBreakdown,
            userActivityStats,
            timeDistribution
        ] = await Promise.all([
            AuditLog.countDocuments(baseQuery),
            this.calculateActionBreakdown(baseQuery),
            this.calculateUserActivityStats(baseQuery),
            this.calculateTimeDistribution(baseQuery)
        ]);

        return {
            totalActions,
            actionBreakdown,
            userActivityStats,
            timeDistribution
        };
    }

    calculateActionBreakdown(baseQuery) {
        return AuditLog.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
    }

    calculateUserActivityStats(baseQuery) {
        return AuditLog.aggregate([
            { $match: baseQuery },
            {
                $group: {
                    _id: '$performedBy',
                    actionCount: { $sum: 1 },
                    lastAction: { $max: '$timestamp' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    userName: '$user.name',
                    actionCount: 1,
                    lastAction: 1
                }
            }
        ]);
    }

    calculateTimeDistribution(baseQuery) {
        const now = new Date();
        const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        return {
            last24Hours: AuditLog.countDocuments({
                ...baseQuery,
                timestamp: { $gte: dayAgo }
            }),
            lastWeek: AuditLog.countDocuments({
                ...baseQuery,
                timestamp: { $gte: weekAgo }
            }),
            total: AuditLog.countDocuments(baseQuery)
        };
    }

    generateAuditSummary(logs) {
        return {
            totalActions: logs.length,
            uniqueUsers: new Set(logs.map(log => log.performedBy._id.toString())).size,
            mostCommonAction: this.getMostCommonAction(logs),
            latestAction: logs[0],
            changeFrequency: this.calculateChangeFrequency(logs)
        };
    }

    getMostCommonAction(logs) {
        const actionCounts = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(actionCounts)
            .sort(([, a], [, b]) => b - a)[0][0];
    }

    calculateChangeFrequency(logs) {
        if (logs.length < 2) return 0;
        
        const timeSpan = logs[0].timestamp - logs[logs.length - 1].timestamp;
        const days = timeSpan / (1000 * 60 * 60 * 24);
        
        return logs.length / days;
    }

    formatAuditReport(logs) {
        return logs.map(log => ({
            timestamp: log.timestamp,
            action: log.action,
            user: log.performedBy.name,
            details: this.formatAuditDetails(log)
        }));
    }

    formatAuditDetails(log) {
        return {
            action: log.action,
            changes: this.formatChanges(log.changes),
            metadata: log.metadata
        };
    }

    formatChanges(changes) {
        return Object.entries(changes).map(([field, { old, new: newValue }]) => ({
            field,
            oldValue: old,
            newValue
        }));
    }

    generateAuditRecommendations(logs, stats) {
        const recommendations = [];

        if (this.detectUnusualActivity(logs, stats)) {
            recommendations.push({
                type: 'warning',
                message: 'Unusual activity detected. Consider reviewing recent actions.'
            });
        }

        if (this.detectHighFrequencyChanges(logs)) {
            recommendations.push({
                type: 'info',
                message: 'High frequency of changes detected. Consider implementing rate limiting.'
            });
        }

        return recommendations;
    }

    detectUnusualActivity(logs, stats) {
        const averageActionsPerUser = stats.totalActions / stats.userActivityStats.length;
        return stats.userActivityStats.some(user => 
            user.actionCount > averageActionsPerUser * 2
        );
    }

    detectHighFrequencyChanges(logs) {
        const changeFrequency = this.calculateChangeFrequency(logs);
        return changeFrequency > 100; // Threshold for high frequency
    }
}

module.exports = new MatchAuditService(); 