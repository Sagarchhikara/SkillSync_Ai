const Job = require('../models/Job');

/**
 * @desc    Create a new job
 * @route   POST /api/jobs
 * @access  Public (for now, based on current auth requirement)
 */
const createJob = async (req, res) => {
    try {
        const { title, company, requiredSkills, minExperience, description } = req.body;

        if (!title || !company || !requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, company, and an array of requiredSkills'
            });
        }

        const job = await Job.create({
            title,
            company,
            requiredSkills,
            minExperience: minExperience || 0,
            description: description || ''
        });

        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error creating job'
        });
    }
};

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Public
 */
const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching jobs'
        });
    }
};

/**
 * @desc    Seed database with dummy jobs
 * @route   POST /api/jobs/seed
 * @access  Public
 */
const seedDummyJobs = async (req, res) => {
    try {
        // Clear existing jobs
        await Job.deleteMany();

        const dummyJobs = [
            {
                title: 'Senior Frontend Developer',
                company: 'Tech Innovators Inc.',
                requiredSkills: ['react', 'typescript', 'javascript', 'css', 'html', 'git'],
                minExperience: 5,
                description: 'We are looking for an experienced Frontend Developer to lead our UI team.'
            },
            {
                title: 'Backend Engineer',
                company: 'DataFlow Systems',
                requiredSkills: ['node.js', 'express', 'mongodb', 'api design', 'python'],
                minExperience: 3,
                description: 'Join our backend team to build scalable microservices and APIs.'
            },
            {
                title: 'Full Stack Web Developer',
                company: 'StartupX',
                requiredSkills: ['javascript', 'react', 'node.js', 'mongodb', 'aws', 'docker'],
                minExperience: 2,
                description: 'A dynamic role requiring end-to-end development of our core product.'
            },
            {
                title: 'Data Scientist',
                company: 'AI Solutions Ltd',
                requiredSkills: ['python', 'machine learning', 'sql', 'pandas', 'tensorflow'],
                minExperience: 4,
                description: 'Seeking a Data Scientist to build predictive models and analyze complex datasets.'
            },
            {
                title: 'DevOps Engineer',
                company: 'Cloud Native Corp',
                requiredSkills: ['linux', 'docker', 'kubernetes', 'aws', 'ci/cd', 'terraform'],
                minExperience: 3,
                description: 'Help us automate and scale our cloud infrastructure.'
            }
        ];

        const createdJobs = await Job.create(dummyJobs);

        res.status(201).json({
            success: true,
            count: createdJobs.length,
            message: 'Dummy jobs seeded successfully',
            data: createdJobs
        });
    } catch (error) {
        console.error('Error seeding dummy jobs:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error seeding jobs'
        });
    }
};

module.exports = {
    createJob,
    getAllJobs,
    seedDummyJobs
};
