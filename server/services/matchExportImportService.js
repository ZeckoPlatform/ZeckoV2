const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/Lead');
const fs = require('fs').promises;
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const ExcelJS = require('exceljs');
const archiver = require('archiver');
const mongoose = require('mongoose');

class MatchExportImportService {
    async exportMatches(format = 'json', filters = {}) {
        const matches = await this.fetchMatchesWithRelations(filters);
        
        switch (format.toLowerCase()) {
            case 'csv':
                return await this.exportToCSV(matches);
            case 'excel':
                return await this.exportToExcel(matches);
            case 'json':
                return await this.exportToJSON(matches);
            default:
                throw new Error('Unsupported export format');
        }
    }

    async importMatches(file, format = 'json', options = {}) {
        const importData = await this.parseImportFile(file, format);
        const validationResults = await this.validateImportData(importData);

        if (!validationResults.isValid) {
            return {
                success: false,
                errors: validationResults.errors
            };
        }

        const importResults = await this.processImport(importData, options);
        await this.createImportAuditLog(importResults);

        return {
            success: true,
            results: importResults
        };
    }

    async fetchMatchesWithRelations(filters) {
        const query = this.buildExportQuery(filters);

        return await MatchHistory.find(query)
            .populate('business')
            .populate('lead')
            .populate('ratings')
            .populate('payments')
            .populate('disputes')
            .lean();
    }

    async exportToCSV(matches) {
        const csvWriter = createCsvWriter({
            path: 'temp/matches-export.csv',
            header: this.getCSVHeaders()
        });

        const formattedData = matches.map(match => 
            this.formatMatchForCSV(match)
        );

        await csvWriter.writeRecords(formattedData);
        return 'temp/matches-export.csv';
    }

    async exportToExcel(matches) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Matches');

        worksheet.columns = this.getExcelColumns();
        
        matches.forEach(match => {
            worksheet.addRow(this.formatMatchForExcel(match));
        });

        await workbook.xlsx.writeFile('temp/matches-export.xlsx');
        return 'temp/matches-export.xlsx';
    }

    async exportToJSON(matches) {
        const formattedData = matches.map(match => 
            this.formatMatchForJSON(match)
        );

        await fs.writeFile(
            'temp/matches-export.json',
            JSON.stringify(formattedData, null, 2)
        );
        return 'temp/matches-export.json';
    }

    async parseImportFile(file, format) {
        switch (format.toLowerCase()) {
            case 'csv':
                return await this.parseCSV(file);
            case 'excel':
                return await this.parseExcel(file);
            case 'json':
                return await this.parseJSON(file);
            default:
                throw new Error('Unsupported import format');
        }
    }

    async validateImportData(data) {
        const errors = [];
        const validData = [];

        for (const item of data) {
            const validationResult = await this.validateMatchData(item);
            if (validationResult.isValid) {
                validData.push(item);
            } else {
                errors.push(validationResult.errors);
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            validData
        };
    }

    async processImport(data, options) {
        const results = {
            total: data.length,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: []
        };

        for (const item of data) {
            try {
                if (options.updateExisting && item.matchId) {
                    const updated = await this.updateExistingMatch(item);
                    if (updated) {
                        results.updated++;
                    } else {
                        results.skipped++;
                    }
                } else {
                    await this.createNewMatch(item);
                    results.created++;
                }
            } catch (error) {
                results.errors.push({
                    item,
                    error: error.message
                });
            }
        }

        return results;
    }

    buildExportQuery(filters) {
        const query = {};

        if (filters.dateRange) {
            query.createdAt = {
                $gte: filters.dateRange.start,
                $lte: filters.dateRange.end
            };
        }

        if (filters.status) {
            query.status = filters.status;
        }

        if (filters.businessId) {
            query.business = filters.businessId;
        }

        return query;
    }

    async createImportAuditLog(results) {
        // Implementation for audit logging
        const auditLog = {
            timestamp: new Date(),
            results: results,
            metadata: {
                totalRecords: results.total,
                successRate: ((results.created + results.updated) / results.total) * 100
            }
        };

        // Save audit log to database
        await mongoose.model('ImportAuditLog').create(auditLog);
    }

    getCSVHeaders() {
        return [
            { id: 'matchId', title: 'Match ID' },
            { id: 'businessName', title: 'Business Name' },
            { id: 'leadName', title: 'Lead Name' },
            { id: 'status', title: 'Status' },
            { id: 'createdAt', title: 'Created At' },
            { id: 'updatedAt', title: 'Updated At' },
            // Add more headers as needed
        ];
    }

    formatMatchForCSV(match) {
        return {
            matchId: match._id.toString(),
            businessName: match.business?.name || '',
            leadName: match.lead?.name || '',
            status: match.status,
            createdAt: match.createdAt.toISOString(),
            updatedAt: match.updatedAt.toISOString()
        };
    }

    async validateMatchData(item) {
        const errors = [];

        if (!item.businessId && !item.businessName) {
            errors.push('Business identifier is required');
        }

        if (!item.leadId && !item.leadName) {
            errors.push('Lead identifier is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new MatchExportImportService(); 