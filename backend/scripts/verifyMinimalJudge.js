require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const pool = require('../src/config/db');

const API_URL = 'http://localhost:5000/api/submissions';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitAndPoll(sourceCode, expectedVerdict, description, problemId = 1) {
    console.log(`\n=== Testing: ${description} ===`);
    try {
        const postRes = await axios.post(API_URL, {
            user_id: 1,
            problem_id: problemId,

            language: "cpp17",
            source_code: sourceCode
        });

        const { submission_id, status: initialStatus } = postRes.data;
        console.log(`✅ Submission created. ID: ${submission_id}`);

        let currentStatus = initialStatus;
        let finalVerdict = null;

        for (let i = 0; i < 20; i++) {
            await delay(500); 
            
            const getRes = await axios.get(`${API_URL}/${submission_id}`);
            const data = getRes.data;
            
            if (data.status !== currentStatus) {
                console.log(`   Status: ${currentStatus} -> ${data.status}`);
                currentStatus = data.status;
            }

            if (currentStatus === 'completed') {
                finalVerdict = data.verdict;
                break;
            }
        }

        if (currentStatus !== 'completed') {
            console.error(`❌ Submission stuck in state: ${currentStatus}`);
            process.exit(1);
        }
        
        if (finalVerdict !== expectedVerdict) {
            console.error(`❌ Expected verdict '${expectedVerdict}', got '${finalVerdict}'`);
            process.exit(1);
        }
        
        console.log(`✅ Final verdict matches expected: ${expectedVerdict}`);
        return true;
    } catch (err) {
        console.error(`❌ Verification failed for ${description}:`, err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

async function verifyAll() {
    console.log("=== Verifying Minimal Judge ===");

    try {
        // 1. Compilation Error
        const ceCode = `
        #include <iostream>
        int main() {
            cout << "Missing namespace and syntax error"
        }
        `;
        await submitAndPoll(ceCode, 'Compilation Error', 'Compilation Error', 8);

        // 2. Wrong Answer
        const waCode = `
        #include <iostream>
        int main() {
            std::cout << "Wrong Output" << std::endl;
            return 0;
        }
        `;
        await submitAndPoll(waCode, 'Wrong Answer', 'Wrong Answer', 8);

        // For problem 8 (Maximum Subarray Sum):
        // First line: N
        // Second line: N space-separated integers
        const acCode = `
        #include <iostream>
        #include <vector>
        using namespace std;
        int main() {
            int n;
            if (!(cin >> n)) return 0;
            long long max_so_far = -1e18;
            long long current_max = -1e18;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                if (current_max < 0) current_max = x;
                else current_max += x;
                if (current_max > max_so_far) max_so_far = current_max;
            }
            cout << max_so_far << endl;
            return 0;
        }
        `;
        await submitAndPoll(acCode, 'Accepted', 'Accepted', 8);
        
        // 4. Runtime Error
        const reCode = `
        #include <iostream>
        int main() {
            int* ptr = nullptr;
            *ptr = 42; // Segfault
            return 0;
        }
        `;
        await submitAndPoll(reCode, 'Runtime Error', 'Runtime Error', 8);

        // 5. Time Limit Exceeded
        const tleCode = `
        #include <iostream>
        int main() {
            while (true) {} // Infinite loop
            return 0;
        }
        `;
        await submitAndPoll(tleCode, 'Time Limit Exceeded', 'Time Limit Exceeded', 8);
        
        console.log("\n🎉 Judge Hardening Verification Complete!");
    } finally {
        await pool.end();
    }
}

verifyAll();
