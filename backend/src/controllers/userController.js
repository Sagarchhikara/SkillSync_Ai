const User = require('../models/User');
const Job = require('../models/Job');

/**
 * @desc    Save a job for a user
 * @route   POST /api/users/:userId/jobs/:jobId
 */
const saveJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ success: false, message: 'Job not found' });
        }

        // Update user
        const updatedSavedJobs = [...user.savedJobs];
        if (!updatedSavedJobs.includes(jobId)) {
            updatedSavedJobs.push(jobId);
            await User.findByIdAndUpdate(userId, { savedJobs: updatedSavedJobs });
        } else {
            return res.status(400).json({ success: false, message: 'Job already saved' });
        }

        return res.status(200).json({ success: true, message: 'Job saved successfully', savedJobs: updatedSavedJobs });
    } catch (error) {
        console.error('Save job error:', error);
        res.status(500).json({ success: false, message: 'Server error saving job', error: error.message });
    }
};

/**
 * @desc    Get user's saved jobs
 * @route   GET /api/users/:userId/jobs
 */
const getSavedJobs = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Fetch jobs individually since Firestore doesn't provide easy populate
        const savedJobs = [];
        for (const jobId of (user.savedJobs || [])) {
            const job = await Job.findById(jobId);
            if (job) savedJobs.push(job);
        }

        return res.status(200).json({ success: true, data: savedJobs });
    } catch (error) {
        console.error('Get saved jobs error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching saved jobs', error: error.message });
    }
};

/**
 * @desc    Remove a saved job for a user
 * @route   DELETE /api/users/:userId/jobs/:jobId
 */
const removeSavedJob = async (req, res) => {
    try {
        const { userId, jobId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updatedSavedJobs = (user.savedJobs || []).filter(id => id.toString() !== jobId);
        await User.findByIdAndUpdate(userId, { savedJobs: updatedSavedJobs });

        return res.status(200).json({ success: true, message: 'Job removed successfully', savedJobs: updatedSavedJobs });
    } catch (error) {
        console.error('Remove saved job error:', error);
        res.status(500).json({ success: false, message: 'Server error removing job', error: error.message });
    }
};

/**
 * @desc    Get user profile data
 * @route   GET /api/users/:userId/profile
 */
const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (user && user.password) {
            delete user.password;
        }
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile', error: error.message });
    }
};

module.exports = {
    saveJob,
    getSavedJobs,
    removeSavedJob,
    getUserProfile
};
