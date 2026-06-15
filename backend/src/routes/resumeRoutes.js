const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middlewares/authMiddleware');
const { requireSelf } = require('../middlewares/ownerMiddleware');
const { uploadRateLimiter, validateResumeUpload } = require('../middlewares/uploadValidator');
const resumeController = require('../controllers/resumeController');

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
// Requires JWT verification, upload rate limit, multipart parse, user match validation, and magic number check
router.post('/upload', 
    verifyToken,
    uploadRateLimiter,
    upload.single('resume'),
    requireSelf,
    validateResumeUpload,
    resumeController.uploadResume
);

module.exports = router;
