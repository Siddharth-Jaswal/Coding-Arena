require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const pool = require('../src/config/db');

const API_URL = 'http://localhost:5000/api/submissions';

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function verify() {
    console.log("=== Verifying Submission Pipeline ===");

    try {
        // 1. Submit Code
        console.log("\n1. Creating submission...");
        const postRes = await axios.post(API_URL, {
            user_id: 1,
            problem_id: 1,
            language: "javascript",
            source_code: "console.log('Hello World');"
        });

        const { submission_id, status: initialStatus } = postRes.data;
        console.log(`✅ Submission created. ID: ${submission_id}`);
        
        if (initialStatus !== 'queued') {
            console.error(`❌ Expected initial status 'queued', got '${initialStatus}'`);
            process.exit(1);
        }
        console.log(`✅ Initial status is 'queued'.`);

        // 2. Poll Status
        console.log("\n2. Polling submission status...");
        let currentStatus = initialStatus;
        let finalVerdict = null;
        let sawRunning = false;

        for (let i = 0; i < 15; i++) {
            await delay(500); // poll every 500ms
            
            const getRes = await axios.get(`${API_URL}/${submission_id}`);
            const data = getRes.data;
            
            if (data.status !== currentStatus) {
                console.log(`   Status changed: ${currentStatus} -> ${data.status}`);
                currentStatus = data.status;
            }

            if (currentStatus === 'running') {
                sawRunning = true;
            }

            if (currentStatus === 'completed') {
                finalVerdict = data.verdict;
                break;
            }
        }

        if (!sawRunning) {
            console.warn(`⚠️ Never saw 'running' state (it might have processed too fast).`);
        } else {
            console.log(`✅ Submission successfully entered 'running' state.`);
        }

        if (currentStatus !== 'completed') {
            console.error(`❌ Submission stuck in state: ${currentStatus}`);
            process.exit(1);
        }
        
        console.log(`✅ Submission reached 'completed' state.`);
        
        if (finalVerdict !== 'Accepted') {
            console.error(`❌ Expected verdict 'Accepted', got '${finalVerdict}'`);
            process.exit(1);
        }
        console.log(`✅ Final verdict is 'Accepted'.`);

        // 3. Verify Database
        console.log("\n3. Verifying Database state...");
        const dbRes = await pool.query('SELECT status, verdict, started_at, finished_at FROM submissions WHERE id = $1', [submission_id]);
        const row = dbRes.rows[0];

        if (row.status !== 'completed' || row.verdict !== 'Accepted') {
            console.error(`❌ DB state mismatch: status=${row.status}, verdict=${row.verdict}`);
            process.exit(1);
        }
        
        if (!row.started_at || !row.finished_at) {
            console.error(`❌ DB timestamps missing: started_at=${row.started_at}, finished_at=${row.finished_at}`);
            process.exit(1);
        }

        console.log(`✅ Database status and verdict are correct.`);
        console.log(`✅ Database started_at and finished_at are properly recorded.`);

        console.log("\n🎉 Pipeline verification complete! All requirements met.");

    } catch (err) {
        console.error("❌ Verification failed:", err.response ? err.response.data : err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

verify();
