const MatchHistory = require('../models/matchHistoryModel');
const SystemMetrics = require('../models/systemMetricsModel');
const AlertConfig = require('../models/alertConfigModel');
const mongoose = require('mongoose');
const { EventEmitter } = require('events');
const nodemailer = require('nodemailer');

class MatchMonitoringService extends EventEmitter {
    constructor() {
        super();
        this.metrics = {};
        this.alerts = new Map();
        this.initializeMonitoring();
    }

    async initializeMonitoring() {
        await this.loadAlertConfigurations();
        this.startMetricsCollection();
        this.setupEventListeners();
    }

    async collectMetrics() {
        const currentTime = new Date();
        const hourAgo = new Date(currentTime - 60 * 60 * 1000);

        const metrics = {
            timestamp: currentTime,
            system: await this.collectSystemMetrics(),
            matches: await this.collectMatchMetrics(hourAgo),
            performance: await this.collectPerformanceMetrics(hourAgo),
            errors: await this.collectErrorMetrics(hourAgo)
        };

        await SystemMetrics.create(metrics);
        this.metrics = metrics;
        this.checkAlertThresholds(metrics);
        
        return metrics;
    }

    async collectSystemMetrics() {
        const { loadavg, freemem, totalmem } = require('os');
        
        return {
            cpu: {
                loadAverage: loadavg()[0],
                usage: process.cpuUsage()
            },
            memory: {
                free: freemem(),
                total: totalmem(),
                usage: (1 - freemem() / totalmem()) * 100
            },
            database: await this.getDatabaseMetrics(),
            uptime: process.uptime()
        };
    }

    async collectMatchMetrics(since) {
        const [
            totalMatches,
            activeMatches,
            completedMatches,
            failedMatches,
            averageMatchTime
        ] = await Promise.all([
            MatchHistory.countDocuments({ createdAt: { $gte: since } }),
            MatchHistory.countDocuments({ 
                status: 'active',
                createdAt: { $gte: since }
            }),
            MatchHistory.countDocuments({
                status: 'completed',
                createdAt: { $gte: since }
            }),
            MatchHistory.countDocuments({
                status: 'failed',
                createdAt: { $gte: since }
            }),
            this.calculateAverageMatchTime(since)
        ]);

        return {
            total: totalMatches,
            active: activeMatches,
            completed: completedMatches,
            failed: failedMatches,
            averageMatchTime,
            successRate: (completedMatches / totalMatches) * 100
        };
    }

    async collectPerformanceMetrics(since) {
        return {
            responseTime: await this.calculateAverageResponseTime(since),
            throughput: await this.calculateThroughput(since),
            concurrency: await this.calculateConcurrency(),
            queueLength: await this.getQueueMetrics(),
            resourceUtilization: await this.getResourceUtilization()
        };
    }

