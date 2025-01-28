const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Bid = require('../models/bidModel');
const Product = require('../models/productModel');

exports.getPreferences = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('biddingPreferences');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user.biddingPreferences || {}
    });
});

exports.updatePreferences = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        { biddingPreferences: req.body },
        { 
            new: true,
            runValidators: true
        }
    ).select('biddingPreferences');

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: user.biddingPreferences
    });
});

exports.getStatistics = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    // Get all bids by user
    const bids = await Bid.find({ bidder: userId })
        .populate('product', 'title category')
        .sort('-createdAt');

    // Calculate total bids
    const totalBids = bids.length;

    // Calculate auctions won
    const auctionsWon = await Product.countDocuments({
        'bidding.winner': userId,
        'bidding.ended': true
    });

    // Calculate success rate
    const participatedAuctions = await Product.countDocuments({
        'bids.bidder': userId,
        'bidding.ended': true
    });
    const successRate = participatedAuctions > 0
        ? Math.round((auctionsWon / participatedAuctions) * 100)
        : 0;

    // Calculate average bid amount
    const averageBidAmount = totalBids > 0
        ? bids.reduce((sum, bid) => sum + bid.amount, 0) / totalBids
        : 0;

    // Generate bidding history
    const biddingHistory = await Bid.aggregate([
        { $match: { bidder: userId } },
        {
            $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                amount: { $avg: '$amount' }
            }
        },
        { $sort: { '_id': 1 } },
        {
            $project: {
                date: '$_id',
                amount: 1,
                _id: 0
            }
        }
    ]);

    // Calculate category distribution
    const categoryDistribution = await Bid.aggregate([
        { $match: { bidder: userId } },
        {
            $lookup: {
                from: 'products',
                localField: 'product',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $group: {
                _id: '$product.category',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category'
            }
        },
        { $unwind: '$category' },
        {
            $project: {
                name: '$category.name',
                count: 1
            }
        }
    ]);

    // Calculate percentages for category distribution
    const totalBidsForCategories = categoryDistribution.reduce((sum, cat) => sum + cat.count, 0);
    const categoryDistributionWithPercentages = categoryDistribution.map(cat => ({
        name: cat.name,
        percentage: Math.round((cat.count / totalBidsForCategories) * 100)
    }));

    // Get recent bids with status
    const recentBids = await Bid.find({ bidder: userId })
        .populate('product', 'title')
        .sort('-createdAt')
        .limit(10)
        .lean();

    // Add status to recent bids
    const recentBidsWithStatus = recentBids.map(bid => ({
        ...bid,
        status: bid.product.bidding?.winner?.equals(userId) ? 'won' :
                bid.product.bidding?.ended ? 'lost' :
                bid.amount === bid.product.bidding?.currentBid ? 'winning' : 'outbid'
    }));

    res.status(200).json({
        status: 'success',
        data: {
            totalBids,
            auctionsWon,
            successRate,
            averageBidAmount,
            biddingHistory,
            categoryDistribution: categoryDistributionWithPercentages,
            recentBids: recentBidsWithStatus
        }
    });
}); 