import http from 'k6/http';
import { check, sleep } from 'k6';

// k6 Options: Simulating load profile scaling to 50 & 100 concurrent users
export const options = {
    stages: [
        { duration: '15s', target: 50 },  // Ramp up to 50 concurrent virtual users
        { duration: '30s', target: 50 },  // Maintain steady state of 50 users
        { duration: '15s', target: 100 }, // Scale up to 100 concurrent virtual users
        { duration: '30s', target: 100 }, // Maintain steady state of 100 users
        { duration: '15s', target: 0 }    // Cool down to 0 users
    ],
    thresholds: {
        // Enforce the requirement: 95% of request latencies must stay below 3000ms
        http_req_duration: ['p(95)<3000'],
        // Success rate should remain above 99%
        http_req_failed: ['rate<0.01']
    }
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

// Simulated virtual user flow
export default function () {
    const headers = { 'Content-Type': 'application/json' };

    // 1. User performs secure Health Check ping
    const healthRes = http.get(`${BASE_URL}/health`, { headers });
    check(healthRes, {
        'health check status is 200': (r) => r.status === 200,
        'app running correctly': (r) => r.json().status === 'OK' || r.json().status === 'OK and secure'
    });
    sleep(1);

    // 2. Fetch jobs list (simulate job browsing feed)
    const jobsRes = http.get(`${BASE_URL}/jobs`, { headers });
    check(jobsRes, {
        'jobs fetch is 200': (r) => r.status === 200,
        'jobs array returned': (r) => Array.isArray(r.json().data)
    });
    sleep(2);

    // 3. User Login Simulation
    const loginPayload = JSON.stringify({
        email: 'e2e_user@example.com',
        password: 'password123'
    });
    const loginRes = http.post(`${BASE_URL}/auth/login`, loginPayload, { headers });
    const isLoginOk = check(loginRes, {
        'login is 200': (r) => r.status === 200,
        'jwt token received': (r) => r.json().token !== undefined
    });

    if (isLoginOk) {
        const token = loginRes.json().token;
        const userId = loginRes.json().user._id;
        const authHeaders = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        // 4. Retrieve candidate profile
        const profileRes = http.get(`${BASE_URL}/users/${userId}/profile`, { headers: authHeaders });
        check(profileRes, {
            'profile retrieval is 200': (r) => r.status === 200,
            'profile contains user details': (r) => r.json().success === true
        });
        sleep(1);

        // 5. Compute Auto-Matching (tests cached embedding engine)
        const matchRes = http.get(`${BASE_URL}/match/auto/${userId}`, { headers: authHeaders });
        check(matchRes, {
            'auto match calculation is 200': (r) => r.status === 200,
            'match scores computed': (r) => Array.isArray(r.json().data)
        });
        sleep(2);
    }
}
