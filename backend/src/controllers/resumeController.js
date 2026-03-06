const Resume = require('../models/Resume');
const { parseResumeFile } = require('../services/fileParserService');
const { extractSkills } = require('../services/skillExtractionService');

/**
 * Handles uploading a resume, parsing it, extracting skills, and saving to database.
 */
const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const filePath = req.file.path;
        const originalName = req.file.originalname;

        // 1. Extract raw text
        let rawText;
        try {
            rawText = await parseResumeFile(filePath);
        } catch (error) {
            console.error('File parsing error:', error);
            return res.status(400).json({
                success: false,
                message: error.message || 'Failed to parse file'
            });
        }

        if (!rawText || rawText.trim() === '') {
            return res.status(400).json({ success: false, message: 'No readable text found in resume' });
        }

        // 2. Extract skills
        const skills = extractSkills(rawText);

        if (!skills || skills.length === 0) {
            return res.status(400).json({ success: false, message: 'No skills extracted from resume' });
        }

        // 3. Save resume data to MongoDB
        const resume = await Resume.create({
            filename: originalName,
            filepath: filePath,
            rawText: rawText,
            skills: skills
        });

        // 4. Return response to frontend
        return res.status(200).json({
            success: true,
            data: resume
        });
    } catch (error) {
        console.error('Resume upload/process error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload' });
    }
};

module.exports = {
    uploadResume
};
