const express = require('express');
const router = express.Router();
const Job = require('../../models/jobModel');
const { auth } = require('../../middleware/auth');
const cache = require('memory-cache');

// Timeout middleware
const timeoutMiddleware = (req, res, next) => {
  req.setTimeout(5000, () => {
    res.status(503).send('Request timeout');
  });
  next();
};

// Get featured jobs with caching
router.get('/featured', timeoutMiddleware, async (req, res) => {
  try {
    // Check cache first
    const cachedJobs = cache.get('featured_jobs');
    if (cachedJobs) {
      return res.json(cachedJobs);
    }

    const jobs = await Job.find({ featured: true })
      .select('title description company location salary type createdAt postedBy')
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('postedBy', 'username')
      .lean()
      .exec();

    // Cache for 5 minutes
    cache.put('featured_jobs', jobs, 5 * 60 * 1000);
    
    res.json(jobs);
  } catch (error) {
    console.error('Featured jobs error:', error);
    res.status(500).json({ message: 'Error fetching featured jobs' });
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
router.post('/', auth, timeoutMiddleware, async (req, res) => {
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

module.exports = router;
