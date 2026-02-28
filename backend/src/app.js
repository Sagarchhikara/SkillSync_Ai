const express = require('express');
const cors = require('cors');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from frontend
    credentials: true
}));

// Setup Routes (Placeholder - routes will be registered here)
app.get('/api/health', (req, res) => {
    res.json({ status: "SkillSync API running" });
});

// Temporary Route to test Resume Model (Phase 2)
app.post('/api/test-resume', async (req, res) => {
    try {
        const Resume = require('./models/Resume');
        const { userId, skills, rawText, experienceYears, education } = req.body;

        const newResume = new Resume({
            userId,
            skills,
            rawText,
            experienceYears,
            education
        });

        const savedResume = await newResume.save();
        res.status(201).json({
            success: true,
            message: 'Resume saved successfully',
            data: savedResume
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error saving resume',
            error: error.message,
            details: error
        });
    }
});

// Export the app
module.exports = app;
