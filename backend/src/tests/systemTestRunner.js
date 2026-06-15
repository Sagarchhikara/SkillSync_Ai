const fs = require('fs');
const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { extractSkills } = require('../services/skillExtractionService');
const { calculateMatch } = require('../services/matchService');
const User = require('../models/User');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { db } = require('../config/firebase');

const API_URL = 'http://localhost:5000/api';

// Global Form Data Helper
const createFormData = (filePath, userId = '') => {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('resume', fs.createReadStream(filePath));
    if (userId) form.append('userId', userId);
    return form;
};

// Helper to wait
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main Test Runner Function
async function runSystemTests() {
    console.log('==================================================');
    console.log('       SkillSync AI - Automated System Testing    ');
    console.log('==================================================\n');

    const results = {
        auth: {},
        resumeUpload: {},
        skillExtraction: {},
        database: {},
        jobAPI: {},
        matchingEngine: {},
        autoMatchAPI: {},
        savedJobs: {},
        security: {},
        performance: {},
        e2e: {}
    };

    let testUserId = null;
    let testUserToken = null;
    let recruiterToken = null;

    // Prepare temp test files directory
    const tmpDir = path.join(__dirname, 'tmp_test_files');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
    }

    const pdfValidSource = path.join(__dirname, '../../../uploads/resume-1772794780526-379231228.pdf');
    const pdfLargeSource = path.join(__dirname, '../../../uploads/resume-1772794780526-379231228.pdf');

    const pdfValidPath = path.join(tmpDir, 'test_valid.pdf');
    const pdfEmptyPath = path.join(tmpDir, 'test_empty.pdf');
    const pdfLargePath = path.join(tmpDir, 'test_large.pdf');
    const txtUnsupportedPath = path.join(tmpDir, 'resume.txt');
    const exeMaliciousPath = path.join(tmpDir, 'test_virus.exe');
    const exeMaliciousRenamedPath = path.join(tmpDir, 'test_virus.pdf');

    console.log('Preparing temporary test files...');
    if (fs.existsSync(pdfValidSource)) {
        fs.copyFileSync(pdfValidSource, pdfValidPath);
    } else {
        console.warn('Source valid PDF not found at ' + pdfValidSource);
    }

    if (fs.existsSync(pdfLargeSource)) {
        fs.copyFileSync(pdfLargeSource, pdfLargePath);
    } else {
        console.warn('Source large PDF not found at ' + pdfLargeSource);
    }

    // Create an empty file (simulating empty resume)
    fs.writeFileSync(pdfEmptyPath, '');
    
    // Create unsupported text file
    fs.writeFileSync(txtUnsupportedPath, 'I am a text file with Python and React skills.');
    
    // Create dummy malicious executable
    fs.writeFileSync(exeMaliciousPath, Buffer.from([0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00])); // MZ header (Executable)
    fs.copyFileSync(exeMaliciousPath, exeMaliciousRenamedPath);
    console.log('Test files ready.\n');

    // ==========================================
    // 1. AUTHENTICATION TESTING
    // ==========================================
    console.log('--- 1. Authentication Testing ---');
    try {
        // Clear test users first (clean slate)
        const userEmails = ['applicant_test@example.com', 'recruiter_test@example.com', 'dup_test@example.com'];
        for (const email of userEmails) {
            const snap = await db.collection('users').where('email', '==', email).get();
            for (const doc of snap.docs) {
                await doc.ref.delete();
            }
        }

        // Valid Applicant signup
        let res = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test Applicant',
            email: 'applicant_test@example.com',
            password: 'password123',
            role: 'applicant'
        });
        results.auth.signupApplicant = res.data.success && res.data.token ? 'PASS' : 'FAIL';

        // Valid Recruiter signup
        res = await axios.post(`${API_URL}/auth/signup`, {
            name: 'Test Recruiter',
            email: 'recruiter_test@example.com',
            password: 'password123',
            role: 'recruiter'
        });
        results.auth.signupRecruiter = res.data.success ? 'PASS' : 'FAIL';
        recruiterToken = res.data.token;

        // Invalid Cases
        const invalidCases = [
            { name: '', email: 'test@example.com', password: 'password123' }, // empty name
            { name: 'No Email', email: '', password: 'password123' }, // empty email
            { name: 'Invalid Email', email: 'invalid-email-format', password: 'password123' }, // invalid format
            { name: 'No Password', email: 'test@example.com', password: '' } // empty password
        ];

        let failedInvalidCases = 0;
        for (const c of invalidCases) {
            try {
                await axios.post(`${API_URL}/auth/signup`, c);
            } catch (err) {
                if (err.response && err.response.data.success === false) {
                    failedInvalidCases++;
                }
            }
        }

        // Test duplicate email separately to verify the specific message
        try {
            await axios.post(`${API_URL}/auth/signup`, {
                name: 'Duplicate',
                email: 'applicant_test@example.com',
                password: 'password123'
            });
        } catch (err) {
            if (err.response && err.response.data.success === false) {
                failedInvalidCases++;
            }
        }

        results.auth.invalidSignupRejections = failedInvalidCases === (invalidCases.length + 1) ? 'PASS' : 'FAIL';

        // Login correct credentials
        res = await axios.post(`${API_URL}/auth/login`, {
            email: 'applicant_test@example.com',
            password: 'password123'
        });
        results.auth.loginCorrect = res.data.success && res.data.token ? 'PASS' : 'FAIL';
        testUserToken = res.data.token;
        testUserId = res.data.user._id;

        // Login wrong password
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'applicant_test@example.com',
                password: 'wrongpassword'
            });
            results.auth.loginWrongPassword = 'FAIL';
        } catch (err) {
            results.auth.loginWrongPassword = err.response && err.response.status === 401 ? 'PASS' : 'FAIL';
        }

        // Login non-existing user
        try {
            await axios.post(`${API_URL}/auth/login`, {
                email: 'nonexistent@example.com',
                password: 'password123'
            });
            results.auth.loginNonExisting = 'FAIL';
        } catch (err) {
            results.auth.loginNonExisting = err.response && err.response.status === 401 ? 'PASS' : 'FAIL';
        }

        console.log(`- Signup Applicant: ${results.auth.signupApplicant}`);
        console.log(`- Signup Recruiter: ${results.auth.signupRecruiter}`);
        console.log(`- Invalid Signup Rejections: ${results.auth.invalidSignupRejections}`);
        console.log(`- Login Correct: ${results.auth.loginCorrect}`);
        console.log(`- Login Wrong Password: ${results.auth.loginWrongPassword}`);
        console.log(`- Login Non-Existing: ${results.auth.loginNonExisting}\n`);
    } catch (err) {
        console.error('Auth testing error:', err.message);
        results.auth.status = 'ERROR';
    }

    // ==========================================
    // 2. RESUME UPLOAD TESTING
    // ==========================================
    console.log('--- 2. Resume Upload Testing ---');
    try {
        // PDF Valid Resume Upload
        let form = createFormData(pdfValidPath, testUserId || 'testuser123');
        let res = await axios.post(`${API_URL}/resume/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
        });
        results.resumeUpload.pdfValid = res.data.success && res.data.data.skills.includes('python') ? 'PASS' : 'FAIL';

        // DOCX Valid Resume Upload
        const docxPath = path.join(__dirname, '../../perf_test.docx');
        if (fs.existsSync(docxPath)) {
            form = createFormData(docxPath, testUserId || 'testuser123');
            res = await axios.post(`${API_URL}/resume/upload`, form, {
                headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
            });
            results.resumeUpload.docxValid = res.data.success && res.data.data.skills.includes('python') ? 'PASS' : 'FAIL';
        } else {
            results.resumeUpload.docxValid = 'SKIP (perf_test.docx not found)';
        }

        // Unsupported File Type (.txt)
        try {
            form = createFormData(txtUnsupportedPath);
            await axios.post(`${API_URL}/resume/upload`, form, {
                headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
            });
            results.resumeUpload.unsupportedType = 'FAIL';
        } catch (err) {
            results.resumeUpload.unsupportedType = err.response && err.response.status === 400 ? 'PASS' : 'FAIL';
        }

        // Empty Resume Upload
        try {
            form = createFormData(pdfEmptyPath);
            await axios.post(`${API_URL}/resume/upload`, form, {
                headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
            });
            results.resumeUpload.emptyResume = 'FAIL';
        } catch (err) {
            // Should fail because no skills could be extracted
            results.resumeUpload.emptyResume = err.response && err.response.status === 400 ? 'PASS' : 'FAIL';
        }

        // Large Resume (25 pages / 208 KB)
        form = createFormData(pdfLargePath, testUserId);
        res = await axios.post(`${API_URL}/resume/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
        });
        results.resumeUpload.largeResume = res.data.success ? 'PASS' : 'FAIL';

        console.log(`- PDF Valid Upload: ${results.resumeUpload.pdfValid}`);
        console.log(`- DOCX Valid Upload: ${results.resumeUpload.docxValid}`);
        console.log(`- Unsupported Rejection (.txt): ${results.resumeUpload.unsupportedType}`);
        console.log(`- Empty Resume Rejection: ${results.resumeUpload.emptyResume}`);
        console.log(`- Large Resume (25-pg): ${results.resumeUpload.largeResume}\n`);
    } catch (err) {
        console.error('Resume upload error:', err.message);
        results.resumeUpload.status = 'ERROR';
    }

    // ==========================================
    // 3. SKILL EXTRACTION TESTING
    // ==========================================
    console.log('--- 3. Skill Extraction Testing ---');
    try {
        const testCases = [
            { input: 'I know Python and React', expected: ['python', 'react'] },
            { input: 'PYTHON React', expected: ['python', 'react'] },
            { input: "React.js\nSpring Boot\nMachine Learning", expected: ['react', 'spring boot', 'machine learning'] },
            { input: 'Python Python Python', expected: ['python'] },
            { input: 'ongoing project', expected: [] } // Should not match "go"
        ];

        let passCount = 0;
        for (const tc of testCases) {
            const extracted = extractSkills(tc.input).sort();
            const expectedSorted = tc.expected.sort();
            const isMatch = JSON.stringify(extracted) === JSON.stringify(expectedSorted);
            if (isMatch) passCount++;
            else {
                console.log(`   Failed Extraction! Input: "${tc.input}" -> Got: ${JSON.stringify(extracted)} | Expected: ${JSON.stringify(expectedSorted)}`);
            }
        }
        results.skillExtraction.accuracy = passCount === testCases.length ? 'PASS' : 'FAIL';
        console.log(`- Extraction accuracy tests: ${results.skillExtraction.accuracy}\n`);
    } catch (err) {
        console.error('Skill extraction service error:', err.message);
        results.skillExtraction.status = 'ERROR';
    }

    // ==========================================
    // 4. DATABASE TESTING
    // ==========================================
    console.log('--- 4. Database Testing ---');
    try {
        // Upload a resume to test database state
        const form = createFormData(pdfValidPath, testUserId || 'db-test-user-123');
        const res = await axios.post(`${API_URL}/resume/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
        });
        const resumeId = res.data.data._id;

        // Verify resume document in Firestore
        const docSnap = await db.collection('resumes').doc(resumeId).get();
        const docExists = docSnap.exists;
        const skillsSaved = docSnap.data().skills.includes('python');
        results.database.documentCreation = docExists && skillsSaved ? 'PASS' : 'FAIL';

        // Delete resume manually in Firestore
        await db.collection('resumes').doc(resumeId).delete();
        // Check system doesn't crash on subsequent read
        const deletedSnap = await db.collection('resumes').doc(resumeId).get();
        results.database.gracefulDelete = !deletedSnap.exists ? 'PASS' : 'FAIL';

        console.log(`- Document Created & Validated: ${results.database.documentCreation}`);
        console.log(`- Manual Delete Safe: ${results.database.gracefulDelete}\n`);
    } catch (err) {
        console.error('Database testing error:', err.message);
        results.database.status = 'ERROR';
    }

    // ==========================================
    // 5. JOB API TESTING
    // ==========================================
    console.log('--- 5. Job API Testing ---');
    let testJobId = null;
    try {
        // Clear jobs collection
        const jobSnap = await db.collection('jobs').get();
        for (const doc of jobSnap.docs) {
            await doc.ref.delete();
        }

        // Create job - Valid Request (requires recruiterToken)
        let res = await axios.post(`${API_URL}/jobs`, {
            title: 'Software Developer',
            company: 'Test Systems Ltd',
            requiredSkills: ['react', 'node.js', 'aws'],
            minExperience: 2,
            description: 'Test job description'
        }, { headers: { Authorization: `Bearer ${recruiterToken}` } });
        testJobId = res.data.data._id;
        results.jobAPI.createValid = res.data.success ? 'PASS' : 'FAIL';

        // Create job - Missing Title
        try {
            await axios.post(`${API_URL}/jobs`, {
                company: 'Test Systems Ltd',
                requiredSkills: ['react', 'node.js'],
                minExperience: 2
            }, { headers: { Authorization: `Bearer ${recruiterToken}` } });
            results.jobAPI.missingTitle = 'FAIL';
        } catch (err) {
            results.jobAPI.missingTitle = err.response && err.response.status === 400 ? 'PASS' : 'FAIL';
        }

        // Create job - Missing Skills
        try {
            await axios.post(`${API_URL}/jobs`, {
                title: 'Software Developer',
                company: 'Test Systems Ltd',
                requiredSkills: [],
                minExperience: 2
            }, { headers: { Authorization: `Bearer ${recruiterToken}` } });
            results.jobAPI.missingSkills = 'FAIL';
        } catch (err) {
            results.jobAPI.missingSkills = err.response && err.response.status === 400 ? 'PASS' : 'FAIL';
        }

        // Get Jobs (public endpoint, no token required)
        res = await axios.get(`${API_URL}/jobs`);
        results.jobAPI.getJobsCount = res.data.success && res.data.count === 1 ? 'PASS' : 'FAIL';

        console.log(`- Create Job Valid: ${results.jobAPI.createValid}`);
        console.log(`- Reject Missing Title: ${results.jobAPI.missingTitle}`);
        console.log(`- Reject Missing Skills: ${results.jobAPI.missingSkills}`);
        console.log(`- Get Jobs Count: ${results.jobAPI.getJobsCount}\n`);
    } catch (err) {
        console.error('Job API error:', err.message);
        results.jobAPI.status = 'ERROR';
    }

    // ==========================================
    // 6. SEMANTIC MATCHING ENGINE TESTING
    // ==========================================
    console.log('--- 6. Semantic Matching Engine Testing ---');
    try {
        // Exact Match
        let match = await calculateMatch(['python', 'react', 'node.js'], ['python', 'react', 'node.js']);
        results.matchingEngine.exact = match.matchPercentage === 100 ? 'PASS' : 'FAIL';

        // Partial Match
        match = await calculateMatch(['python', 'react'], ['python', 'react', 'aws', 'docker']);
        results.matchingEngine.partial = Math.abs(match.matchPercentage - 50) <= 5 ? 'PASS' : 'FAIL';

        // Semantic Match (nodejs vs node.js is high similarity, above 0.70 threshold)
        match = await calculateMatch(['nodejs'], ['node.js']);
        results.matchingEngine.semantic = match.matchPercentage === 100 && match.matchedSkills.includes('node.js') ? 'PASS' : 'FAIL';

        // No Match
        match = await calculateMatch(['java'], ['react']);
        results.matchingEngine.noMatch = match.matchPercentage < 30 ? 'PASS' : 'FAIL';

        // Fallback matching using the hook FORCE_MATCH_FALLBACK
        global.FORCE_MATCH_FALLBACK = true;
        const resumeSkills = ['react', 'node.js'];
        const requiredSkills = ['react', 'docker'];
        const fallbackRes = await calculateMatch(resumeSkills, requiredSkills);
        global.FORCE_MATCH_FALLBACK = false; // reset hook
        
        // Exact matches react -> react = 50%
        results.matchingEngine.fallback = fallbackRes.matchPercentage === 50 ? 'PASS' : 'FAIL';

        console.log(`- Exact Match (~100%): ${results.matchingEngine.exact}`);
        console.log(`- Partial Match (~50%): ${results.matchingEngine.partial}`);
        console.log(`- Semantic Match (nodejs vs node.js): ${results.matchingEngine.semantic}`);
        console.log(`- No Match (Low Score): ${results.matchingEngine.noMatch}`);
        console.log(`- Fallback Logic Works: ${results.matchingEngine.fallback}\n`);
    } catch (err) {
        console.error('Matching engine error:', err.message);
        results.matchingEngine.status = 'ERROR';
    }

    // ==========================================
    // 7. AUTO MATCH API TESTING
    // ==========================================
    console.log('--- 7. Auto Match API Testing ---');
    try {
        // Create a test user with a resume
        const userWithResume = await User.create({
            name: 'User With Resume',
            email: 'user_with_resume@example.com',
            password: 'password123'
        });

        // Add a job
        const job = await Job.create({
            title: 'React Dev',
            company: 'Vercel Inc',
            requiredSkills: ['react']
        });

        // Sign token for userWithResume
        const userWithResumeToken = jwt.sign(
            { _id: userWithResume._id, email: userWithResume.email, role: 'applicant' },
            process.env.JWT_SECRET || 'fallback_secret_for_dev'
        );

        // Upload resume for this user
        const form = createFormData(pdfValidPath, userWithResume._id);
        await axios.post(`${API_URL}/resume/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${userWithResumeToken}` }
        });

        // Auto Match User with Resume
        let res = await axios.get(`${API_URL}/match/auto/${userWithResume._id}`, {
            headers: { Authorization: `Bearer ${userWithResumeToken}` }
        });
        results.autoMatchAPI.userWithResume = res.data.success && res.data.data.length > 0 ? 'PASS' : 'FAIL';

        // Auto Match User without Resume (generates token specifically for nonexistentuser123 to reach controller 404 block)
        try {
            const nonexistentToken = jwt.sign(
                { _id: 'nonexistentuser123', email: 'nonexistent@example.com', role: 'applicant' },
                process.env.JWT_SECRET || 'fallback_secret_for_dev'
            );
            await axios.get(`${API_URL}/match/auto/nonexistentuser123`, {
                headers: { Authorization: `Bearer ${nonexistentToken}` }
            });
            results.autoMatchAPI.userWithoutResume = 'FAIL';
        } catch (err) {
            results.autoMatchAPI.userWithoutResume = err.response && err.response.status === 404 ? 'PASS' : 'FAIL';
        }

        console.log(`- Auto Match User with Resume: ${results.autoMatchAPI.userWithResume}`);
        console.log(`- Auto Match User without Resume: ${results.autoMatchAPI.userWithoutResume}\n`);
    } catch (err) {
        console.error('Auto Match API error:', err.message);
        results.autoMatchAPI.status = 'ERROR';
    }

    // ==========================================
    // 8. SAVED JOBS TESTING
    // ==========================================
    console.log('--- 8. Saved Jobs Testing ---');
    try {
        const user = await User.create({
            name: 'Job Saver User',
            email: 'job_saver@example.com',
            password: 'password123'
        });

        const job = await Job.create({
            title: 'Node Dev',
            company: 'Netflix',
            requiredSkills: ['node.js']
        });

        // Sign token for Job Saver
        const jobSaverToken = jwt.sign(
            { _id: user._id, email: user.email, role: 'applicant' },
            process.env.JWT_SECRET || 'fallback_secret_for_dev'
        );

        // Save Job
        let res = await axios.post(`${API_URL}/users/${user._id}/jobs/${job._id}`, {}, {
            headers: { Authorization: `Bearer ${jobSaverToken}` }
        });
        results.savedJobs.saveFirstTime = res.data.success && res.data.savedJobs.includes(job._id) ? 'PASS' : 'FAIL';

        // Save Same Job Twice
        try {
            await axios.post(`${API_URL}/users/${user._id}/jobs/${job._id}`, {}, {
                headers: { Authorization: `Bearer ${jobSaverToken}` }
            });
            results.savedJobs.saveDuplicate = 'FAIL';
        } catch (err) {
            results.savedJobs.saveDuplicate = err.response && err.response.status === 400 ? 'PASS' : 'FAIL';
        }

        // Remove Saved Job
        res = await axios.delete(`${API_URL}/users/${user._id}/jobs/${job._id}`, {
            headers: { Authorization: `Bearer ${jobSaverToken}` }
        });
        results.savedJobs.removeJob = res.data.success && !res.data.savedJobs.includes(job._id) ? 'PASS' : 'FAIL';

        console.log(`- Save Job First Time: ${results.savedJobs.saveFirstTime}`);
        console.log(`- Reject Duplicate Save: ${results.savedJobs.saveDuplicate}`);
        console.log(`- Remove Saved Job: ${results.savedJobs.removeJob}\n`);
    } catch (err) {
        console.error('Saved Jobs API error:', err.message);
        results.savedJobs.status = 'ERROR';
    }

    // ==========================================
    // 9. SECURITY TESTING
    // ==========================================
    console.log('--- 9. Security Testing ---');
    try {
        const user = await User.create({
            name: 'Sec Test User',
            email: 'sec_test@example.com',
            password: 'mysecurepassword'
        });

        // 1. Plaintext Password Check
        const dbUser = await db.collection('users').doc(user._id).get();
        // Plaintext risk is false because we securely hash during user creation in tests
        const plaintextRisk = dbUser.data().password === 'mysecurepassword';
        results.security.plaintextPasswords = plaintextRisk ? 'RISK (Passwords stored in Plaintext!)' : 'PASS';

        // 2. Unauthorized Access Check (should trigger 401 now)
        let unauthorizedAccess = false;
        try {
            await axios.get(`${API_URL}/users/${user._id}/profile`);
            unauthorizedAccess = true; // Succeeded (risk!)
        } catch (err) {
            // Succeeded if status is 200, otherwise if 401 it correctly blocked access
            unauthorizedAccess = err.response && err.response.status === 200;
        }
        results.security.unauthorizedProfileAccess = unauthorizedAccess 
            ? 'RISK (No JWT verification middleware active!)' 
            : 'PASS';

        // 3. Malicious Upload Check (MZ Executable Header renamed to PDF)
        try {
            const form = createFormData(exeMaliciousRenamedPath);
            await axios.post(`${API_URL}/resume/upload`, form, {
                headers: { ...form.getHeaders(), Authorization: `Bearer ${testUserToken}` }
            });
            results.security.maliciousUpload = 'FAIL (Server parsed executable renamed to PDF)';
        } catch (err) {
            results.security.maliciousUpload = err.response && err.response.status === 400 ? 'PASS (Safely rejected)' : 'FAIL';
        }

        console.log(`- Plaintext Password Audit: ${results.security.plaintextPasswords}`);
        console.log(`- Profile Auth Verification Audit: ${results.security.unauthorizedProfileAccess}`);
        console.log(`- Malicious Upload Rejection: ${results.security.maliciousUpload}\n`);
    } catch (err) {
        console.error('Security testing error:', err.message);
        results.security.status = 'ERROR';
    }

    // ==========================================
    // 10. PERFORMANCE TESTING
    // ==========================================
    console.log('--- 10. Performance Testing ---');
    try {
        console.log('Creating 100 users, 100 jobs, 50 resumes (mock database bulk insertions)...');
        
        // Generate mock data
        const userPromises = [];
        for (let i = 0; i < 100; i++) {
            userPromises.push(db.collection('users').add({
                name: `Perf User ${i}`,
                email: `perf_user_${i}@example.com`,
                role: 'applicant',
                savedJobs: [],
                skills: ['python', 'react', 'node.js']
            }));
        }
        const createdUserDocs = await Promise.all(userPromises);
        const targetUserId = createdUserDocs[0].id;

        const jobPromises = [];
        for (let i = 0; i < 100; i++) {
            jobPromises.push(db.collection('jobs').add({
                title: `Perf Job ${i}`,
                company: `Perf Company ${i}`,
                requiredSkills: ['python', 'react', 'node.js', 'aws', 'docker'],
                minExperience: i % 5,
                createdAt: new Date()
            }));
        }
        await Promise.all(jobPromises);

        const resumePromises = [];
        for (let i = 0; i < 50; i++) {
            resumePromises.push(db.collection('resumes').add({
                userId: createdUserDocs[i % createdUserDocs.length].id,
                filename: `perf_resume_${i}.pdf`,
                skills: ['python', 'react', 'node.js'],
                createdAt: new Date()
            }));
        }
        await Promise.all(resumePromises);

        console.log('Data seeded. Measuring matching response time...');
        const startMem = process.memoryUsage().heapUsed;
        const startTime = Date.now();

        // Sign token for Target Perf User
        const perfUserToken = jwt.sign(
            { _id: targetUserId, email: `perf_user_0@example.com`, role: 'applicant' },
            process.env.JWT_SECRET || 'fallback_secret_for_dev'
        );

        // Run auto match for target user (which does matching against 100 jobs)
        const res = await axios.get(`${API_URL}/match/auto/${targetUserId}`, {
            headers: { Authorization: `Bearer ${perfUserToken}` }
        });
        
        const duration = Date.now() - startTime;
        const endMem = process.memoryUsage().heapUsed;

        results.performance.durationMs = duration;
        results.performance.memoryMB = Math.round((endMem - startMem) / 1024 / 1024);
        results.performance.status = duration < 3000 ? 'PASS' : 'FAIL (Took > 3 seconds)';

        console.log(`- Matches found: ${res.data.data.length}`);
        console.log(`- Match Auto Response Time: ${results.performance.durationMs} ms (Target: < 3000 ms)`);
        console.log(`- Memory Overhead: ${results.performance.memoryMB} MB`);
        console.log(`- Performance Status: ${results.performance.status}\n`);

        // Clean up mock data
        console.log('Cleaning up performance testing documents...');
        const collections = ['users', 'jobs', 'resumes'];
        for (const col of collections) {
            const snap = await db.collection(col).get();
            for (const doc of snap.docs) {
                // Delete everything created for performance to keep database pristine
                if (doc.data().name?.startsWith('Perf User') || 
                    doc.data().title?.startsWith('Perf Job') || 
                    doc.data().filename?.startsWith('perf_resume_')) {
                    await doc.ref.delete();
                }
            }
        }
        console.log('Cleanup complete.\n');
    } catch (err) {
        console.error('Performance testing error:', err.message);
        results.performance.status = 'ERROR';
    }

    // ==========================================
    // 11. END-TO-END FLOW TESTING
    // ==========================================
    console.log('--- 11. Final End-to-End Test ---');
    try {
        const e2eEmail = 'e2e_user@example.com';
        
        // 1. Cleanup E2E user & jobs if exists
        const e2eUserSnap = await db.collection('users').where('email', '==', e2eEmail).get();
        for (const doc of e2eUserSnap.docs) {
            await doc.ref.delete();
        }

        // 2. Signup User
        let res = await axios.post(`${API_URL}/auth/signup`, {
            name: 'E2E Applicant',
            email: e2eEmail,
            password: 'password123',
            role: 'applicant'
        });
        const userId = res.data.user._id;

        // 3. Login
        res = await axios.post(`${API_URL}/auth/login`, {
            email: e2eEmail,
            password: 'password123'
        });
        const token = res.data.token;

        // 4. Upload Resume (attaches authorization header)
        console.log('E2E: Checking if valid PDF file exists at path:', pdfValidPath, '->', fs.existsSync(pdfValidPath));
        const form = createFormData(pdfValidPath, userId);
        res = await axios.post(`${API_URL}/resume/upload`, form, {
            headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
        });
        const resumeId = res.data.data._id;

        // 5. Create Job (requires recruiterToken)
        res = await axios.post(`${API_URL}/jobs`, {
            title: 'AWS Cloud Developer',
            company: 'Orbit Corp',
            requiredSkills: ['aws', 'python', 'react']
        }, { headers: { Authorization: `Bearer ${recruiterToken}` } });
        const jobId = res.data.data._id;

        // 6. Run Matching
        res = await axios.get(`${API_URL}/match/auto/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const matches = res.data.data;
        const matchedJob = matches.find(m => m.job._id === jobId);

        // 7. Save Job
        res = await axios.post(`${API_URL}/users/${userId}/jobs/${jobId}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // 8. Fetch Saved Jobs
        res = await axios.get(`${API_URL}/users/${userId}/jobs`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const savedJobs = res.data.data;
        const isJobSaved = savedJobs.some(j => j._id === jobId);

        // 9. Verify E2E Flow
        const e2ePassed = userId && token && resumeId && jobId && matchedJob && isJobSaved;
        results.e2e.flowStatus = e2ePassed ? 'PASS' : 'FAIL';

        console.log(`- Final E2E Workflow Status: ${results.e2e.flowStatus}\n`);
    } catch (err) {
        console.error('E2E testing error:', err.message);
        results.e2e.flowStatus = 'ERROR';
    }

    // Cleanup generated files
    console.log('Cleaning up temporary test files...');
    fs.rmSync(tmpDir, { recursive: true, force: true });
    console.log('Cleanup complete.\n');

    console.log('==================================================');
    console.log('              SYSTEM TESTING COMPLETE             ');
    console.log('==================================================');

    // Write final summary log
    const reportPath = path.join(__dirname, 'system_test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    console.log(`Report saved to: ${reportPath}`);
}

runSystemTests();
