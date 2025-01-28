const timeout = require('connect-timeout');

const timeoutMiddleware = (timeoutDuration = 25000) => {
    return [
        timeout(timeoutDuration),
        (req, res, next) => {
            if (!req.timedout) next();
        }
    ];
};

module.exports = timeoutMiddleware; 