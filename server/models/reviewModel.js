const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true
    },
    contractorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'reported', 'removed'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Index for efficient queries
reviewSchema.index({ contractorId: 1, status: 1 });
reviewSchema.index({ leadId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema); 