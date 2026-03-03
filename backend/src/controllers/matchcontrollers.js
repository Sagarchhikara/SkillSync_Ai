const Resume = require('../models/Resume');
const Job = require('../models/Job');
const { calculateMatch } = require('../services/matchService');

/**
 * GET /api/match/:resumeId/:jobId
 * Calculates the match percentage and skills delta between a resume and a job.
 */
const getMatchScore = async (req, res) => {
    try {
        const { resumeId, jobId } = req.params;

        // 1. Fetch Resume from DB
        const resume = await Resume.findById(resumeId);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        // 2. Fetch Job from DB
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // 3. Call matchService (Pure Logic)
        const matchResult = calculateMatch(resume.skills, job.requiredSkills);

        // 4. Return result
        return res.status(200).json({
            success: true,
            data: matchResult
        });

    } catch (error) {
        console.error('Match Service Error:', error);

        // Handle Invalid ObjectId Errors
        if (error.kind === 'ObjectId') {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID format provided'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error while calculating match score',
            error: error.message
        });
    }
};

module.exports = {
    getMatchScore
};
