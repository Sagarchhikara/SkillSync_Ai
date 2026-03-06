const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../../uploads/'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST /api/resume/upload
router.post('/upload', upload.single('resume'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Return a mock parsed resume or ID
        return res.status(200).json({
            success: true,
            message: 'Resume uploaded successfully',
            resumeId: 'mock-resume-id-' + Date.now(),
            fileName: req.file.filename
        });
    } catch (error) {
        console.error('Upload Error:', error);
        return res.status(500).json({ success: false, message: 'Server error during upload' });
    }
});

module.exports = router;
