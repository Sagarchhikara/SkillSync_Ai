const express = require('express');
const router = express.Router();
const { getMatchScore, getAutoMatchForUser } = require('../controllers/matchcontrollers');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireSelf, requireResumeOwnership } = require('../middlewares/ownerMiddleware');

// GET /api/match/auto/:userId
// Automatically calculate match percentages between latest user Resume and all Jobs (requires owner verification)
router.get('/auto/:userId', verifyToken, requireSelf, getAutoMatchForUser);

// GET /api/match/:resumeId/:jobId
// Calculate real-time match percentage between a Resume and a Job (requires resume ownership check)
router.get('/:resumeId/:jobId', verifyToken, requireResumeOwnership, getMatchScore);

module.exports = router;
