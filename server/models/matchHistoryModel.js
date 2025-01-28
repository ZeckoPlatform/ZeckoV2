const mongoose = require('mongoose');

const matchHistorySchema = new mongoose.Schema({
    match: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    details: {
        expertise: Number,
        availability: Number,
        location: Number,
        responseTime: Number,
        completionRate: Number,
        customerRating: Number
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'connected', 'completed', 'expired'],
        default: 'pending'
    },
    timeline: [{
        action: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        details: mongoose.Schema.Types.Mixed,
        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    feedback: {
        businessRating: Number,
        leadRating: Number,
        businessFeedback: String,
        leadFeedback: String
    },
    metrics: {
        responseTime: Number,
        communicationCount: Number,
        lastInteraction: Date
    }
}, {
    timestamps: true
});

matchHistorySchema.index({ match: 1, lead: 1, business: 1 });
matchHistorySchema.index({ createdAt: -1 });
matchHistorySchema.index({ status: 1 });

const MatchHistory = mongoose.model('MatchHistory', matchHistorySchema);
module.exports = MatchHistory; 