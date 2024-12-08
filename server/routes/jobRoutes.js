const express = require('express');
const router = express.Router();
const Job = require('../models/jobModel');
const { auth } = require('../middleware/auth');
const cache = require('memory-cache');

// Add error handling for model import
if (!Job) {
    console.error('Job model not found');
    throw new Error('Job model not found');
}

// Add validation middleware
const validateJob = (req, res, next) => {
    const { title, description, company, location } = req.body;
    if (!title || !description || !company || !location) {
        return res.status(400).json({ 
            message: 'Missing required fields',
            required: ['title', 'description', 'company', 'location']
        });
    }
    next();
};

// Timeout middleware with error handling
const timeoutMiddleware = (req, res, next) => {
    const timeout = setTimeout(() => {
        clearTimeout(timeout);
        res.status(503).json({ 
            message: 'Request timeout',
            code: 'TIMEOUT_ERROR'
        });
    }, 20000);

    req.on('end', () => clearTimeout(timeout));
    next();
};

// Add request timeout handling
const requestTimeout = 25000; // 25 seconds

// Get featured jobs with caching
router.get('/featured', async (req, res) => {
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), requestTimeout)
    );

    try {
        const result = await Promise.race([
            Job.find({ featured: true }).exec(),
            timeoutPromise
        ]);
        res.json(result);
    } catch (error) {
        console.error('Featured jobs error:', error);
        res.status(error.message === 'Request timeout' ? 503 : 500)
           .json({ message: error.message });
    }
});

// Get user's jobs with caching
router.get('/user/:userId', auth, timeoutMiddleware, async (req, res) => {
  try {
    const cacheKey = `user_jobs_${req.params.userId}`;
    const cachedJobs = cache.get(cacheKey);
    
    if (cachedJobs) {
      return res.json(cachedJobs);
    }

    const jobs = await Job.find({ postedBy: req.params.userId })
      .select('title description company location salary type createdAt postedBy')
      .sort({ createdAt: -1 })
      .populate('postedBy', 'username')
      .lean()
      .exec();

    cache.put(cacheKey, jobs, 2 * 60 * 1000); // Cache for 2 minutes
    res.json(jobs);
  } catch (error) {
    console.error('User jobs error:', error);
    res.status(500).json({ message: 'Error fetching user jobs' });
  }
});

// Create new job
router.post('/', auth, timeoutMiddleware, validateJob, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.id
    });
    await job.save();

    // Clear relevant caches
    cache.del('featured_jobs');
    cache.del(`user_jobs_${req.user.id}`);

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Update job
router.put('/:id', auth, timeoutMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true }
    ).exec();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Clear relevant caches
    cache.del('featured_jobs');
    cache.del(`user_jobs_${req.user.id}`);

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete job
router.delete('/:id', auth, timeoutMiddleware, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    }).exec();

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Clear relevant caches
    cache.del('featured_jobs');
    cache.del(`user_jobs_${req.user.id}`);

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Error deleting job' });
  }
});

// Add global error handler for this router
router.use((error, req, res, next) => {
    console.error('Job routes error:', error);
    res.status(500).json({
        message: 'An error occurred in job routes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

module.exports = router;
