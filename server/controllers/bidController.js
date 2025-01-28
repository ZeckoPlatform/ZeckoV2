const Bid = require('../models/bidModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ActivityLog = require('../models/ActivityLog');

const notifyBidPlaced = (io, bid, product) => {
    // Notify the bidder
    io.to(`user_${bid.bidder}`).emit('activityUpdate', {
        type: 'BID_PLACED',
        amount: bid.amount,
        productTitle: product.title,
        productId: product._id
    });

    // Notify previous highest bidder if they were outbid
    const previousHighestBid = product.bidding.currentBid;
    if (previousHighestBid && previousHighestBid.bidder.toString() !== bid.bidder.toString()) {
        io.to(`user_${previousHighestBid.bidder}`).emit('activityUpdate', {
            type: 'BID_OUTBID',
            productTitle: product.title,
            productId: product._id,
            newAmount: bid.amount
        });
    }

    // Notify the seller
    io.to(`user_${product.seller}`).emit('activityUpdate', {
        type: 'BID_RECEIVED',
        amount: bid.amount,
        productTitle: product.title,
        productId: product._id,
        bidder: bid.bidder
    });
};

exports.createBid = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.body.product);
    
    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    if (!product.bidding.enabled) {
        return next(new AppError('Bidding is not enabled for this product', 400));
    }

    if (product.seller.toString() === req.user._id.toString()) {
        return next(new AppError('You cannot bid on your own product', 400));
    }

    // Check if bid amount is valid
    if (req.body.amount < product.bidding.minimumBid) {
        return next(new AppError(`Bid must be at least ${product.bidding.minimumBid}`, 400));
    }

    // Create new bid
    const bid = await Bid.create({
        ...req.body,
        bidder: req.user._id
    });

    // Update product's current bid
    await Product.findByIdAndUpdate(req.body.product, {
        'bidding.currentBid': req.body.amount
    });

    // Log the activity
    await ActivityLog.create({
        userId: req.user._id,
        type: 'BID_PLACED',
        description: `Placed bid on product ${product.title}`,
        metadata: {
            productId: product._id,
            bidId: bid._id,
            amount: req.body.amount
        }
    });

    // Emit socket event to all users watching this product
    const io = req.app.get('io');
    io.to(`product:${product._id}`).emit('activityUpdate', {
        type: 'NEW_BID',
        data: {
            bid: {
                ...bid.toObject(),
                bidder: {
                    _id: req.user._id,
                    name: req.user.name
                }
            },
            product: {
                _id: product._id,
                title: product.title,
                currentBid: req.body.amount
            }
        }
    });

    // Notify the seller
    io.to(`user_${product.seller}`).emit('activityUpdate', {
        type: 'NEW_BID_RECEIVED',
        description: `New bid received on your product ${product.title}`,
        metadata: {
            productId: product._id,
            bidId: bid._id,
            amount: req.body.amount,
            bidder: req.user._id
        }
    });

    // After successful bid creation
    notifyBidPlaced(io, bid, product);

    res.status(201).json({
        status: 'success',
        data: {
            bid
        }
    });
});

exports.getBids = catchAsync(async (req, res, next) => {
    const bids = await Bid.find({ product: req.params.productId })
        .populate('bidder', 'name avatar')
        .sort('-amount');

    res.status(200).json({
        status: 'success',
        results: bids.length,
        data: {
            bids
        }
    });
});

exports.getUserBids = catchAsync(async (req, res, next) => {
    const bids = await Bid.find({ bidder: req.user.id })
        .populate('product')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        results: bids.length,
        data: {
            bids
        }
    });
});

exports.cancelBid = catchAsync(async (req, res, next) => {
    const bid = await Bid.findOne({
        _id: req.params.id,
        bidder: req.user.id,
        status: 'active'
    });

    if (!bid) {
        return next(new AppError('Bid not found or already cancelled', 404));
    }

    bid.status = 'cancelled';
    await bid.save();

    res.status(200).json({
        status: 'success',
        data: {
            bid
        }
    });
});

