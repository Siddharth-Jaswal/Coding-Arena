require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');

const API_URL = 'http://localhost:5000/api/run';

async function runCodeTest(sourceCode, expectedVerdict, description, problemId = 8) {
    console.log(`\n=== Testing: ${description} ===`);
    try {
        console.log('Sending request to /api/run...');
        const startTime = Date.now();
        const res = await axios.post(API_URL, {
            problem_id: problemId,
            language: "cpp17",
            source_code: sourceCode
        });
        const elapsed = Date.now() - startTime;
        console.log(`Received response in ${elapsed}ms`);

        const data = res.data;
        if (data.status !== 'completed') {
            console.error(`❌ Expected status 'completed', got '${data.status}'`);
            process.exit(1);
        }

        if (data.verdict !== expectedVerdict) {
            console.error(`❌ Expected overall verdict '${expectedVerdict}', got '${data.verdict}'`);
            process.exit(1);
        }

        console.log(`✅ Overall verdict matches expected: ${expectedVerdict}`);
        console.log(`   Execution Time: ${data.execution_time_ms}ms`);
        console.log(`   Test Results count: ${data.test_results ? data.test_results.length : 0}`);
        
        return true;
    } catch (err) {
        console.error(`❌ Verification failed for ${description}:`, err.response ? err.response.data : err.message);
        process.exit(1);
    }
}

async function verifyRunCode() {
    console.log("=== Verifying Run Code API ===");
    try {
        // 1. Compilation Error
        const ceCode = `
        #include <iostream>
        int main() {
            cout << "Missing namespace and syntax error"
        }
        `;
        await runCodeTest(ceCode, 'Compilation Error', 'Compilation Error', 8);

        // 2. Wrong Answer
        const waCode = `
        #include <iostream>
        int main() {
            std::cout << "Wrong Output" << std::endl;
            return 0;
        }
        `;
        await runCodeTest(waCode, 'Wrong Answer', 'Wrong Answer', 8);

        // 3. Accepted
        // For problem 8 (Maximum Subarray Sum)
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
        await runCodeTest(acCode, 'Accepted', 'Accepted', 8);
        
        // 4. Runtime Error
        const reCode = `
        #include <iostream>
        int main() {
            int* ptr = nullptr;
            *ptr = 42; // Segfault
            return 0;
        }
        `;
        await runCodeTest(reCode, 'Runtime Error', 'Runtime Error', 8);

        // 5. Time Limit Exceeded
        const tleCode = `
        #include <iostream>
        int main() {
            while (true) {} // Infinite loop
            return 0;
        }
        `;
        await runCodeTest(tleCode, 'Time Limit Exceeded', 'Time Limit Exceeded', 8);
        
        console.log("\n🎉 Run Code Verification Complete!");
    } catch (err) {
        console.error(err);
    }
}

verifyRunCode();
