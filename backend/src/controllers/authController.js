const User = require('../models/User');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const newUser = await User.create({
            name,
            email,
            password // In a production app, we would hash this password first!
        });

        res.status(201).json({
            success: true,
            token: 'mock-jwt-token-for-' + newUser._id, // Replace with real JWT if implementing full auth
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                savedJobs: newUser.savedJobs,
                skills: newUser.skills,
                education: newUser.education
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, message: 'Server error during signup', error: error.message });
    }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });

        // Simple mock match since password hashing is omitted
        if (user && user.password === password) {
            return res.status(200).json({
                success: true,
                token: 'mock-jwt-token-for-' + user._id,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    savedJobs: user.savedJobs,
                    skills: user.skills,
                    education: user.education
                }
            });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

module.exports = {
    signup,
    login
};
