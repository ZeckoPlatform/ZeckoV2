const auth = require('./auth');

const vendorAuth = (req, res, next) => {
    if (req.user.accountType !== 'vendor') {
        return res.status(403).json({
            status: 'error',
            message: 'Access restricted to vendor accounts'
        });
    }
    next();
};

module.exports = vendorAuth; 