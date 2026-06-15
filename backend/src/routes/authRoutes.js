const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/requestValidator');

// POST /api/auth/login
router.post('/login', validateLogin, login);

// POST /api/auth/signup
router.post('/signup', validateSignup, signup);

module.exports = router;
