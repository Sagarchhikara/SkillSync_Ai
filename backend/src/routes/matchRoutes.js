const express = require('express');
const router = express.Router();
const { getMatchScore, getAutoMatchForUser } = require('../controllers/matchcontrollers');

// GET /api/match/auto/:userId
// Automatically calculate match percentages between latest user Resume and all Jobs
router.get('/auto/:userId', getAutoMatchForUser);

// GET /api/match/:resumeId/:jobId
// Calculate real-time match percentage between a Resume and a Job
router.get('/:resumeId/:jobId', getMatchScore);

module.exports = router;
