const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'fallback_secret_for_dev',
        { expiresIn: '24h' }
    );
};

/**
 * @desc    Register a new user with secure password hashing
 * @route   POST /api/auth/signup
 */
const signup = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password before saving to Firestore
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'applicant'
        });

        // Generate cryptographically signed token
        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            token: token,
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                savedJobs: newUser.savedJobs,
                skills: newUser.skills,
                education: newUser.education
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ success: false, message: 'Server error during signup', error: error.message });
    }
};

/**
 * @desc    Authenticate user, migrate legacy password to hash if needed, & return JWT token
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        let isMatch = false;
        // Check if password in database is already hashed (bcrypt hashes start with $2a$ or $2b$)
        const isHashed = user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'));

        if (isHashed) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Legacy plaintext matching
            isMatch = user.password === password;
            // Automatically upgrade password to hash upon successful login
            if (isMatch) {
                console.log(`Migrating plaintext password for user: ${email} to secure hash...`);
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                await User.findByIdAndUpdate(user._id, { password: hashedPassword });
            }
        }

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                savedJobs: user.savedJobs,
                skills: user.skills,
                education: user.education
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
    }
};

module.exports = {
    signup,
    login
};
