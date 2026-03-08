const request = require('supertest');
const app = require('../app'); 
const Resume = require('../models/Resume');
const path = require('path');
const fs = require('fs');

// Mock Firebase config
jest.mock('../config/firebase', () => {
    const mockDoc = (id, data) => ({
        exists: !!data,
        id: id,
        data: () => data,
        get: jest.fn().mockResolvedValue({
            exists: !!data,
            id: id,
            data: () => data
        })
    });

    const mockCollection = (data) => ({
        add: jest.fn().mockImplementation((d) => Promise.resolve({ id: 'mock-id' })),
        doc: jest.fn().mockImplementation((id) => ({
            get: jest.fn().mockResolvedValue({
                exists: true,
                id: id,
                data: () => data[id] || {}
            }),
            update: jest.fn().mockResolvedValue({})
        })),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            empty: false,
            docs: [{ id: 'mock-id', data: () => ({ skills: ['node.js', 'react'], rawText: 'mock text' }) }]
        })
    });

    return {
        db: {
            collection: jest.fn().mockImplementation((name) => mockCollection({}))
        },
        admin: {
            credential: {
                cert: jest.fn()
            },
            initializeApp: jest.fn()
        }
    };
});

jest.mock('../services/fileParserService');
jest.mock('../services/skillExtractionService');
const fileParserService = require('../services/fileParserService');
const skillExtractionService = require('../services/skillExtractionService');

describe('Resume Upload Integration Tests', () => {
    beforeAll(async () => {
        // ensure uploads directory exists
        const uploadsDir = path.join(__dirname, '../../../uploads');
        if (!fs.existsSync(uploadsDir)) {
             fs.mkdirSync(uploadsDir, { recursive: true });
        }
    });

    afterAll(async () => {
        // Clean up
    });

    afterEach(async () => {
        jest.clearAllMocks();
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
            expect(res.body.data).toBeDefined();
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.skills).toEqual(['node.js', 'react']);

            // Verify it was saved in DB
            const savedResume = await Resume.findById(res.body.data._id);
            expect(savedResume).toBeDefined();
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
