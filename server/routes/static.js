const express = require('express');
const router = express.Router();
const cache = require('../middleware/cache');

// Cache settings for 1 hour
router.get('/settings', cache(3600), async (req, res) => {
    try {
        const settings = await Settings.find();
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cache FAQ for 24 hours
router.get('/faq', cache(86400), async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cache terms for 24 hours
router.get('/terms', cache(86400), async (req, res) => {
    try {
        const terms = await Terms.findOne().sort({ createdAt: -1 });
        res.json(terms);
    } catch (error) {
        console.error('Error fetching terms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Cache privacy policy for 24 hours
router.get('/privacy', cache(86400), async (req, res) => {
    try {
        const privacy = await Privacy.findOne().sort({ createdAt: -1 });
        res.json(privacy);
    } catch (error) {
        console.error('Error fetching privacy policy:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 