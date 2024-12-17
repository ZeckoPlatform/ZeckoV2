const validateRequest = (data, rules) => {
    const errors = {};

    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        const ruleArray = rule.split('|');

        for (const singleRule of ruleArray) {
            if (singleRule === 'required' && !value) {
                errors[field] = `${field} is required`;
            }
            if (singleRule === 'string' && value && typeof value !== 'string') {
                errors[field] = `${field} must be a string`;
            }
            if (singleRule === 'number' && value && typeof value !== 'number') {
                errors[field] = `${field} must be a number`;
            }
            if (singleRule === 'array' && value && !Array.isArray(value)) {
                errors[field] = `${field} must be an array`;
            }
            if (singleRule === 'mongoId' && value && !(/^[0-9a-fA-F]{24}$/).test(value)) {
                errors[field] = `${field} must be a valid MongoDB ID`;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

module.exports = {
    validateRequest
}; 