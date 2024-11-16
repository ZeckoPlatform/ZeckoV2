const express = require('express');
const router = express.Router();
const Job = require('../../models/jobModel');
const { auth } = require('../../middleware/auth');

// Get featured jobs
router.get('/featured', async (req, res) => {
  try {
    const jobs = await Job.find({ featured: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('postedBy', 'username')
      .lean();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured jobs' });
  }
});

// Get user's jobs
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('postedBy', 'username');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user jobs' });
  }
});

// Create new job
router.post('/', auth, async (req, res) => {
  try {
    const job = new Job({
      ...req.body,
      postedBy: req.user.id
    });
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error creating job' });
  }
});

// Update job
router.put('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user.id },
      req.body,
      { new: true }
    );
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Error updating job' });
  }
});

// Delete job
router.delete('/:id', auth, async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.user.id
    });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting job' });
  }
});

module.exports = router;
