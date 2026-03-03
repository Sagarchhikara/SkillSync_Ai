const fs = require('fs');
const http = require('http');
const FormData = require('form-data');
const path = require('path');

const NUM_UPLOADS = 50;
const filePath = path.join(__dirname, '../perf_test.docx');

async function uploadResume(i) {
    return new Promise((resolve, reject) => {
        const form = new FormData();
        form.append('userId', `perf-user-${i}`);
        form.append('resume', fs.createReadStream(filePath), {
            filename: 'perf_test.docx',
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        });

        const start = Date.now();
        const request = http.request({
            method: 'POST',
            host: 'localhost',
            port: 5000,
            path: '/api/resume/upload',
            headers: form.getHeaders()
        });

        form.pipe(request);

        request.on('response', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - start;
                resolve({ status: res.statusCode, duration, body: data });
            });
        });

        request.on('error', reject);
    });
}

async function runPerformanceTest() {
    console.log(`Starting performance test with ${NUM_UPLOADS} uploads...`);
    
    try {
        await new Promise((resolve, reject) => {
           http.get('http://localhost:5000/api/health', (res) => {
               if (res.statusCode === 200) resolve();
               else reject(new Error('API Health check failed'));
           }).on('error', reject);
        });
    } catch (e) {
        console.error("API is not reachable. Please start the server on port 5000.");
        process.exit(1);
    }

    const startTime = Date.now();
    let successCount = 0;
    let totalDuration = 0;

    for (let i = 0; i < NUM_UPLOADS; i++) {
        try {
            const result = await uploadResume(i);
            if (result.status === 201) {
                successCount++;
                totalDuration += result.duration;
            } else {
                console.error(`Upload ${i} failed with status: ${result.status} - ${result.body}`);
            }
        } catch (e) {
            console.error(`Upload ${i} error:`, e.message);
        }
        await new Promise(r => setTimeout(r, 20)); 
    }

    const testDuration = (Date.now() - startTime) / 1000;
    console.log('--- Performance Test Results ---');
    console.log(`Total Uploads Attempted: ${NUM_UPLOADS}`);
    console.log(`Successful Uploads: ${successCount}`);
    console.log(`Average Response Time: ${(totalDuration / Math.max(1, successCount)).toFixed(2)} ms`);
    console.log(`Total Test Duration: ${testDuration.toFixed(2)} seconds`);
    
    const memUsage = process.memoryUsage();
    console.log(`Final Test Runner Memory Usage (RSS): ${Math.round(memUsage.rss / 1024 / 1024)} MB`);
    
    if (successCount === NUM_UPLOADS) {
        console.log("SUCCESS: API stable under load.");
    } else {
        console.log("WARNING: Some errors occurred during load.");
    }
}

runPerformanceTest();
