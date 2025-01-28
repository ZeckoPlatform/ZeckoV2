const ServiceRequest = require('../models/serviceRequestModel');
const User = require('../models/userModel');
const { validateRequest } = require('../utils/validator');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createRequest = async (req, res) => {
    try {
        const { error } = validateRequest(req.body, {
            category: 'required|mongoId',
            title: 'required|string',
            description: 'required|string',
            location: 'required|object',
            'location.postcode': 'required|string'
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const serviceRequest = new ServiceRequest({
            ...req.body,
            client: req.user.id
        });

        await serviceRequest.save();

        // Update user's serviceRequests array
        await User.findByIdAndUpdate(req.user.id, {
            $push: { 
                serviceRequests: {
                    request: serviceRequest._id,
                    status: 'new'
                }
            }
        });

        res.status(201).json(serviceRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const { status, category } = req.query;
        const query = { status: status || 'active' };
        
        if (category) {
            query.category = category;
        }

        const requests = await ServiceRequest.find(query)
            .populate('category', 'name')
            .populate('client', 'username profile.avatar')
            .sort('-createdAt');

        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.submitQuote = async (req, res) => {
    try {
        const { amount, message } = req.body;
        const requestId = req.params.id;

        const serviceRequest = await ServiceRequest.findById(requestId);
        if (!serviceRequest) {
            return res.status(404).json({ error: 'Service request not found' });
        }

        // Check if provider already submitted a quote
        const existingQuote = serviceRequest.quotes.find(
            quote => quote.provider.toString() === req.user.id
        );

        if (existingQuote) {
            return res.status(400).json({ error: 'Quote already submitted' });
        }

        serviceRequest.quotes.push({
            provider: req.user.id,
            amount,
            message
        });

        serviceRequest.quoteCount += 1;
        await serviceRequest.save();

        res.json(serviceRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createServiceRequest = catchAsync(async (req, res, next) => {
    const serviceRequest = await ServiceRequest.create({
        ...req.body,
        client: req.user.id
    });

    res.status(201).json({
        status: 'success',
        data: {
            serviceRequest
        }
    });
});

exports.getAllServiceRequests = catchAsync(async (req, res, next) => {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering
    let query = ServiceRequest.find(queryObj);

    // Sorting
    if (req.query.sort) {
        query = query.sort(req.query.sort);
    }

    // Field limiting
    if (req.query.fields) {
        const fields = req.query.fields.split(',').join(' ');
        query = query.select(fields);
    }

    // Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute query
    const serviceRequests = await query;

    res.status(200).json({
        status: 'success',
        results: serviceRequests.length,
        data: {
            serviceRequests
        }
    });
});

exports.getServiceRequest = catchAsync(async (req, res, next) => {
    const serviceRequest = await ServiceRequest.findById(req.params.id);

    if (!serviceRequest) {
        return next(new AppError('No service request found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            serviceRequest
        }
    });
});

exports.updateServiceRequest = catchAsync(async (req, res, next) => {
    const serviceRequest = await ServiceRequest.findOneAndUpdate(
        { 
            _id: req.params.id,
            client: req.user.id
        },
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!serviceRequest) {
        return next(new AppError('No service request found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            serviceRequest
        }
    });
});

exports.deleteServiceRequest = catchAsync(async (req, res, next) => {
    const serviceRequest = await ServiceRequest.findOneAndDelete({
        _id: req.params.id,
        client: req.user.id
    });

    if (!serviceRequest) {
        return next(new AppError('No service request found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}); 