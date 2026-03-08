const express = require('express');
const router = express.Router();
const { saveJob, getSavedJobs, removeSavedJob, getUserProfile } = require('../controllers/userController');

// Save a job
router.post('/:userId/jobs/:jobId', saveJob);

// Get saved jobs
router.get('/:userId/jobs', getSavedJobs);

// Remove saved job
router.delete('/:userId/jobs/:jobId', removeSavedJob);

// Get user profile
router.get('/:userId/profile', getUserProfile);

module.exports = router;
