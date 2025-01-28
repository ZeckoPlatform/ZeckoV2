const Product = require('../models/productModel');
const User = require('../models/userModel');

class RecommendationService {
    async getRecommendations(userId) {
        try {
            const user = await User.findById(userId)
                .select('biddingPreferences biddingHistory watchlist');

            if (!user) {
                throw new Error('User not found');
            }

            const recommendations = await this.generateRecommendations(user);
            return recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            throw error;
        }
    }

    async generateRecommendations(user) {
        const pipeline = [
            // Match active auctions
            {
                $match: {
                    'bidding.enabled': true,
                    'bidding.endTime': { $gt: new Date() }
                }
            }
        ];

        // Add category preferences if they exist
        if (user.biddingPreferences?.preferredCategories?.length > 0) {
            pipeline.push({
                $match: {
                    category: { $in: user.biddingPreferences.preferredCategories }
                }
            });
        }

        // Add price range based on bidding history
        if (user.biddingHistory?.length > 0) {
            const avgBidAmount = await this.calculateAverageBidAmount(user._id);
            if (avgBidAmount) {
                pipeline.push({
                    $match: {
                        'bidding.currentBid': {
                            $lte: avgBidAmount * 1.5 // 50% more than average bid
                        }
                    }
                });
            }
        }

        // Add sorting and limiting
        pipeline.push(
            { $sort: { 'bidding.endTime': 1 } },
            { $limit: 8 }
        );

        const recommendations = await Product.aggregate(pipeline);

        // Add match reasons
        return recommendations.map(auction => ({
            ...auction,
            matchReason: this.getMatchReason(auction, user)
        }));
    }

    async calculateAverageBidAmount(userId) {
        const result = await Product.aggregate([
            {
                $match: {
                    'bids.bidder': userId
                }
            },
            {
                $unwind: '$bids'
            },
            {
                $match: {
                    'bids.bidder': userId
                }
            },
            {
                $group: {
                    _id: null,
                    avgAmount: { $avg: '$bids.amount' }
                }
            }
        ]);

        return result[0]?.avgAmount;
    }

    getMatchReason(auction, user) {
        if (user.biddingPreferences?.preferredCategories?.includes(auction.category)) {
            return 'Based on your category preferences';
        }
        if (user.watchlist?.includes(auction._id)) {
            return 'Similar to items you\'re watching';
        }
        return 'Popular in this category';
    }
}

module.exports = new RecommendationService(); 