const express = require('express');
const router = express.Router();
const Job = require('../../models/jobModel');
const { auth } = require('../../middleware/auth');

// Validation middleware
const validateJob = (req, res, next) => {
    const { 
      title, 
      description, 
      company, 
      location, 
      category,
      subcategory,
      budget,
      deadline,
      requirements 
    } = req.body;

    if (!title || !description || !company || !location || 
        !category || !subcategory || !budget || !deadline || !requirements) {
        return res.status(400).json({ 
            message: 'Missing required fields',
            required: [
              'title', 
              'description', 
              'company', 
              'location',
              'category',
              'subcategory',
              'budget',
              'deadline',
              'requirements'
            ]
        });
    }
    next();
};

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new job
router.post('/', auth, validateJob, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a job
router.put('/:id', auth, validateJob, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or unauthorized' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search jobs
router.get('/search', async (req, res) => {
  try {
    const { category, subcategory, location, type } = req.query;
    const query = {};

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (location) query.location = new RegExp(location, 'i');
    if (type) query.type = type;

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 