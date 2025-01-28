const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

class MatchReportingService {
    async generateMatchReport(filters = {}, format = 'json') {
        const reportData = await this.gatherReportData(filters);
        
        switch (format.toLowerCase()) {
            case 'excel':
                return await this.generateExcelReport(reportData);
            case 'pdf':
                return await this.generatePDFReport(reportData);
            default:
                return reportData;
        }
    }

    async gatherReportData(filters) {
        const dateRange = this.calculateDateRange(filters.timeRange);
        const matches = await this.fetchMatchData(dateRange, filters);

        return {
            summary: this.calculateSummaryMetrics(matches),
            trends: await this.analyzeTrends(matches),
            performance: await this.analyzePerformance(matches),
            categoryAnalysis: this.analyzeCategoryDistribution(matches),
            locationAnalysis: await this.analyzeLocationDistribution(matches),
            qualityMetrics: this.analyzeQualityMetrics(matches),
            businessPerformance: await this.analyzeBusinessPerformance(matches),
            leadAnalysis: await this.analyzeLeadPatterns(matches),
            recommendations: await this.generateRecommendations(matches)
        };
    }

    async fetchMatchData(dateRange, filters) {
        const query = {
            createdAt: { $gte: dateRange.start, $lte: dateRange.end },
            ...this.buildFilterQuery(filters)
        };

        return await MatchHistory.find(query)
            .populate('business')
            .populate('lead')
            .sort('createdAt');
    }

    buildFilterQuery(filters) {
        const query = {};
        
        if (filters.status) {
            query.status = filters.status;
        }
        
        if (filters.businessId) {
            query.business = filters.businessId;
        }
        
        if (filters.minScore) {
            query.score = { $gte: filters.minScore };
        }

        return query;
    }

    calculateSummaryMetrics(matches) {
        const total = matches.length;
        const successful = matches.filter(m => m.status === 'completed').length;
        const avgScore = matches.reduce((acc, m) => acc + m.score, 0) / total;

        return {
            totalMatches: total,
            successfulMatches: successful,
            successRate: (successful / total) * 100,
            averageMatchScore: avgScore * 100,
            activeMatches: matches.filter(m => ['pending', 'accepted'].includes(m.status)).length,
            averageCompletionTime: this.calculateAverageCompletionTime(matches)
        };
    }

    async analyzeTrends(matches) {
        const dailyStats = this.aggregateByDate(matches);
        const weeklyStats = this.aggregateByWeek(matches);
        const monthlyStats = this.aggregateByMonth(matches);

        return {
            daily: dailyStats,
            weekly: weeklyStats,
            monthly: monthlyStats,
            trends: this.calculateTrends(dailyStats)
        };
    }

    async analyzePerformance(matches) {
        const businessPerformance = await this.calculateBusinessPerformance(matches);
        const leadConversion = this.calculateLeadConversion(matches);
        const responseMetrics = this.calculateResponseMetrics(matches);

        return {
            businessPerformance,
            leadConversion,
            responseMetrics,
            qualityTrends: this.calculateQualityTrends(matches)
        };
    }

    analyzeCategoryDistribution(matches) {
        const categories = new Map();
        
        matches.forEach(match => {
            match.lead.categories.forEach(category => {
                const stats = categories.get(category) || { total: 0, successful: 0 };
                stats.total++;
                if (match.status === 'completed') stats.successful++;
                categories.set(category, stats);
            });
        });

        return Array.from(categories.entries()).map(([category, stats]) => ({
            category,
            total: stats.total,
            successful: stats.successful,
            successRate: (stats.successful / stats.total) * 100
        }));
    }

    async analyzeLocationDistribution(matches) {
        const locations = new Map();
        
        matches.forEach(match => {
            if (match.business.location) {
                const region = this.getRegionFromLocation(match.business.location);
                const stats = locations.get(region) || { total: 0, successful: 0 };
                stats.total++;
                if (match.status === 'completed') stats.successful++;
                locations.set(region, stats);
            }
        });

        return Array.from(locations.entries()).map(([region, stats]) => ({
            region,
            total: stats.total,
            successful: stats.successful,
            successRate: (stats.successful / stats.total) * 100
        }));
    }

    async generateExcelReport(data) {
        const workbook = new ExcelJS.Workbook();
        
        // Summary Sheet
        const summarySheet = workbook.addWorksheet('Summary');
        this.addSummaryToExcel(summarySheet, data.summary);
        
        // Trends Sheet
        const trendsSheet = workbook.addWorksheet('Trends');
        this.addTrendsToExcel(trendsSheet, data.trends);
        
        // Performance Sheet
        const performanceSheet = workbook.addWorksheet('Performance');
        this.addPerformanceToExcel(performanceSheet, data.performance);
        
        // Categories Sheet
        const categoriesSheet = workbook.addWorksheet('Categories');
        this.addCategoriesToExcel(categoriesSheet, data.categoryAnalysis);

        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;
    }

    async generatePDFReport(data) {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => Buffer.concat(chunks));

        // Add report content
        this.addSummaryToPDF(doc, data.summary);
        this.addTrendsToPDF(doc, data.trends);
        this.addPerformanceToPDF(doc, data.performance);
        this.addCategoriesToPDF(doc, data.categoryAnalysis);

        doc.end();
        return Buffer.concat(chunks);
    }

    addSummaryToExcel(sheet, summary) {
        sheet.addRow(['Match Summary Report']);
        sheet.addRow(['Metric', 'Value']);
        Object.entries(summary).forEach(([metric, value]) => {
            sheet.addRow([metric, value]);
        });
    }

    addTrendsToExcel(sheet, trends) {
        sheet.addRow(['Match Trends']);
        sheet.addRow(['Date', 'Total Matches', 'Success Rate', 'Average Score']);
        trends.daily.forEach(trend => {
            sheet.addRow([
                trend.date,
                trend.totalMatches,
                trend.successRate,
                trend.averageScore
            ]);
        });
    }

    addSummaryToPDF(doc, summary) {
        doc.fontSize(16).text('Match Summary Report', { align: 'center' });
        doc.moveDown();
        Object.entries(summary).forEach(([metric, value]) => {
            doc.fontSize(12).text(`${metric}: ${value}`);
        });
        doc.moveDown();
    }

    calculateDateRange(timeRange) {
        const end = new Date();
        const start = new Date();
        
        switch (timeRange) {
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
            default:
                start.setMonth(start.getMonth() - 1); // Default to last month
        }

        return { start, end };
    }

    calculateAverageCompletionTime(matches) {
        const completedMatches = matches.filter(m => m.status === 'completed');
        if (completedMatches.length === 0) return 0;

        const totalTime = completedMatches.reduce((acc, match) => {
            const completionTime = new Date(match.updatedAt) - new Date(match.createdAt);
            return acc + completionTime;
        }, 0);

        return totalTime / completedMatches.length / (1000 * 60 * 60 * 24); // Convert to days
    }
}

module.exports = new MatchReportingService(); 