require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const pool = require('../src/config/db');

const API_URL = 'http://localhost:5000/api/submissions';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function submitAndPoll(sourceCode, expectedVerdict, description) {
    console.log(`\n=== Testing: ${description} ===`);
    try {
        const postRes = await axios.post(API_URL, {
            user_id: 1,
            problem_id: 1, // Using problem 1
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
            std::cout << "Missing semicolon"
            return 0;
        }
        `;
        await submitAndPoll(ceCode, 'Compilation Error', 'Compilation Error');

        // 2. Wrong Answer
        const waCode = `
        #include <iostream>
        int main() {
            std::cout << "Wrong Output" << std::endl;
            return 0;
        }
        `;
        await submitAndPoll(waCode, 'Wrong Answer', 'Wrong Answer');

        // 3. Accepted
        // We checked the DB and cache manually. The test case 001.in is:
        // 3
        // 1 10000 1
        // And the expected output is 9999.
        // For the purpose of verifying the JudgeEngine works end-to-end, we will just output 9999 directly.
        const acCode = `
        #include <iostream>
        using namespace std;
        int main() {
            cout << 9999 << endl;
            return 0;
        }
        `;
        await submitAndPoll(acCode, 'Accepted', 'Accepted');
        
        console.log("\n🎉 Minimal Judge Verification Complete!");
    } finally {
        await pool.end();
    }
}

verifyAll();
