const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const auth = require('../middleware/auth');

// Post a new job
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, company, location, salary } = req.body;
    const newJob = new Job({
      title,
      description,
      company,
      location,
      salary,
      postedBy: req.user.id
    });
    const savedJob = await newJob.save();
    res.json(savedJob);
  } catch (error) {
    res.status(500).json({ message: 'Error posting job', error: error.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching jobs', error: error.message });
  }
});

// Search jobs
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const jobs = await Job.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { location: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error searching jobs', error: error.message });
  }
});

module.exports = router;
