const express = require('express');
const router = express.Router();

// Basic Mock Auth Controller logic inline or imported
// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    // For now, simple mock auth logic to let frontend connect
    if (email && password) {
        return res.status(200).json({
            success: true,
            token: 'mock-jwt-token-for-' + email,
            user: { email }
        });
    }
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (name && email && password) {
        return res.status(201).json({
            success: true,
            token: 'mock-jwt-token-for-' + email,
            user: { name, email }
        });
    }
    return res.status(400).json({ success: false, message: 'Missing required fields' });
});

module.exports = router;
