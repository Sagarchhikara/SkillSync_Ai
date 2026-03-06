const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app'); // Assuming this exports the express app without starting the server
const Resume = require('../models/Resume');
const path = require('path');
const fs = require('fs');

jest.mock('../services/fileParserService');
jest.mock('../services/skillExtractionService');
const fileParserService = require('../services/fileParserService');
const skillExtractionService = require('../services/skillExtractionService');

describe('Resume Upload Integration Tests', () => {
    let mongoServer;

    beforeAll(async () => {
        // Start MongoDB memory server
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Disconnect if already connected (e.g., from app.js)
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        await mongoose.connect(mongoUri);

        // ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
             fs.mkdirSync(uploadsDir, { recursive: true });
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    afterEach(async () => {
        // Clear collections after each test
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany();
        }
    });

    describe('POST /api/resume/upload', () => {
        it('should successfully upload and process a valid PDF resume', async () => {
            const testFilePath = path.join(__dirname, '../../../test_resume.pdf');

            // Create a dummy pdf for test if it doesn't exist
            if (!fs.existsSync(testFilePath)) {
                 fs.writeFileSync(testFilePath, 'dummy pdf content - I know Node.js and React');
            }

            fileParserService.parseResumeFile.mockResolvedValue('I am a developer with Node.js and React experience.');
            skillExtractionService.extractSkills.mockReturnValue(['node.js', 'react']);

            const res = await request(app)
                .post('/api/resume/upload')
                .attach('resume', testFilePath); // Attach the file to the 'resume' field

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.resumeId).toBeDefined();
            expect(res.body.skills).toEqual(['node.js', 'react']);

            // Verify it was saved in DB
            const savedResume = await Resume.findById(res.body.resumeId);
            expect(savedResume).toBeDefined();
            expect(savedResume.skills).toContain('node.js');
            expect(savedResume.rawText).toBe('I am a developer with Node.js and React experience.');
        });

        it('should return 400 when no file is provided', async () => {
            const res = await request(app)
                .post('/api/resume/upload');

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('No file uploaded');
        });

        it('should return 400 if parsing throws an error', async () => {
             const testFilePath = path.join(__dirname, '../../../test_resume.pdf');

             if (!fs.existsSync(testFilePath)) {
                 fs.writeFileSync(testFilePath, 'dummy pdf content');
             }

             fileParserService.parseResumeFile.mockRejectedValue(new Error('Corrupted file'));

             const res = await request(app)
                 .post('/api/resume/upload')
                 .attach('resume', testFilePath);

             expect(res.status).toBe(400);
             expect(res.body.success).toBe(false);
             expect(res.body.message).toBe('Corrupted file');
        });
    });
});
