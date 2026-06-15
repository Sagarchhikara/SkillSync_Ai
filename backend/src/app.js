const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middlewares/errorHandler');

// Import routes
const matchRoutes = require('./routes/matchRoutes');
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. Secure HTTP Headers using Helmet
app.use(helmet());

// 2. Strict CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

// 3. Global Request Parsing
app.use(express.json());

// 4. Rate Limiting (skipped during test/perf runs to prevent disruption)
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing';
if (!isTestEnv) {
    const globalLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 300, // Limit each IP to 300 requests per windowMs
        message: {
            success: false,
            message: 'Too many requests from this IP. Please try again after 15 minutes.'
        },
        standardHeaders: true,
        legacyHeaders: false
    });
    app.use(globalLimiter);
}

// 5. Routes mapping
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running and secure' });
});

// 6. Global Centralized Error Handler (must be registered last)
app.use(errorHandler);

module.exports = app;
