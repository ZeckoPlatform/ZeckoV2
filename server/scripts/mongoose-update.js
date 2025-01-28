const mongoose = require('mongoose');

// Set these options to avoid deprecation warnings
mongoose.set('strictQuery', true);

// Update any deprecated Mongoose syntax
const updateConfig = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

module.exports = { mongoose, updateConfig }; 