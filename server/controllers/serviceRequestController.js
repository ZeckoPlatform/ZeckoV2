const ServiceRequest = require('../models/serviceRequestModel');
const User = require('../models/userModel');
const { validateRequest } = require('../utils/validator');

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