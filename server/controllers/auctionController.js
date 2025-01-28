const Product = require('../models/productModel');
const Bid = require('../models/bidModel');
const WatchList = require('../models/watchListModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getActiveAuctions = catchAsync(async (req, res, next) => {
    const { watching } = req.query;
    let query = {
        'bidding.enabled': true,
        'bidding.endTime': { $gt: new Date() }
    };

    // If watching=true, only return watched auctions
    if (watching === 'true') {
        const watchlist = await WatchList.findOne({ user: req.user._id });
        if (watchlist) {
            query._id = { $in: watchlist.auctions };
        } else {
            query._id = { $in: [] }; // Return no results if no watchlist
        }
    }

    const auctions = await Product.aggregate([
        { $match: query },
        {
            $lookup: {
                from: 'bids',
                localField: '_id',
                foreignField: 'product',
                as: 'bids'
            }
        },
        {
            $addFields: {
                totalBids: { $size: '$bids' },
                currentBid: {
                    $ifNull: [
                        { $max: '$bids.amount' },
                        '$bidding.startPrice'
                    ]
                },
                hasNewBids: {
                    $gt: [
                        {
                            $size: {
                                $filter: {
                                    input: '$bids',
                                    as: 'bid',
                                    cond: {
                                        $gt: [
                                            '$$bid.createdAt',
                                            new Date(Date.now() - 5 * 60 * 1000) // last 5 minutes
                                        ]
                                    }
                                }
                            }
                        },
                        0
                    ]
                }
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            auctions
        }
    });
});

exports.toggleWatchAuction = catchAsync(async (req, res, next) => {
    const { auctionId } = req.params;
    const userId = req.user._id;

    // Verify auction exists
    const auction = await Product.findOne({
        _id: auctionId,
        'bidding.enabled': true
    });

    if (!auction) {
        return next(new AppError('Auction not found or not active', 404));
    }

    // Find or create watchlist
    let watchlist = await WatchList.findOne({ user: userId });
    if (!watchlist) {
        watchlist = await WatchList.create({
            user: userId,
            auctions: []
        });
    }

    // Toggle auction in watchlist
    const isWatching = watchlist.auctions.includes(auctionId);
    if (isWatching) {
        watchlist.auctions = watchlist.auctions.filter(
            id => id.toString() !== auctionId
        );
    } else {
        watchlist.auctions.push(auctionId);
    }

    await watchlist.save();

    res.status(200).json({
        status: 'success',
        data: {
            watching: !isWatching
        }
    });
});

exports.getWatchlist = catchAsync(async (req, res, next) => {
    const watchlist = await WatchList.findOne({ user: req.user._id });
    
    res.status(200).json({
        status: 'success',
        data: {
            watchlist: watchlist ? watchlist.auctions : []
        }
    });
});

exports.scheduleAuction = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const {
        startTime,
        endTime,
        startPrice,
        reservePrice,
        automaticStart,
        incrementAmount
    } = req.body;

    // Verify product ownership
    const product = await Product.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return next(new AppError('Product not found or unauthorized', 404));
    }

    if (product.bidding?.enabled) {
        return next(new AppError('Product already has an active auction', 400));
    }

    // Validate dates
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start <= now) {
        return next(new AppError('Start time must be in the future', 400));
    }

    if (end <= start) {
        return next(new AppError('End time must be after start time', 400));
    }

    // Update product with auction settings
    product.bidding = {
        enabled: automaticStart,
        scheduled: true,
        startTime: start,
        endTime: end,
        startPrice: parseFloat(startPrice),
        reservePrice: reservePrice ? parseFloat(reservePrice) : undefined,
        incrementAmount: parseFloat(incrementAmount)
    };

    await product.save();

    // Schedule the auction
    const auctionScheduler = req.app.get('auctionScheduler');
    if (automaticStart) {
        auctionScheduler.scheduleAuction(product);
    }

    res.status(200).json({
        status: 'success',
        data: {
            product
        }
    });
});

exports.searchAuctions = catchAsync(async (req, res, next) => {
    const {
        q = '',
        category,
        minPrice = 0,
        maxPrice = Number.MAX_SAFE_INTEGER,
        status = 'active',
        sortBy = 'endingSoon',
        page = 1,
        limit = 12
    } = req.query;

    // Build query
    const query = {
        'bidding.enabled': true
    };

    // Search term
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ];
    }

    // Category filter
    if (category) {
        query.category = category;
    }

    // Price range
    query['bidding.currentBid'] = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice)
    };

    // Status filter
    const now = new Date();
    switch (status) {
        case 'ending':
            query['bidding.endTime'] = {
                $gt: now,
                $lt: new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours
            };
            break;
        case 'upcoming':
            query['bidding.startTime'] = { $gt: now };
            break;
        default: // active
            query['bidding.startTime'] = { $lte: now };
            query['bidding.endTime'] = { $gt: now };
    }

    // Sort options
    let sortOptions = {};
    switch (sortBy) {
        case 'priceLow':
            sortOptions['bidding.currentBid'] = 1;
            break;
        case 'priceHigh':
            sortOptions['bidding.currentBid'] = -1;
            break;
        case 'newest':
            sortOptions['createdAt'] = -1;
            break;
        default: // endingSoon
            sortOptions['bidding.endTime'] = 1;
    }

    const skip = (page - 1) * limit;

    const [auctions, total] = await Promise.all([
        Product.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .populate('category', 'name')
            .populate('seller', 'name'),
        Product.countDocuments(query)
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            auctions,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit)
        }
    });
}); 