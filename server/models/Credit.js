const mongoose = require('mongoose');

const creditSchema = mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transactions: [{
        amount: Number,
        type: {
            type: String,
            enum: ['purchase', 'spend', 'refund'],
            required: true
        },
        description: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Index for quick lookups
creditSchema.index({ business: 1 });

module.exports = mongoose.model('Credit', creditSchema); 