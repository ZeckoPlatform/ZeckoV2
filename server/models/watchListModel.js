const mongoose = require('mongoose');

const watchListSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    auctions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure each user has only one watchlist
watchListSchema.index({ user: 1 }, { unique: true });

const WatchList = mongoose.model('WatchList', watchListSchema);

module.exports = WatchList; 