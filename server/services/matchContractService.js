const MatchHistory = require('../models/matchHistoryModel');
const Contract = require('../models/contractModel');
const NotificationService = require('./notificationService');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');

class MatchContractService {
    async createContract(matchId, creatorId, data) {
        const match = await MatchHistory.findById(matchId)
            .populate('business')
            .populate('lead');

        if (!match) {
            throw new Error('Match not found');
        }

        const contract = await Contract.create({
            match: matchId,
            creator: creatorId,
            title: data.title,
            terms: data.terms,
            scope: data.scope,
            deliverables: data.deliverables,
            timeline: data.timeline,
            payment: data.payment,
            status: 'draft',
            version: 1,
            history: [{
                action: 'contract_created',
                performedBy: creatorId,
                timestamp: new Date(),
                details: {
                    version: 1
                }
            }]
        });

        await this.notifyContractCreation(match, contract);
        await this.updateMatchContractStatus(match, 'pending_review');
        
        return contract;
    }

    async updateContract(contractId, userId, updates) {
        const contract = await Contract.findById(contractId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            });

        if (!contract) {
            throw new Error('Contract not found');
        }

        // Create new version
        contract.version += 1;
        Object.assign(contract, updates);

        contract.history.push({
            action: 'contract_updated',
            performedBy: userId,
            timestamp: new Date(),
            details: {
                version: contract.version,
                changes: Object.keys(updates)
            }
        });

        await contract.save();
        await this.notifyContractUpdate(contract);
        
        return contract;
    }

    async signContract(contractId, userId, signatureData) {
        const contract = await Contract.findById(contractId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            });

        if (!contract) {
            throw new Error('Contract not found');
        }

        const signature = {
            user: userId,
            timestamp: new Date(),
            signatureData,
            ipAddress: signatureData.ipAddress
        };

        if (userId === contract.match.business._id.toString()) {
            contract.businessSignature = signature;
        } else if (userId === contract.match.lead.user.toString()) {
            contract.leadSignature = signature;
        } else {
            throw new Error('Unauthorized to sign contract');
        }

        contract.history.push({
            action: 'contract_signed',
            performedBy: userId,
            timestamp: new Date(),
            details: {
                signatureType: userId === contract.match.business._id.toString() ? 'business' : 'lead'
            }
        });

        if (contract.businessSignature && contract.leadSignature) {
            contract.status = 'active';
            contract.activatedAt = new Date();
            await this.updateMatchContractStatus(contract.match, 'contract_active');
        }

        await contract.save();
        await this.notifyContractSigned(contract, userId);
        
        return contract;
    }

    async generateContractPDF(contractId) {
        const contract = await Contract.findById(contractId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            });

        if (!contract) {
            throw new Error('Contract not found');
        }

        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => Buffer.concat(chunks));

        this.addContractHeader(doc, contract);
        this.addContractBody(doc, contract);
        this.addSignatures(doc, contract);

        doc.end();
        return Buffer.concat(chunks);
    }

    async getContractHistory(contractId) {
        const contract = await Contract.findById(contractId)
            .populate({
                path: 'history.performedBy',
                select: 'name'
            });

        if (!contract) {
            throw new Error('Contract not found');
        }

        return {
            history: contract.history,
            metrics: await this.calculateContractMetrics(contract)
        };
    }

    async calculateContractMetrics(contract) {
        const versionCount = contract.history.filter(h => 
            h.action === 'contract_updated'
        ).length + 1;

        const timeToSign = contract.activatedAt ? 
            (contract.activatedAt - contract.createdAt) / (1000 * 60 * 60) : // hours
            null;

        return {
            versionCount,
            timeToSign,
            changeFrequency: this.calculateChangeFrequency(contract.history),
            signingOrder: this.determineSigningOrder(contract)
        };
    }

    calculateChangeFrequency(history) {
        const updates = history.filter(h => h.action === 'contract_updated');
        if (updates.length < 2) return 0;

        const timeSpan = updates[updates.length - 1].timestamp - updates[0].timestamp;
        return updates.length / (timeSpan / (1000 * 60 * 60 * 24)); // changes per day
    }

    determineSigningOrder(contract) {
        if (!contract.businessSignature && !contract.leadSignature) {
            return 'pending';
        }
        if (contract.businessSignature && !contract.leadSignature) {
            return 'business_first';
        }
        if (!contract.businessSignature && contract.leadSignature) {
            return 'lead_first';
        }
        return 'completed';
    }

    async updateMatchContractStatus(match, status) {
        match.contractStatus = status;
        match.timeline.push({
            action: 'contract_status_updated',
            timestamp: new Date(),
            details: { status }
        });
        await match.save();
    }

    async notifyContractCreation(match, contract) {
        const recipients = [
            { id: match.business._id, role: 'business' },
            { id: match.lead.user, role: 'lead' }
        ];

        for (const recipient of recipients) {
            await NotificationService.sendNotification(recipient.id, {
                type: 'CONTRACT_CREATED',
                title: 'New Contract Created',
                message: `A new contract has been created for match #${match._id}`,
                data: {
                    matchId: match._id,
                    contractId: contract._id
                }
            });
        }
    }

    async notifyContractUpdate(contract) {
        const recipients = [
            { id: contract.match.business._id, role: 'business' },
            { id: contract.match.lead.user, role: 'lead' }
        ];

        for (const recipient of recipients) {
            await NotificationService.sendNotification(recipient.id, {
                type: 'CONTRACT_UPDATED',
                title: 'Contract Updated',
                message: `Contract for match #${contract.match._id} has been updated`,
                data: {
                    matchId: contract.match._id,
                    contractId: contract._id,
                    version: contract.version
                }
            });
        }
    }

    async notifyContractSigned(contract, signerId) {
        const recipientId = signerId === contract.match.business._id.toString() ?
            contract.match.lead.user :
            contract.match.business._id;

        await NotificationService.sendNotification(recipientId, {
            type: 'CONTRACT_SIGNED',
            title: 'Contract Signed',
            message: `The contract for match #${contract.match._id} has been signed`,
            data: {
                matchId: contract.match._id,
                contractId: contract._id,
                status: contract.status
            }
        });
    }

    addContractHeader(doc, contract) {
        doc.fontSize(20).text('Service Agreement', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Contract ID: ${contract._id}`);
        doc.text(`Version: ${contract.version}`);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.moveDown();
    }

    addContractBody(doc, contract) {
        const sections = [
            { title: 'Scope of Work', content: contract.scope },
            { title: 'Deliverables', content: contract.deliverables },
            { title: 'Timeline', content: contract.timeline },
            { title: 'Payment Terms', content: contract.payment },
            { title: 'Terms and Conditions', content: contract.terms }
        ];

        sections.forEach(section => {
            doc.fontSize(14).text(section.title);
            doc.fontSize(12).text(section.content);
            doc.moveDown();
        });
    }

    addSignatures(doc, contract) {
        doc.fontSize(14).text('Signatures', { underline: true });
        doc.moveDown();

        if (contract.businessSignature) {
            doc.fontSize(12).text('Business Representative');
            doc.text(`Signed by: ${contract.match.business.name}`);
            doc.text(`Date: ${contract.businessSignature.timestamp.toLocaleDateString()}`);
            doc.moveDown();
        }

        if (contract.leadSignature) {
            doc.fontSize(12).text('Client');
            doc.text(`Signed by: ${contract.match.lead.user.name}`);
            doc.text(`Date: ${contract.leadSignature.timestamp.toLocaleDateString()}`);
        }
    }
}

module.exports = new MatchContractService(); 