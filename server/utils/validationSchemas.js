const { check } = require('express-validator');

const authValidation = {
    register: [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
        check('username', 'Username is required').not().isEmpty()
    ],
    login: [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ]
};

const profileValidation = {
    updateProfile: [
        check('email', 'Please include a valid email').optional().isEmail(),
        check('phone', 'Please include a valid phone number').optional().isMobilePhone(),
        check('website', 'Please include a valid URL').optional().isURL()
    ],
    updateAddress: [
        check('street', 'Street is required').not().isEmpty(),
        check('city', 'City is required').not().isEmpty(),
        check('state', 'State is required').not().isEmpty(),
        check('zipCode', 'Zip code is required').not().isEmpty()
    ]
};

module.exports = {
    authValidation,
    profileValidation
}; 