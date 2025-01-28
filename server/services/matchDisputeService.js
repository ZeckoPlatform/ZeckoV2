const MatchHistory = require('../models/matchHistoryModel');
const Dispute = require('../models/disputeModel');
const NotificationService = require('./notificationService');
const CommunicationService = require('./matchCommunicationService');
const mongoose = require('mongoose');

class MatchDisputeService {
    async createDispute(matchId, userId, data) {
        const match = await MatchHistory.findById(matchId)
            .populate('business')
            .populate('lead');

        if (!match) {
            throw new Error('Match not found');
        }

        const dispute = await Dispute.create({
            match: matchId,
            initiator: userId,
            reason: data.reason,
            description: data.description,
            evidence: data.evidence || [],
            status: 'pending',
            timeline: [{
                action: 'dispute_created',
                performedBy: userId,
                details: {
                    reason: data.reason,
                    description: data.description
                }
            }]
        });

        await this.notifyParties(match, dispute);
        await this.updateMatchStatus(match, 'disputed');
        
        return dispute;
    }

    async resolveDispute(disputeId, adminId, resolution) {
        const dispute = await Dispute.findById(disputeId)
            .populate({
                path: 'match',
                populate: ['business', 'lead']
            });

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.status = 'resolved';
        dispute.resolution = resolution;
        dispute.resolvedBy = adminId;
        dispute.resolvedAt = new Date();

        dispute.timeline.push({
            action: 'dispute_resolved',
            performedBy: adminId,
            details: {
                resolution: resolution.decision,
                notes: resolution.notes
            }
        });

        await dispute.save();
        await this.implementResolution(dispute, resolution);
        await this.notifyResolution(dispute);

        return dispute;
    }

    async addDisputeResponse(disputeId, userId, response) {
        const dispute = await Dispute.findById(disputeId);
        
        if (!dispute) {
            throw new Error('Dispute not found');
        }

        dispute.responses.push({
            user: userId,
            content: response.content,
            attachments: response.attachments || [],
            timestamp: new Date()
        });

        dispute.timeline.push({
            action: 'response_added',
            performedBy: userId,
            details: {
                responseId: dispute.responses[dispute.responses.length - 1]._id
            }
        });

        await dispute.save();
        await this.notifyNewResponse(dispute, userId);
        
        return dispute;
    }

    async getDisputeDetails(disputeId) {
        const dispute = await Dispute.findById(disputeId)
            .populate('match')
            .populate('initiator')
            .populate('resolvedBy')
            .populate('responses.user');

        if (!dispute) {
            throw new Error('Dispute not found');
        }

        const metrics = await this.calculateDisputeMetrics(dispute.match._id);
        
        return {
            dispute,
            metrics,
            recommendations: this.generateRecommendations(dispute, metrics)
        };
    }

    async updateMatchStatus(match, status) {
        match.status = status;
        match.timeline.push({
            action: 'status_updated',
            details: { status },
            timestamp: new Date()
        });
        await match.save();
    }

    async notifyParties(match, dispute) {
        const parties = [
            { id: match.business._id, role: 'business' },
            { id: match.lead.user, role: 'lead' }
        ];

        for (const party of parties) {
            await NotificationService.sendNotification(party.id, {
                type: 'DISPUTE_CREATED',
                title: 'New Dispute Filed',
                message: `A dispute has been filed for match #${match._id}`,
                data: {
                    matchId: match._id,
                    disputeId: dispute._id
                }
            });
        }

        // Notify admins
        await NotificationService.notifyAdmins({
            type: 'NEW_DISPUTE',
            title: 'New Dispute Requires Attention',
            message: `Dispute filed for match #${match._id}`,
            data: {
                matchId: match._id,
                disputeId: dispute._id
            }
        });
    }

    async implementResolution(dispute, resolution) {
        const match = dispute.match;

        switch (resolution.decision) {
            case 'refund':
                await this.handleRefund(match, resolution);
                break;
            case 'continue':
                await this.updateMatchStatus(match, 'active');
                break;
            case 'terminate':
                await this.updateMatchStatus(match, 'terminated');
                break;
            default:
                throw new Error('Invalid resolution decision');
        }
    }

    async notifyResolution(dispute) {
        const match = dispute.match;
        const parties = [
            { id: match.business._id, role: 'business' },
            { id: match.lead.user, role: 'lead' }
        ];

        for (const party of parties) {
            await NotificationService.sendNotification(party.id, {
                type: 'DISPUTE_RESOLVED',
                title: 'Dispute Resolution',
                message: `The dispute for match #${match._id} has been resolved`,
                data: {
                    matchId: match._id,
                    disputeId: dispute._id,
                    resolution: dispute.resolution.decision
                }
            });
        }
    }

    async notifyNewResponse(dispute, responderId) {
        const match = dispute.match;
        const otherPartyId = responderId === match.business._id ? 
            match.lead.user : 
            match.business._id;

        await NotificationService.sendNotification(otherPartyId, {
            type: 'DISPUTE_RESPONSE',
            title: 'New Dispute Response',
            message: `New response added to dispute for match #${match._id}`,
            data: {
                matchId: match._id,
                disputeId: dispute._id
            }
        });
    }

    async calculateDisputeMetrics(matchId) {
        const disputes = await Dispute.find({ match: matchId });
        
        return {
            totalDisputes: disputes.length,
            averageResolutionTime: this.calculateAverageResolutionTime(disputes),
            resolutionTypes: this.aggregateResolutionTypes(disputes),
            responseMetrics: await this.calculateResponseMetrics(disputes)
        };
    }

    calculateAverageResolutionTime(disputes) {
        const resolvedDisputes = disputes.filter(d => d.resolvedAt);
        if (resolvedDisputes.length === 0) return 0;

        const totalTime = resolvedDisputes.reduce((acc, dispute) => {
            return acc + (dispute.resolvedAt - dispute.createdAt);
        }, 0);

        return totalTime / resolvedDisputes.length;
    }

    aggregateResolutionTypes(disputes) {
        return disputes.reduce((acc, dispute) => {
            if (dispute.resolution?.decision) {
                acc[dispute.resolution.decision] = (acc[dispute.resolution.decision] || 0) + 1;
            }
            return acc;
        }, {});
    }

    async calculateResponseMetrics(disputes) {
        const totalResponses = disputes.reduce((acc, dispute) => 
            acc + dispute.responses.length, 0
        );

        return {
            averageResponses: totalResponses / disputes.length,
            responseTimeDistribution: this.calculateResponseTimeDistribution(disputes)
        };
    }

    calculateResponseTimeDistribution(disputes) {
        const times = [];
        disputes.forEach(dispute => {
            let lastTimestamp = dispute.createdAt;
            dispute.responses.forEach(response => {
                times.push(response.timestamp - lastTimestamp);
                lastTimestamp = response.timestamp;
            });
        });

        return {
            min: Math.min(...times),
            max: Math.max(...times),
            average: times.reduce((acc, time) => acc + time, 0) / times.length
        };
    }

    generateRecommendations(dispute, metrics) {
        const recommendations = [];

        if (metrics.averageResolutionTime > 7 * 24 * 60 * 60 * 1000) { // 7 days
            recommendations.push({
                type: 'warning',
                message: 'Resolution time is above average. Consider expediting the process.'
            });
        }

        if (dispute.responses.length < metrics.averageResponses) {
            recommendations.push({
                type: 'info',
                message: 'More communication might be needed for optimal resolution.'
            });
        }

        return recommendations;
    }
}

module.exports = new MatchDisputeService(); 