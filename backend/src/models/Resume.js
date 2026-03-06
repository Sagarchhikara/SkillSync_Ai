const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: [true, 'Original filename is required']
        },
        filepath: {
            type: String,
            required: [true, 'Filepath is required']
        },
        rawText: {
            type: String,
            required: [true, 'Raw resume text is required for future NLP processing'],
            trim: true
        },
        skills: {
            type: [String],
            required: [true, 'Extracted skills are required'],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'A resume must contain at least one extracted skill'
            },
            set: function (skillsArr) {
                // Deduplicate and lowercase before saving using strict logic
                if (!Array.isArray(skillsArr)) return skillsArr;
                return [...new Set(skillsArr.map(s => s.toLowerCase().trim()))];
            }
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        // Optional future fields
        userId: {
            type: String, // String for flexibility (could be ObjectId ref later)
            required: false
        },
        MatchScores: {
            type: [Number],
            required: false
        },
        analysisResults: {
            type: mongoose.Schema.Types.Mixed,
            required: false
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        strict: true // Enforce strict mode
    }
);

// Explicitly define Indexes
resumeSchema.index({ skills: 1 }); // For fast array matching query
resumeSchema.index({ createdAt: -1 }); // For sorting recent resumes

module.exports = mongoose.model('Resume', resumeSchema);
