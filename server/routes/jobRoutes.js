const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const { auth } = require('../middleware/auth');

// Get user's jobs
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Ensure user can only access their own jobs
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Not authorized to view these jobs' });
    }

    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching user jobs:', error);
    res.status(500).json({ message: 'Error fetching jobs' });
  }
});

// Create a new job
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, company, location, salary, type } = req.body;
    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      type,
      postedBy: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Error creating job' });
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

// Update a job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if user owns this job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to edit this lead' });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    );

    res.json(updatedJob);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ message: 'Error updating lead' });
  }
});

module.exports = router;
