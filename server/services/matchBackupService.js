const MatchHistory = require('../models/matchHistoryModel');
const Business = require('../models/businessModel');
const Lead = require('../models/leadModel');
const Payment = require('../models/paymentModel');
const Contract = require('../models/contractModel');
const Rating = require('../models/ratingModel');
const Documentation = require('../models/documentationModel');
const AuditLog = require('../models/auditLogModel');
const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');
const { createReadStream, createWriteStream } = require('fs');
const mongoose = require('mongoose');

class MatchBackupService {
    async createBackup(options = {}) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, '../backups', timestamp);
        
        await fs.mkdir(backupDir, { recursive: true });
        
        const collections = await this.getCollectionsToBackup(options);
        const metadata = await this.generateBackupMetadata(collections);
        
        const backupPath = await this.createBackupArchive(backupDir, collections, metadata);
        await this.cleanupOldBackups();
        
        return {
            path: backupPath,
            metadata
        };
    }

    async restoreBackup(backupPath, options = {}) {
        const extractDir = path.join(__dirname, '../temp', 'restore');
        await fs.mkdir(extractDir, { recursive: true });
        
        await this.extractBackup(backupPath, extractDir);
        const metadata = JSON.parse(
            await fs.readFile(path.join(extractDir, 'metadata.json'), 'utf8')
        );
        
        const validationResult = await this.validateBackup(extractDir, metadata);
        if (!validationResult.isValid) {
            throw new Error(`Invalid backup: ${validationResult.errors.join(', ')}`);
        }

        const restoreResult = await this.performRestore(extractDir, metadata, options);
        await fs.rm(extractDir, { recursive: true });
        
        return restoreResult;
    }

    async getCollectionsToBackup(options) {
        const collections = new Map();
        
        // Core match data
        collections.set('matches', await MatchHistory.find(this.buildBackupQuery(options)));
        
        // Related entities
        const matchIds = collections.get('matches').map(match => match._id);
        
        collections.set('businesses', await Business.find({
            _id: { $in: collections.get('matches').map(m => m.business) }
        }));
        
        collections.set('leads', await Lead.find({
            _id: { $in: collections.get('matches').map(m => m.lead) }
        }));
        
        collections.set('payments', await Payment.find({
            match: { $in: matchIds }
        }));
        
        collections.set('contracts', await Contract.find({
            match: { $in: matchIds }
        }));
        
        collections.set('ratings', await Rating.find({
            match: { $in: matchIds }
        }));
        
        collections.set('documentation', await Documentation.find({
            match: { $in: matchIds }
        }));
        
        collections.set('auditLogs', await AuditLog.find({
            entityId: { $in: matchIds },
            entityType: 'match'
        }));
        
        return collections;
    }

    async generateBackupMetadata(collections) {
        const metadata = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            collections: {},
            stats: {},
            checksums: {}
        };

        for (const [name, data] of collections.entries()) {
            metadata.collections[name] = {
                count: data.length,
                schema: this.getCollectionSchema(name)
            };
            metadata.stats[name] = await this.calculateCollectionStats(data);
            metadata.checksums[name] = await this.calculateChecksum(data);
        }

        return metadata;
    }

    async createBackupArchive(backupDir, collections, metadata) {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const output = createWriteStream(path.join(backupDir, 'backup.zip'));
        
        archive.pipe(output);
        
        // Add metadata
        archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });
        
        // Add collection data
        for (const [name, data] of collections.entries()) {
            archive.append(JSON.stringify(data, null, 2), { name: `${name}.json` });
        }
        
        await archive.finalize();
        return path.join(backupDir, 'backup.zip');
    }

    async extractBackup(backupPath, extractDir) {
        // Implementation for extracting zip archive
    }

    async validateBackup(extractDir, metadata) {
        const errors = [];
        
        // Validate schema versions
        for (const [name, info] of Object.entries(metadata.collections)) {
            const currentSchema = this.getCollectionSchema(name);
            if (currentSchema.version !== info.schema.version) {
                errors.push(`Schema version mismatch for ${name}`);
            }
        }
        
        // Validate data integrity
        for (const [name, info] of Object.entries(metadata.checksums)) {
            const data = JSON.parse(
                await fs.readFile(path.join(extractDir, `${name}.json`), 'utf8')
            );
            const checksum = await this.calculateChecksum(data);
            if (checksum !== info) {
                errors.push(`Checksum mismatch for ${name}`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    async performRestore(extractDir, metadata, options) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            const results = {
                restored: {},
                skipped: {},
                errors: {}
            };
            
            for (const [name, info] of Object.entries(metadata.collections)) {
                const data = JSON.parse(
                    await fs.readFile(path.join(extractDir, `${name}.json`), 'utf8')
                );
                
                results.restored[name] = await this.restoreCollection(
                    name,
                    data,
                    options,
                    session
                );
            }
            
            await session.commitTransaction();
            return results;
            
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    buildBackupQuery(options) {
        const query = {};
        
        if (options.dateRange) {
            query.createdAt = {
                $gte: options.dateRange.start,
                $lte: options.dateRange.end
            };
        }
        
        if (options.status) {
            query.status = options.status;
        }
        
        return query;
    }

    async calculateCollectionStats(data) {
        return {
            size: JSON.stringify(data).length,
            dateRange: {
                earliest: data.reduce((min, item) => 
                    item.createdAt < min ? item.createdAt : min,
                    new Date()
                ),
                latest: data.reduce((max, item) =>
                    item.createdAt > max ? item.createdAt : max,
                    new Date(0)
                )
            }
        };
    }

    async calculateChecksum(data) {
        const crypto = require('crypto');
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data));
        return hash.digest('hex');
    }

    getCollectionSchema(name) {
        const schemas = {
            matches: { version: '1.0', model: MatchHistory },
            businesses: { version: '1.0', model: Business },
            leads: { version: '1.0', model: Lead },
            payments: { version: '1.0', model: Payment },
            contracts: { version: '1.0', model: Contract },
            ratings: { version: '1.0', model: Rating },
            documentation: { version: '1.0', model: Documentation },
            auditLogs: { version: '1.0', model: AuditLog }
        };
        
        return schemas[name];
    }

    async restoreCollection(name, data, options, session) {
        const Model = this.getCollectionSchema(name).model;
        const results = {
            total: data.length,
            created: 0,
            updated: 0,
            skipped: 0,
            errors: []
        };
        
        for (const item of data) {
            try {
                if (options.updateExisting) {
                    const updated = await Model.findByIdAndUpdate(
                        item._id,
                        item,
                        { session, new: true }
                    );
                    
                    if (updated) {
                        results.updated++;
                    } else {
                        await Model.create([item], { session });
                        results.created++;
                    }
                } else {
                    await Model.create([item], { session });
                    results.created++;
                }
            } catch (error) {
                results.errors.push({
                    id: item._id,
                    error: error.message
                });
                results.skipped++;
            }
        }
        
        return results;
    }

    async cleanupOldBackups() {
        const backupsDir = path.join(__dirname, '../backups');
        const files = await fs.readdir(backupsDir);
        
        const MAX_BACKUPS = 10;
        
        if (files.length > MAX_BACKUPS) {
            const sortedFiles = files
                .map(file => ({
                    name: file,
                    time: fs.statSync(path.join(backupsDir, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);
            
            for (let i = MAX_BACKUPS; i < sortedFiles.length; i++) {
                await fs.rm(path.join(backupsDir, sortedFiles[i].name), { recursive: true });
            }
        }
    }
}

module.exports = new MatchBackupService(); 