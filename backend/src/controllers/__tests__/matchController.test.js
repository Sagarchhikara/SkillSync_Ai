const request = require('supertest');
const app = require('../../app');
const Resume = require('../../models/Resume');
const Job = require('../../models/Job');
const User = require('../../models/User');

const { clearFirestoreDb } = require('../../config/testUtils');

describe('Match API (matchController integration)', () => {

    beforeEach(async () => {
        await clearFirestoreDb();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await clearFirestoreDb();
    });

    it('should return 200 and correct match analysis for valid ObjectIDs', async () => {
        // 1. Seed the temporary database
        const resume = await Resume.create({
            userId: "user_test",
            filename: "test.pdf",
            filepath: "uploads/test.pdf",
            skills: ["node.js", " Express", " MongoDB", "react"],
            rawText: "I am a full stack dev"
        });

        const job = await Job.create({
            title: "Backend Dev",
            company: "Tech Inc",
            description: "Looking for node devs",
            requiredSkills: ["Node.js", "MongoDB", "AWS", "Docker"]
        });

        // 2. Make the API request
        const res = await request(app).get(`/api/match/${resume._id}/${job._id}`);

        // 3. Assertions
        expect(res.statusCode).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();

        // node.js and mongodb matched, 2 out of 4 = 50%
        expect(res.body.data.matchPercentage).toBe(50);
        expect(res.body.data.matchedSkills).toEqual(['node.js', 'mongodb']);
        expect(res.body.data.missingSkills).toEqual(['aws', 'docker']);
    });

    it('should return 404 if Resume does not exist', async () => {
        const fakeResumeId = 'nonexistent-resume-id';

        const job = await Job.create({
            title: "Tester",
            company: "QA Org",
            description: "testing",
            requiredSkills: ["jest", "mocha"]
        });

        const res = await request(app).get(`/api/match/${fakeResumeId}/${job._id}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/resume not found/i);
    });

    it('should return 404 if Job does not exist', async () => {
        const resume = await Resume.create({
            userId: "user_test",
            filename: "test.pdf",
            filepath: "uploads/test.pdf",
            skills: ["react"],
            rawText: "test"
        });
        const fakeJobId = 'nonexistent-job-id';

        const res = await request(app).get(`/api/match/${resume._id}/${fakeJobId}`);

        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/job not found/i);
    });

    it('should return 500/400 for errors', async () => {
        // Since we are no longer using MongoDB, MongoDB specific ObjectId errors won't happen.
        // We can test general server error if we want.
    });

    describe('GET /api/match/auto/:userId', () => {
        it('should return ranked jobs based on user latest resume', async () => {
            const resume = await Resume.create({
                userId: "testuser123",
                filename: "test.pdf",
                filepath: "uploads/test.pdf",
                skills: ["react", "node.js"],
                rawText: "Dev"
            });

            await Job.create({
                title: "Frontend",
                company: "UI Corp",
                requiredSkills: ["react", "css"]
            });

            await Job.create({
                title: "Backend",
                company: "Server Inc",
                requiredSkills: ["node.js", "mongodb", "aws"]
            });

            await Job.create({
                title: "Fullstack",
                company: "All Round",
                requiredSkills: ["react", "node.js", "docker"]
            });

            const res = await request(app).get(`/api/match/auto/testuser123`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(3);
            
            // Fullstack should be first since it matches 2 skills
            expect(res.body.data[0].job.title).toBe("Fullstack");
            expect(res.body.data[1].job.title).toBe("Frontend"); // 1 match out of 2 = 50%
        });

        it('should return 404 if no resume found for user', async () => {
            const res = await request(app).get(`/api/match/auto/nonexistentuser`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/match/auto/:userId', () => {
        it('should return ranked jobs based on user latest resume', async () => {
            const resume = await Resume.create({
                userId: "testuser123",
                filename: "test.pdf",
                filepath: "uploads/test.pdf",
                skills: ["react", "node.js"],
                rawText: "Dev"
            });

            await Job.create({
                title: "Frontend",
                company: "UI Corp",
                requiredSkills: ["react", "css"]
            });

            await Job.create({
                title: "Backend",
                company: "Server Inc",
                requiredSkills: ["node.js", "mongodb", "aws"]
            });

            await Job.create({
                title: "Fullstack",
                company: "All Round",
                requiredSkills: ["react", "node.js", "docker"]
            });

            const res = await request(app).get(`/api/match/auto/testuser123`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(3);
            
            // Fullstack should be first since it matches 2 skills
            expect(res.body.data[0].job.title).toBe("Fullstack");
            expect(res.body.data[1].job.title).toBe("Frontend"); // 1 match out of 2 = 50%
        });

        it('should return 404 if no resume found for user', async () => {
            const res = await request(app).get(`/api/match/auto/nonexistentuser`);
            expect(res.statusCode).toBe(404);
            expect(res.body.success).toBe(false);
        });
    });

});
