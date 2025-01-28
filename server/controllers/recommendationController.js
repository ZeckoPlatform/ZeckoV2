const recommendationService = require('../services/recommendationService');
const catchAsync = require('../utils/catchAsync');

exports.getRecommendations = catchAsync(async (req, res, next) => {
    const recommendations = await recommendationService.getRecommendations(req.user._id);

    res.status(200).json({
        status: 'success',
        data: {
            recommendations
        }
    });
}); 