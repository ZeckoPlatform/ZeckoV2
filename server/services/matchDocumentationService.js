const MatchHistory = require('../models/matchHistoryModel');
const Documentation = require('../models/documentationModel');
const mongoose = require('mongoose');
const marked = require('marked');
const sanitizeHtml = require('sanitize-html');

class MatchDocumentationService {
    async createDocument(matchId, userId, data) {
        const match = await MatchHistory.findById(matchId);
        if (!match) {
            throw new Error('Match not found');
        }

        const document = await Documentation.create({
            match: matchId,
            creator: userId,
            title: data.title,
            content: data.content,
            category: data.category,
            tags: data.tags || [],
            attachments: data.attachments || [],
            version: 1,
            status: 'active',
            metadata: {
                lastEditor: userId,
                editCount: 0,
                viewCount: 0
            }
        });

        await this.updateMatchDocumentation(match, document);
        return document;
    }

    async updateDocument(documentId, userId, updates) {
        const document = await Documentation.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        document.version += 1;
        document.metadata.editCount += 1;
        document.metadata.lastEditor = userId;
        document.history = document.history || [];
        
        document.history.push({
            version: document.version,
            content: document.content,
            editor: userId,
            timestamp: new Date()
        });

        Object.assign(document, updates);
        await document.save();

        return document;
    }

    async getDocumentation(matchId, options = {}) {
        const query = { match: matchId, status: 'active' };
        
        if (options.category) {
            query.category = options.category;
        }

        if (options.tags) {
            query.tags = { $all: options.tags };
        }

        const documents = await Documentation.find(query)
            .populate('creator', 'name avatar')
            .populate('metadata.lastEditor', 'name avatar')
            .sort('-createdAt');

        const stats = await this.calculateDocumentationStats(matchId);
        
        return {
            documents,
            stats
        };
    }

    async searchDocumentation(matchId, searchTerm) {
        const documents = await Documentation.find({
            match: matchId,
            status: 'active',
            $text: { $search: searchTerm }
        }).sort({
            score: { $meta: 'textScore' }
        });

        return documents;
    }

    async generateDocumentationExport(matchId, format = 'pdf') {
        const documents = await this.getDocumentation(matchId);
        
        switch (format) {
            case 'pdf':
                return await this.generatePDFExport(documents);
            case 'html':
                return await this.generateHTMLExport(documents);
            case 'markdown':
                return await this.generateMarkdownExport(documents);
            default:
                throw new Error('Unsupported export format');
        }
    }

    async recordDocumentView(documentId, userId) {
        const document = await Documentation.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        document.metadata.viewCount += 1;
        document.viewHistory = document.viewHistory || [];
        document.viewHistory.push({
            user: userId,
            timestamp: new Date()
        });

        await document.save();
    }

    async archiveDocument(documentId, userId, reason) {
        const document = await Documentation.findById(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        document.status = 'archived';
        document.metadata.archivedBy = userId;
        document.metadata.archiveReason = reason;
        document.metadata.archivedAt = new Date();

        await document.save();
    }

    async updateMatchDocumentation(match, document) {
        match.documentation = match.documentation || [];
        match.documentation.push(document._id);
        await match.save();
    }

    async calculateDocumentationStats(matchId) {
        const documents = await Documentation.find({ match: matchId });
        
        return {
            totalDocuments: documents.length,
            totalViews: documents.reduce((sum, doc) => sum + doc.metadata.viewCount, 0),
            averageLength: this.calculateAverageDocumentLength(documents),
            categoryBreakdown: this.calculateCategoryBreakdown(documents),
            versionStats: this.calculateVersionStats(documents)
        };
    }

    calculateAverageDocumentLength(documents) {
        if (documents.length === 0) return 0;
        const totalLength = documents.reduce((sum, doc) => sum + doc.content.length, 0);
        return Math.round(totalLength / documents.length);
    }

    calculateCategoryBreakdown(documents) {
        return documents.reduce((acc, doc) => {
            acc[doc.category] = (acc[doc.category] || 0) + 1;
            return acc;
        }, {});
    }

    calculateVersionStats(documents) {
        return {
            averageVersions: documents.reduce((sum, doc) => sum + doc.version, 0) / documents.length,
            totalEdits: documents.reduce((sum, doc) => sum + doc.metadata.editCount, 0)
        };
    }

    async generatePDFExport(documents) {
        // Implementation for PDF generation
    }

    async generateHTMLExport(documents) {
        // Implementation for HTML generation
    }

    async generateMarkdownExport(documents) {
        // Implementation for Markdown generation
    }
}

module.exports = new MatchDocumentationService(); 