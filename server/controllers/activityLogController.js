const ActivityLog = require('../models/ActivityLog');
const { catchAsync } = require('../utils/errorHandlers');

const getUserActivityLog = catchAsync(async (req, res) => {
    const { type, dateRange, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user.id };
    
    if (type && type !== 'all') {
        query.type = type;
    }

    if (dateRange) {
        const now = new Date();
        let startDate = new Date();

        switch (dateRange) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate = null;
        }

        if (startDate) {
            query.timestamp = { $gte: startDate };
        }
    }

    const activities = await ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(query);

    res.status(200).json({
        activities,
        pagination: {
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        }
    });
});

const createActivityLog = catchAsync(async (req, res) => {
    const { type, description, metadata } = req.body;

    const activityLog = await ActivityLog.create({
        userId: req.user.id,
        type,
        description,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata
    });

    res.status(201).json(activityLog);
});

const getActivityLogById = catchAsync(async (req, res) => {
    const activityLog = await ActivityLog.findOne({
        _id: req.params.id,
        userId: req.user.id
    });

    if (!activityLog) {
        return res.status(404).json({ message: 'Activity log not found' });
    }

    res.status(200).json(activityLog);
});

const deleteActivityLog = catchAsync(async (req, res) => {
    const activityLog = await ActivityLog.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
    });

    if (!activityLog) {
        return res.status(404).json({ message: 'Activity log not found' });
    }

    res.status(204).send();
});

module.exports = {
    getUserActivityLog,
    createActivityLog,
    getActivityLogById,
    deleteActivityLog
};