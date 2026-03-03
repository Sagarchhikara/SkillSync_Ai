const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true
        },
        company: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true
        },
        description: {
            type: String,
            required: [true, 'Job description is required']
        },
        requiredSkills: {
            type: [String],
            required: [true, 'Required skills are essential for matching'],
            validate: {
                validator: function (v) {
                    return v && v.length > 0;
                },
                message: 'A job must have at least one required skill'
            },
            set: function (skillsArr) {
                // Deduplicate and lowercase before saving
                if (!Array.isArray(skillsArr)) return skillsArr;
                return [...new Set(skillsArr.map(s => s.toLowerCase().trim()))];
            }
        },
        experienceLevel: {
            type: String,
            enum: ['Trainee', 'Junior', 'Mid', 'Senior', 'Lead'],
            default: 'Junior'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        strict: true
    }
);

jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
