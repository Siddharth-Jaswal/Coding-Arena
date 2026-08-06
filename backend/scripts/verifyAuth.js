const axios = require('axios');
const uuid = require('uuid').v4;

const API_URL = 'http://localhost:5000/api';
let token = '';

async function run() {
    const randomString = uuid().split('-')[0];
    const username = `testuser_${randomString}`;
    const email = `${username}@example.com`;
    const password = 'StrongPassword123';

    console.log(`\n=== Verifying Auth & User Service ===\n`);

    try {
        // 1. Register
        console.log(`[1] Registering user ${username}...`);
        const registerRes = await axios.post(`${API_URL}/auth/register`, { username, email, password });
        console.log('✅ Registration successful');
        token = registerRes.data.data.token;

        // 2. Login
        console.log(`\n[2] Logging in...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        console.log('✅ Login successful');
        if (loginRes.data.data.token !== token) {
            token = loginRes.data.data.token;
        }

        // 3. Get Current User (Me)
        console.log(`\n[3] Fetching current user profile...`);
        const meRes = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile fetched:', meRes.data.data.username);

        // 4. Update Profile
        console.log(`\n[4] Updating profile...`);
        const updateRes = await axios.patch(`${API_URL}/users/me`, {
            displayName: 'Test User Display'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Profile updated:', updateRes.data.data.displayName);

        // 5. Check Protected Route Without Token
        console.log(`\n[5] Testing protected route without token...`);
        try {
            await axios.get(`${API_URL}/users/me`);
            console.error('❌ Failed: Route should be protected');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('✅ Access denied as expected (401)');
            } else {
                console.error('❌ Failed with unexpected status', error.response?.status);
            }
        }

        console.log(`\n🎉 Auth Verification Complete!`);
    } catch (error) {
        console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

run();
