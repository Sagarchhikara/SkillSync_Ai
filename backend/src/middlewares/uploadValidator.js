const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Magic numbers (headers) for supported formats:
// PDF starts with %PDF (hex: 25 50 44 46)
// DOCX starts with PK\x03\x04 (hex: 50 4b 03 04)
const MAGIC_NUMBERS = {
    pdf: Buffer.from([0x25, 0x50, 0x44, 0x46]),
    docx: Buffer.from([0x50, 0x4b, 0x03, 0x04])
};

/**
 * Specific rate limiting for file uploads to prevent resource exhaustion attacks.
 */
const uploadRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 uploads per windowMs
    message: {
        success: false,
        message: 'Too many file upload requests. Please try again after 15 minutes.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Validates uploaded resume file properties, content signatures, and structures.
 */
const validateResumeUpload = (req, res, next) => {
    // 1. Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded or file rejected by upload filter.'
        });
    }

    const { originalname, path: filePath, size } = req.file;

    // Helper to delete invalid files and return error
    const rejectFile = (msg) => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Safely remove file from local disk
            }
        } catch (unlinkErr) {
            console.error('Error deleting invalid upload:', unlinkErr.message);
        }
        return res.status(400).json({
            success: false,
            message: msg
        });
    };

    // 2. Validate double extension attack protection
    // Rejects files like resume.pdf.exe or resume.exe.pdf
    const dotsCount = (originalname.match(/\./g) || []).length;
    if (dotsCount > 1) {
        return rejectFile('Upload rejected. Multiple extensions or double extensions are not allowed.');
    }

    // 3. Validate file extension
    const ext = path.extname(originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
        return rejectFile('Unsupported file extension. Only .pdf and .docx files are permitted.');
    }

    // 4. Validate file size limit (5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (size > MAX_SIZE) {
        return rejectFile('File size limit exceeded. Maximum file size is 5MB.');
    }

    // 5. Validate file signatures (Magic Numbers)
    try {
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(4);
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);

        const isPdf = buffer.equals(MAGIC_NUMBERS.pdf);
        // DOCX is a ZIP container starting with PK\x03\x04
        const isDocx = buffer.equals(MAGIC_NUMBERS.docx);

        if (ext === '.pdf' && !isPdf) {
            return rejectFile('Security warning: File content signature does not match PDF format.');
        }

        if (ext === '.docx' && !isDocx) {
            return rejectFile('Security warning: File content signature does not match Word DOCX format.');
        }
    } catch (err) {
        console.error('File signature validation error:', err);
        return rejectFile('Failed to process and validate file signature.');
    }

    // 6. Filename Sanitization (prevent path traversal or injection)
    // Replace any non-alphanumeric, dot, dash, or underscore characters
    const safeName = path.basename(originalname)
        .replace(/[^a-zA-Z0-9.\-_]/g, '_');
    req.file.sanitizedName = safeName;

    return next();
};

module.exports = {
    uploadRateLimiter,
    validateResumeUpload
};
