const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/signup
router.post('/signup', signup);

module.exports = router;
