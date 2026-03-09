const Resume = require('../models/Resume');
const Job = require('../models/Job');
const User = require('../models/User');
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
        const matchResult = await calculateMatch(resume.skills, job.requiredSkills);

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

/**
 * GET /api/match/auto/:userId
 * Automatically ranks all jobs for a user based on their latest uploaded resume.
 */
const getAutoMatchForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        let resumeQuery = {};
        if (userId && userId !== "testuser123") {
            const user = await User.findById(userId);
            if (user && user.recentResumeId) {
                 resumeQuery = { _id: user.recentResumeId };
            } else {
                 resumeQuery = { userId };
            }
        }
        
        // Find most recent resume
        const latestResume = await Resume.findOne(resumeQuery, { sort: { createdAt: -1 } });

        if (!latestResume) {
            return res.status(404).json({
                success: false,
                message: 'No resume found. Please upload a resume first to see job matches.'
            });
        }

        // 2. Fetch all Jobs
        const allJobs = await Job.find();

        if (!allJobs || allJobs.length === 0) {
            return res.status(200).json({
                success: true,
                data: [],
                message: 'No jobs available to match against.'
            });
        }

        // 3. Calculate match score for every job against this resume
        const rankedJobs = await Promise.all(allJobs.map(async job => {
            const matchResult = await calculateMatch(latestResume.skills, job.requiredSkills);
            return {
                job: {
                    _id: job._id,
                    title: job.title,
                    company: job.company,
                    minExperience: job.minExperience
                },
                matchDetails: matchResult
            };
        }));

        // 4. Sort descending by highest match score
        rankedJobs.sort((a, b) => b.matchDetails.matchPercentage - a.matchDetails.matchPercentage);

        // 5. Return result
        return res.status(200).json({
            success: true,
            resumeUsed: latestResume._id,
            data: rankedJobs
        });

    } catch (error) {
        console.error('Auto Match Service Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while calculating auto match scores',
            error: error.message
        });
    }
};

module.exports = {
    getMatchScore,
    getAutoMatchForUser
};
