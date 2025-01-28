const SmartMatchService = require('../services/smartMatchService');
const Lead = require('../models/Lead');
const BusinessModel = require('../models/businessModel');
const NotificationService = require('../services/notificationService');
const catchAsync = require('../utils/catchAsync');

exports.initiateMatch = catchAsync(async (req, res) => {
    const { leadId } = req.params;
    const { businessId } = req.body;

    const matchScore = await SmartMatchService.calculateMatchScore(businessId, leadId);
    
    if (matchScore.totalScore >= 0.7) { // Threshold for automatic matching
        // Create match record
        const match = await Match.create({
            lead: leadId,
            business: businessId,
            score: matchScore.totalScore,
            matchDetails: matchScore.details,
            status: 'pending'
        });

        // Notify both parties
        await NotificationService.sendMatchNotification(match);
    }

    res.status(200).json({
        status: 'success',
        data: {
            score: matchScore.totalScore,
            details: matchScore.details
        }
    });
});

exports.getMatches = catchAsync(async (req, res) => {
    const { leadId } = req.params;
    const matches = await SmartMatchService.findMatches(leadId);

    res.status(200).json({
        status: 'success',
        data: {
            matches
        }
    });
});

exports.acceptMatch = catchAsync(async (req, res) => {
    const { matchId } = req.params;
    const match = await Match.findById(matchId);

    if (!match) {
        throw new Error('Match not found');
    }

    match.status = 'accepted';
    await match.save();

    // Notify the other party
    await NotificationService.sendMatchAcceptedNotification(match);

    res.status(200).json({
        status: 'success',
        data: {
            match
        }
    });
}); 