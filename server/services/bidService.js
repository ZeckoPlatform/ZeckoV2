const Product = require('../models/productModel');
const Bid = require('../models/bidModel');
const AppError = require('../utils/appError');

class BidService {
    constructor(io) {
        this.io = io;
    }

    async placeBid(userId, auctionId, amount) {
        const product = await Product.findById(auctionId);
        
        if (!product || !product.bidding.enabled) {
            throw new AppError('Auction not found or not active', 404);
        }

        if (new Date(product.bidding.endTime) < new Date()) {
            throw new AppError('Auction has ended', 400);
        }

        if (amount <= product.bidding.currentBid) {
            throw new AppError('Bid must be higher than current bid', 400);
        }

        const bid = await Bid.create({
            bidder: userId,
            product: auctionId,
            amount
        });

        // Update product's current bid
        product.bidding.currentBid = amount;
        product.bidding.currentWinner = userId;
        await product.save();

        // Notify all clients in the auction room
        this.io.to(`auction:${auctionId}`).emit('bidUpdate', {
            bid: {
                _id: bid._id,
                amount: bid.amount,
                bidder: userId,
                createdAt: bid.createdAt
            },
            currentBid: amount,
            outbidUserId: product.bidding.previousWinner
        });

        // Update previous winner for next outbid notification
        product.bidding.previousWinner = product.bidding.currentWinner;
        await product.save();

        return bid;
    }

    async getBidHistory(auctionId) {
        const bids = await Bid.find({ product: auctionId })
            .populate('bidder', 'name avatar')
            .sort('-createdAt')
            .limit(50);

        return bids;
    }

    async getAuctionStatus(auctionId) {
        const product = await Product.findById(auctionId)
            .select('bidding');

        return {
            currentBid: product.bidding.currentBid,
            endTime: product.bidding.endTime,
            isEnded: product.bidding.ended,
            winner: product.bidding.winner
        };
    }
}

module.exports = BidService; 