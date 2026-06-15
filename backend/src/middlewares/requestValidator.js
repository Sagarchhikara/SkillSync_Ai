/**
 * Middleware functions to validate incoming request payloads.
 */

const validateSignup = (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ success: false, message: 'Name is required and must be a valid string.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: 'Invalid or missing email address.' });
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password is required and must be at least 6 characters long.' });
    }

    if (role && !['applicant', 'recruiter', 'admin'].includes(role)) {
        return res.status(400).json({ success: false, message: 'Role must be one of: applicant, recruiter, admin.' });
    }

    return next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Both email and password are required.' });
    }

    return next();
};

const validateJob = (req, res, next) => {
    const { title, company, requiredSkills } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ success: false, message: 'Job title is required and must be a valid string.' });
    }

    if (!company || typeof company !== 'string' || company.trim() === '') {
        return res.status(400).json({ success: false, message: 'Company name is required and must be a valid string.' });
    }

    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        return res.status(400).json({ success: false, message: 'Job must specify an array of requiredSkills containing at least one item.' });
    }

    return next();
};

module.exports = {
    validateSignup,
    validateLogin,
    validateJob
};
