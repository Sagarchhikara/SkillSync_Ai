const request = require('supertest');
const app = require('../../app');
const Job = require('../../models/Job');

const { clearFirestoreDb } = require('../../config/testUtils');

describe('jobController - Unit Tests', () => {
    beforeEach(async () => {
        await clearFirestoreDb();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await clearFirestoreDb();
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
        
        const jobsRes = await request(app).get('/api/jobs');
        expect(jobsRes.body.data.length).toBeGreaterThanOrEqual(5);
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
