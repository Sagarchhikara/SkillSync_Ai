const express = require('express');
const router = express.Router();
const { getMatchScore } = require('../controllers/matchcontrollers');

// GET /api/match/:resumeId/:jobId
// Calculate real-time match percentage between a Resume and a Job
router.get('/:resumeId/:jobId', getMatchScore);

module.exports = router;
