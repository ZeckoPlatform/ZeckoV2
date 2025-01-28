const cron = require('node-cron');
const Product = require('../models/productModel');
const Bid = require('../models/bidModel');
const ActivityLog = require('../models/ActivityLog');

class AuctionScheduler {
    constructor(io) {
        this.io = io;
        this.scheduledAuctions = new Map();
    }

    initialize() {
        // Check for ending auctions every minute
        cron.schedule('* * * * *', async () => {
            try {
                await this.checkEndingAuctions();
            } catch (error) {
                console.error('Error checking ending auctions:', error);
            }
        });

        // Clean up completed auctions daily
        cron.schedule('0 0 * * *', async () => {
            try {
                await this.cleanupCompletedAuctions();
            } catch (error) {
                console.error('Error cleaning up completed auctions:', error);
            }
        });

        // Initialize existing auctions
        this.initializeExistingAuctions();
    }

    async initializeExistingAuctions() {
        try {
            const activeAuctions = await Product.find({
                'bidding.enabled': true,
                'bidding.endTime': { $gt: new Date() }
            });

            activeAuctions.forEach(auction => {
                this.scheduleAuctionEnd(auction);
            });

            console.log(`Initialized ${activeAuctions.length} active auctions`);
        } catch (error) {
            console.error('Error initializing existing auctions:', error);
        }
    }

    scheduleAuctionEnd(product) {
        const endTime = new Date(product.bidding.endTime);
        const now = new Date();

        if (endTime <= now) {
            this.endAuction(product._id);
            return;
        }

        const timeoutId = setTimeout(() => {
            this.endAuction(product._id);
        }, endTime - now);

        this.scheduledAuctions.set(product._id.toString(), timeoutId);
    }

    async endAuction(productId) {
        try {
            const product = await Product.findById(productId)
                .populate('seller');

            if (!product || !product.bidding.enabled) return;

            const highestBid = await Bid.findOne({ 
                product: productId,
                status: 'active'
            })
            .sort('-amount')
            .populate('bidder');

            // Update product status
            product.bidding.enabled = false;
            product.bidding.ended = true;
            product.bidding.winner = highestBid?._id;
            await product.save();

            // Update bids status
            if (highestBid) {
                await Bid.updateMany(
                    { 
                        product: productId,
                        _id: { $ne: highestBid._id },
                        status: 'active'
                    },
                    { status: 'lost' }
                );

                highestBid.status = 'won';
                await highestBid.save();

                // Create activity logs
                await ActivityLog.create({
                    userId: highestBid.bidder._id,
                    type: 'AUCTION_WON',
                    description: `Won auction for ${product.title}`,
                    metadata: {
                        productId,
                        bidAmount: highestBid.amount
                    }
                });
            }

            // Notify participants
            this.notifyAuctionEnd(product, highestBid);

            // Cleanup scheduler
            this.scheduledAuctions.delete(productId.toString());

        } catch (error) {
            console.error('Error ending auction:', error);
        }
    }

    notifyAuctionEnd(product, winningBid) {
        const productRoom = `product:${product._id}`;
        
        // Notify all watchers
        this.io.to(productRoom).emit('activityUpdate', {
            type: 'AUCTION_ENDED',
            data: {
                productId: product._id,
                productTitle: product.title,
                winningBid: winningBid ? {
                    amount: winningBid.amount,
                    bidder: {
                        _id: winningBid.bidder._id,
                        name: winningBid.bidder.name
                    }
                } : null
            }
        });

        // Notify winner specifically
        if (winningBid) {
            this.io.to(`user_${winningBid.bidder._id}`).emit('activityUpdate', {
                type: 'AUCTION_WON',
                data: {
                    productId: product._id,
                    productTitle: product.title,
                    amount: winningBid.amount
                }
            });
        }

        // Notify seller
        this.io.to(`user_${product.seller._id}`).emit('activityUpdate', {
            type: 'AUCTION_COMPLETED',
            data: {
                productId: product._id,
                productTitle: product.title,
                winningBid: winningBid ? {
                    amount: winningBid.amount,
                    bidder: {
                        _id: winningBid.bidder._id,
                        name: winningBid.bidder.name
                    }
                } : null
            }
        });
    }

    async cleanupCompletedAuctions() {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        await Product.updateMany(
            {
                'bidding.enabled': true,
                'bidding.endTime': { $lt: twoDaysAgo }
            },
            {
                'bidding.enabled': false,
                'bidding.ended': true
            }
        );
    }

    rescheduleAuction(productId, newEndTime) {
        const existingTimeout = this.scheduledAuctions.get(productId.toString());
        if (existingTimeout) {
            clearTimeout(existingTimeout);
        }

        const timeUntilEnd = new Date(newEndTime) - new Date();
        if (timeUntilEnd > 0) {
            const timeoutId = setTimeout(() => {
                this.endAuction(productId);
            }, timeUntilEnd);

            this.scheduledAuctions.set(productId.toString(), timeoutId);
        }
    }
}

module.exports = AuctionScheduler; 