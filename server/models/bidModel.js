const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    bidder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'won', 'lost', 'cancelled', 'outbid'],
        default: 'active'
    },
    message: {
        type: String,
        maxLength: 500
    },
    automaticBidding: {
        enabled: {
            type: Boolean,
            default: false
        },
        maxAmount: {
            type: Number
        }
    }
}, {
    timestamps: true
});

// Indexes
bidSchema.index({ product: 1, bidder: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ createdAt: -1 });

// Prevent multiple active bids from same user on same product
bidSchema.index(
    { product: 1, bidder: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'active' } }
);

module.exports = mongoose.model('Bid', bidSchema); 