    async collectErrorMetrics(since) {
        const errors = await MatchHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: since },
                    status: 'failed'
                }
            },
            {
                $group: {
                    _id: '$errorType',
                    count: { $sum: 1 },
                    examples: { $push: '$errorMessage' }
                }
            }
        ]);

        return {
            total: errors.reduce((sum, err) => sum + err.count, 0),
            breakdown: errors,
            mostCommon: errors.sort((a, b) => b.count - a.count)[0]
        };
    }

    async getDatabaseMetrics() {
        const stats = await mongoose.connection.db.stats();
        
        return {
            collections: stats.collections,
            objects: stats.objects,
            avgObjSize: stats.avgObjSize,
            dataSize: stats.dataSize,
            storageSize: stats.storageSize,
            indexes: stats.indexes,
            indexSize: stats.indexSize
        };
    }

    async calculateAverageMatchTime(since) {
        const result = await MatchHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: since },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    averageTime: {
                        $avg: {
                            $subtract: ['$completedAt', '$createdAt']
                        }
                    }
                }
            }
        ]);

        return result[0]?.averageTime || 0;
    }

    async calculateAverageResponseTime(since) {
        // Implementation for calculating API response times
        return {
            overall: 150, // ms
            endpoints: {
                '/api/matches': 120,
                '/api/matches/create': 200,
                '/api/matches/update': 180
            }
        };
    }

    async calculateThroughput(since) {
        const timeSpan = (new Date() - since) / 1000; // in seconds
        const operations = await MatchHistory.countDocuments({
            createdAt: { $gte: since }
        });

        return operations / timeSpan;
    }

    async calculateConcurrency() {
        return {
            activeUsers: 100, // Replace with actual metric
            activeSessions: 150,
            activeOperations: 25
        };
    }

    async getQueueMetrics() {
        // Implementation for queue metrics
        return {
            current: 10,
            peak: 50,
            averageWaitTime: 2000 // ms
        };
    }

    async getResourceUtilization() {
        return {
            cpu: process.cpuUsage(),
            memory: process.memoryUsage(),
            disk: await this.getDiskUsage()
        };
    }

    async getDiskUsage() {
        // Implementation for disk usage metrics
        return {
            total: 1000000,
            used: 500000,
            free: 500000
        };
    }

    async loadAlertConfigurations() {
        const configs = await AlertConfig.find({ active: true });
        this.alerts.clear();
        
        for (const config of configs) {
            this.alerts.set(config.id, {
                ...config.toObject(),
                lastTriggered: null
            });
        }
    }

    checkAlertThresholds(metrics) {
        for (const [id, alert] of this.alerts) {
            const value = this.evaluateMetricPath(metrics, alert.metricPath);
            
            if (this.shouldTriggerAlert(alert, value)) {
                this.triggerAlert(alert, value);
                alert.lastTriggered = new Date();
            }
        }
    }

    evaluateMetricPath(metrics, path) {
        return path.split('.').reduce((obj, key) => obj?.[key], metrics);
    }

    shouldTriggerAlert(alert, value) {
        if (!alert.lastTriggered) return this.checkThreshold(alert, value);
        
        const cooldownPassed = (new Date() - alert.lastTriggered) > 
            (alert.cooldown * 60 * 1000);
            
        return cooldownPassed && this.checkThreshold(alert, value);
    }

    checkThreshold(alert, value) {
        switch (alert.condition) {
            case 'gt':
                return value > alert.threshold;
            case 'lt':
                return value < alert.threshold;
            case 'eq':
                return value === alert.threshold;
            default:
                return false;
        }
    }

    async triggerAlert(alert, value) {
        const notification = {
            type: alert.type,
            severity: alert.severity,
            message: this.formatAlertMessage(alert, value),
            timestamp: new Date()
        };

        this.emit('alert', notification);
        await this.sendAlertNotification(notification);
    }

    formatAlertMessage(alert, value) {
        return `Alert: ${alert.name}\nMetric: ${alert.metricPath}\nValue: ${value}\nThreshold: ${alert.threshold}`;
    }

    async sendAlertNotification(notification) {
        if (notification.severity === 'critical') {
            await this.sendEmail(notification);
        }
        
        // Add other notification methods (Slack, SMS, etc.)
    }

    async sendEmail(notification) {
        const transporter = nodemailer.createTransport({
            // Email configuration
        });

        await transporter.sendMail({
            from: process.env.ALERT_EMAIL_FROM,
            to: process.env.ALERT_EMAIL_TO,
            subject: `[${notification.severity.toUpperCase()}] System Alert`,
            text: notification.message
        });
    }

    startMetricsCollection() {
        setInterval(async () => {
            try {
                await this.collectMetrics();
            } catch (error) {
                console.error('Error collecting metrics:', error);
            }
        }, 60000); // Collect metrics every minute
    }

    setupEventListeners() {
        // Add event listeners for system events
        process.on('uncaughtException', this.handleUncaughtException.bind(this));
        process.on('unhandledRejection', this.handleUnhandledRejection.bind(this));
    }

    handleUncaughtException(error) {
        this.emit('alert', {
            type: 'error',
            severity: 'critical',
            message: `Uncaught Exception: ${error.message}`,
            error
        });
    }

    handleUnhandledRejection(reason, promise) {
        this.emit('alert', {
            type: 'error',
            severity: 'critical',
            message: `Unhandled Rejection: ${reason}`,
            error: reason
        });
    }

    async getMetricsHistory(timeRange = '24h') {
        const since = this.parseTimeRange(timeRange);
        
        return await SystemMetrics.find({
            timestamp: { $gte: since }
        }).sort('timestamp');
    }

    parseTimeRange(timeRange) {
        const now = new Date();
        const value = parseInt(timeRange);
        const unit = timeRange.slice(-1);
        
        switch (unit) {
            case 'h':
                return new Date(now - value * 60 * 60 * 1000);
            case 'd':
                return new Date(now - value * 24 * 60 * 60 * 1000);
            case 'w':
                return new Date(now - value * 7 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now - 24 * 60 * 60 * 1000);
        }
    }
}

module.exports = new MatchMonitoringService(); 