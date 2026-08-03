const http = require('http');

const API_URL = 'http://localhost:5000/api';

async function fetchJson(path) {
    return new Promise((resolve, reject) => {
        http.get(`${API_URL}${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: JSON.parse(data)
                });
            });
        }).on('error', err => reject(err));
    });
}

async function runVerification() {
    console.log('=== Verifying Problem Browser API ===\n');
    let hasError = false;

    try {
        // 1. Verify GET /api/problems
        console.log('1. Testing GET /api/problems');
        const listRes = await fetchJson('/problems');
        
        if (listRes.status !== 200) {
            console.error(`❌ Expected status 200, got ${listRes.status}`);
            hasError = true;
        }

        const problems = listRes.body;
        if (!Array.isArray(problems) || problems.length === 0) {
            console.error('❌ Expected a non-empty array of problems');
            hasError = true;
        } else {
            console.log(`✅ Returned ${problems.length} problems`);
            
            // Check sorting
            let isSorted = true;
            for (let i = 1; i < problems.length; i++) {
                if (problems[i].id < problems[i-1].id) isSorted = false;
            }
            if (!isSorted) {
                console.error('❌ Problems are not sorted by ID');
                hasError = true;
            } else {
                console.log('✅ Problems are sorted by ID');
            }

            // Check metadata constraints
            const first = problems[0];
            if (!first.id || !first.title || !first.difficulty || !first.tags) {
                console.error('❌ Missing expected metadata fields in /problems response');
                hasError = true;
            }
            if (first.statement || first.sample_tests || first.time_limit_ms) {
                console.error('❌ GET /api/problems is leaking heavy fields (e.g. statement, limits)');
                hasError = true;
            } else {
                console.log('✅ Lightweight metadata confirmed');
            }
        }
        console.log('');

        // 2. Verify GET /api/problems/:id
        console.log('2. Testing GET /api/problems/1');
        const detailRes = await fetchJson('/problems/1');

        if (detailRes.status !== 200) {
            console.error(`❌ Expected status 200, got ${detailRes.status}`);
            hasError = true;
        } else {
            const data = detailRes.body;
            if (!data.problem || !data.sample_tests) {
                console.error('❌ Missing problem or sample_tests in response');
                hasError = true;
            } else {
                if (!data.problem.statement || !data.problem.time_limit_ms) {
                    console.error('❌ Problem object is missing canonical fields (e.g. statement)');
                    hasError = true;
                } else {
                    console.log('✅ Canonical schema returned');
                }

                if (!Array.isArray(data.sample_tests) || data.sample_tests.length === 0) {
                    console.error('❌ Sample tests missing or empty');
                    hasError = true;
                } else {
                    const sample = data.sample_tests[0];
                    if (typeof sample.input !== 'string' || typeof sample.output !== 'string') {
                        console.error('❌ Sample tests are incorrectly formatted');
                        hasError = true;
                    } else {
                        console.log(`✅ Sample tests parsed successfully (${data.sample_tests.length} found)`);
                    }
                }
            }
        }
        console.log('');

        // 3. Verify Invalid ID
        console.log('3. Testing GET /api/problems/999 (Invalid ID)');
        const invalidRes = await fetchJson('/problems/999');
        
        if (invalidRes.status !== 404) {
            console.error(`❌ Expected status 404, got ${invalidRes.status}`);
            hasError = true;
        } else {
            if (invalidRes.body.error !== 'Problem not found') {
                console.error('❌ Expected error message "Problem not found"');
                hasError = true;
            } else {
                console.log('✅ 404 Not Found returned successfully');
            }
        }
        
        // 4. Verify no path leakage
        console.log('\n4. Verifying no path leakage');
        const leakCheckStr = JSON.stringify(invalidRes.body) + JSON.stringify(detailRes.body) + JSON.stringify(listRes.body);
        if (leakCheckStr.includes('D:\\') || leakCheckStr.includes('/problem_bank')) {
            console.error('❌ API responses are leaking filesystem paths!');
            hasError = true;
        } else {
            console.log('✅ No filesystem paths leaked');
        }

    } catch (err) {
        console.error('\n❌ Verification script failed with an unexpected error:', err.message);
        hasError = true;
    }

    console.log('\n=== Verification Result ===');
    if (hasError) {
        console.error('❌ Some tests failed. Please fix the API.');
        process.exit(1);
    } else {
        console.log('🎉 All endpoints verified successfully!');
        process.exit(0);
    }
}

runVerification();
