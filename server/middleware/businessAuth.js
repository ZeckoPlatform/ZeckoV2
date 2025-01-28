const auth = require('./auth');

const businessAuth = (req, res, next) => {
    if (req.user.accountType !== 'business') {
        return res.status(403).json({
            status: 'error',
            message: 'Access restricted to business accounts'
        });
    }
    next();
};

module.exports = businessAuth; 