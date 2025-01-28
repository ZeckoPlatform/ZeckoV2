const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: String,
    siteDescription: String,
    contactEmail: String,
    socialLinks: {
        facebook: String,
        twitter: String,
        instagram: String
    },
    updatedAt: { type: Date, default: Date.now }
});

const faqSchema = new mongoose.Schema({
    question: String,
    answer: String,
    category: String,
    order: Number,
    updatedAt: { type: Date, default: Date.now }
});

const termsSchema = new mongoose.Schema({
    content: String,
    version: String,
    effectiveDate: Date,
    createdAt: { type: Date, default: Date.now }
});

const privacySchema = new mongoose.Schema({
    content: String,
    version: String,
    effectiveDate: Date,
    createdAt: { type: Date, default: Date.now }
});

const Settings = mongoose.model('Settings', settingsSchema);
const FAQ = mongoose.model('FAQ', faqSchema);
const Terms = mongoose.model('Terms', termsSchema);
const Privacy = mongoose.model('Privacy', privacySchema);

module.exports = {
    Settings,
    FAQ,
    Terms,
    Privacy
}; 