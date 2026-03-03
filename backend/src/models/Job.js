const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true,
        index: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    requiredSkills: {
        type: [String],
        required: [true, 'Required skills are mandatory'],
        validate: {
            validator: function (v) {
                return v && v.length > 0;
            },
            message: 'requiredSkills must not be empty'
        },
        index: true
    },
    minExperience: {
        type: Number,
        min: 0
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    strict: true
});

// Pre-save hook to normalize requiredSkills
JobSchema.pre('save', function () {
    if (this.requiredSkills && this.requiredSkills.length > 0) {
        // 1. Lowercase and trim all skills
        // 2. Filter out empty strings
        const normalizedSkills = this.requiredSkills
            .map(skill => skill ? skill.toString().toLowerCase().trim() : '')
            .filter(skill => skill !== '');

        // 3. Remove duplicates using Set
        this.requiredSkills = [...new Set(normalizedSkills)];

        // 4. Validate again to ensure it's not empty after trimming
        if (this.requiredSkills.length === 0) {
            throw new Error('requiredSkills must not be empty after validation');
        }
    }
});

// Create index on createdAt
JobSchema.index({ createdAt: -1 });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);

module.exports = Job;