exports.handleAuctionEnd = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const io = req.app.get('io');

    const product = await Product.findById(productId)
        .populate('bidding.highestBid');

    if (!product) {
        return next(new AppError('Product not found', 404));
    }

    const highestBid = product.bidding.highestBid;

    if (highestBid) {
        // Notify winner
        io.to(`user_${highestBid.bidder}`).emit('activityUpdate', {
            type: 'BID_WON',
            productTitle: product.title,
            productId: product._id,
            amount: highestBid.amount
        });
    }

    // Notify all participants
    io.to(`product:${productId}`).emit('activityUpdate', {
        type: 'BID_ENDED',
        productTitle: product.title,
        productId: product._id,
        finalAmount: highestBid?.amount
    });

    res.status(200).json({
        status: 'success',
        message: 'Auction ended notifications sent'
    });
});

exports.getProductBidsForManagement = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({
        _id: req.params.productId,
        seller: req.user._id
    });

    if (!product) {
        return next(new AppError('Product not found or unauthorized', 404));
    }

    const bids = await Bid.find({ product: req.params.productId })
        .populate('bidder', 'name email avatar')
        .sort('-createdAt');

    res.status(200).json({
        status: 'success',
        data: {
            bids
        }
    });
});

exports.acceptBid = catchAsync(async (req, res, next) => {
    const bid = await Bid.findById(req.params.bidId)
        .populate('product');

    if (!bid) {
        return next(new AppError('Bid not found', 404));
    }

    if (bid.product.seller.toString() !== req.user._id.toString()) {
        return next(new AppError('Unauthorized', 403));
    }

    if (bid.status !== 'active') {
        return next(new AppError('Bid is no longer active', 400));
    }

    // Update all other bids to 'lost'
    await Bid.updateMany(
        {
            product: bid.product._id,
            _id: { $ne: bid._id },
            status: 'active'
        },
        { status: 'lost' }
    );

    // Update the winning bid
    bid.status = 'accepted';
    await bid.save();

    // Update product status
    await Product.findByIdAndUpdate(bid.product._id, {
        'bidding.enabled': false,
        'bidding.winner': bid._id
    });

    // Notify all participants
    const io = req.app.get('io');
    io.to(`product:${bid.product._id}`).emit('activityUpdate', {
        type: 'BID_ACCEPTED',
        productId: bid.product._id,
        bidId: bid._id,
        amount: bid.amount
    });

    res.status(200).json({
        status: 'success',
        data: {
            bid
        }
    });
});

exports.rejectBid = catchAsync(async (req, res, next) => {
    const bid = await Bid.findById(req.params.bidId)
        .populate('product');

    if (!bid) {
        return next(new AppError('Bid not found', 404));
    }

    if (bid.product.seller.toString() !== req.user._id.toString()) {
        return next(new AppError('Unauthorized', 403));
    }

    if (bid.status !== 'active') {
        return next(new AppError('Bid is no longer active', 400));
    }

    bid.status = 'rejected';
    await bid.save();

    // Notify the bidder
    const io = req.app.get('io');
    io.to(`user_${bid.bidder}`).emit('activityUpdate', {
        type: 'BID_REJECTED',
        productId: bid.product._id,
        bidId: bid._id,
        amount: bid.amount
    });

    res.status(200).json({
        status: 'success',
        data: {
            bid
        }
    });
});

exports.getBidAnalytics = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { timeRange = '24h' } = req.query;

    // Verify product ownership
    const product = await Product.findOne({
        _id: productId,
        seller: req.user._id
    });

    if (!product) {
        return next(new AppError('Product not found or unauthorized', 404));
    }

    // Calculate time range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        default: // 24h
            startDate.setDate(now.getDate() - 1);
    }

    // Get bids within time range
    const bids = await Bid.find({
        product: productId,
        createdAt: { $gte: startDate }
    }).sort('createdAt');

    // Calculate analytics
    const uniqueBidders = new Set(bids.map(bid => bid.bidder.toString())).size;
    const totalBids = bids.length;
    const averageBid = totalBids > 0
        ? bids.reduce((sum, bid) => sum + bid.amount, 0) / totalBids
        : 0;
    const highestBid = totalBids > 0
        ? Math.max(...bids.map(bid => bid.amount))
        : 0;

    // Prepare bid history data
    const bidHistory = bids.map(bid => ({
        time: bid.createdAt,
        amount: bid.amount
    }));

    res.status(200).json({
        status: 'success',
        data: {
            totalBids,
            uniqueBidders,
            averageBid,
            highestBid,
            bidHistory
        }
    });
}); 