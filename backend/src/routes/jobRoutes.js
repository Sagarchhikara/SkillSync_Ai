const express = require('express');
const router = express.Router();
const { createJob, getAllJobs, seedDummyJobs } = require('../controllers/jobController');

// @route   POST /api/jobs
// @desc    Create a new job
router.post('/', createJob);

// @route   GET /api/jobs
// @desc    Get all jobs
router.get('/', getAllJobs);

// @route   POST /api/jobs/seed
// @desc    Seed backend with dummy jobs (clears existing)
router.post('/seed', seedDummyJobs);

module.exports = router;
