const request = require('supertest');
const app = require('../../app');
const Job = require('../../models/Job');

// Mock Firebase config
let mockData = {};
jest.mock('../../config/firebase', () => {
    return {
        db: {
            collection: jest.fn().mockImplementation((name) => ({
                add: jest.fn().mockImplementation((d) => {
                    const id = 'mock-' + Math.random().toString(36).substr(2, 9);
                    mockData[id] = d;
                    return Promise.resolve({ id });
                }),
                doc: jest.fn().mockImplementation((id) => ({
                    get: jest.fn().mockResolvedValue({
                        exists: !!mockData[id],
                        id: id,
                        data: () => mockData[id] || {}
                    }),
                    update: jest.fn().mockImplementation((update) => {
                        mockData[id] = { ...mockData[id], ...update };
                        return Promise.resolve();
                    })
                })),
                get: jest.fn().mockImplementation(() => Promise.resolve({
                    docs: Object.keys(mockData).map(id => ({
                        id,
                        data: () => mockData[id]
                    }))
                }))
            }))
        },
        admin: {
            credential: { cert: jest.fn() },
            initializeApp: jest.fn()
        }
    };
});

describe('jobController - Unit Tests', () => {
    beforeEach(() => {
        mockData = {}; // Clear mock data before each test
        jest.clearAllMocks();
    });

    it('should create a job successfully', async () => {
        const jobData = {
            title: 'Test Job',
            company: 'Test Company',
            requiredSkills: ['react', 'node'],
            minExperience: 2,
            description: 'A test job description.'
        };

        const res = await request(app)
            .post('/api/jobs')
            .send(jobData);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.title).toBe(jobData.title);

        const jobInDb = await Job.findById(res.body.data._id);
        expect(jobInDb).toBeDefined();
        expect(jobInDb.requiredSkills).toEqual(expect.arrayContaining(jobData.requiredSkills));
    });

    it('should fail to create a job without required fields', async () => {
        const res = await request(app)
            .post('/api/jobs')
            .send({ title: 'Test Job' }); // Missing company and requiredSkills

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should seed dummy jobs successfully', async () => {
        const res = await request(app)
            .post('/api/jobs/seed');

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.count).toBe(5);
        // Note: find() in our mock returns what we added
    });

    it('should get all jobs successfully', async () => {
        await Job.create({ title: 'Job 1', company: '1', requiredSkills: ['a'] });
        await Job.create({ title: 'Job 2', company: '2', requiredSkills: ['b'] });

        const res = await request(app)
            .get('/api/jobs');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.length).toBe(2);
    });
});
