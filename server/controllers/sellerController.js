const Product = require('../models/productModel');
const Bid = require('../models/bidModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getSellerStats = catchAsync(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get active auctions count
    const activeAuctions = await Product.countDocuments({
        seller: req.user._id,
        'bidding.enabled': true,
        'bidding.endTime': { $gt: new Date() }
    });

    // Get completed auctions count
    const completedAuctions = await Product.countDocuments({
        seller: req.user._id,
        'bidding.enabled': false,
        'bidding.ended': true
    });

    // Get today's bids count
    const todayBids = await Bid.countDocuments({
        'product.seller': req.user._id,
        createdAt: { $gte: today }
    });

    // Calculate success rate (auctions with at least one bid)
    const successfulAuctions = await Product.countDocuments({
        seller: req.user._id,
        'bidding.ended': true,
        'bidding.winner': { $exists: true }
    });

    const successRate = completedAuctions > 0
        ? Math.round((successfulAuctions / completedAuctions) * 100)
        : 0;

    // Get recent activity
    const recentActivity = await Bid.find({
        'product.seller': req.user._id
    })
    .sort('-createdAt')
    .limit(10)
    .populate('bidder', 'name avatar')
    .populate('product', 'title images');

    res.status(200).json({
        status: 'success',
        data: {
            activeAuctions,
            completedAuctions,
            todayBids,
            successRate,
            recentActivity
        }
    });
});

exports.getSellerAuctions = catchAsync(async (req, res, next) => {
    const { status = 'active' } = req.query;
    
    let query = {
        seller: req.user._id
    };

    switch (status) {
        case 'active':
            query['bidding.enabled'] = true;
            query['bidding.endTime'] = { $gt: new Date() };
            break;
        case 'completed':
            query['bidding.ended'] = true;
            break;
        case 'scheduled':
            query['bidding.enabled'] = true;
            query['bidding.startTime'] = { $gt: new Date() };
            break;
    }

    const auctions = await Product.find(query)
        .populate({
            path: 'bids',
            options: { sort: { amount: -1 }, limit: 1 }
        });

    res.status(200).json({
        status: 'success',
        data: {
            auctions
        }
    });
}); 