const express = require('express');
const router = express.Router();
const { saveJob, getSavedJobs, removeSavedJob, getUserProfile } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireSelf } = require('../middlewares/ownerMiddleware');

// Save a job (requires authentication and matching userId)
router.post('/:userId/jobs/:jobId', verifyToken, requireSelf, saveJob);

// Get saved jobs (requires authentication and matching userId)
router.get('/:userId/jobs', verifyToken, requireSelf, getSavedJobs);

// Remove saved job (requires authentication and matching userId)
router.delete('/:userId/jobs/:jobId', verifyToken, requireSelf, removeSavedJob);

// Get user profile (requires authentication and matching userId)
router.get('/:userId/profile', verifyToken, requireSelf, getUserProfile);

module.exports = router;
