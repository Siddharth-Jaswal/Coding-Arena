require('dotenv').config();
const { Worker } = require('bullmq');
const fs = require('fs/promises');
const path = require('path');
const { execFile } = require('child_process');
const util = require('util');
const pool = require('../config/db');
const redisConfig = require('../config/redis');

const execFileAsync = util.promisify(execFile);

function normalizeOutput(str) {
    return str.replace(/\r\n/g, '\n')
              .split('\n')
              .map(line => line.trimEnd())
              .join('\n')
              .trimEnd();
}

const worker = new Worker('submission-queue', async job => {
    const { submissionId } = job.data;
    console.log(`Received submission ${submissionId} for judging`);

    let client;
    let workspaceDir;
    try {
        client = await pool.connect();
        
        // 1. Fetch submission and check safety
        const subRes = await client.query('SELECT * FROM submissions WHERE id = $1', [submissionId]);
        if (subRes.rows.length === 0) {
            throw new Error(`Submission ${submissionId} not found in DB.`);
        }
        const submission = subRes.rows[0];

        // BullMQ Retry Safety
        if (submission.verdict !== 'pending') {
            console.log(`Submission ${submissionId} already has verdict '${submission.verdict}'. Skipping.`);
            return;
        }

        if (submission.language !== 'cpp') {
            await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['runtime_error', submissionId]);
            throw new Error(`Language ${submission.language} not supported by Judge v1.`);
        }

        // 2. Fetch problem config
        const problemIdStr = String(submission.problem_id).padStart(3, '0');
        const problemDir = path.resolve(__dirname, '../../../problem_bank/problems', problemIdStr);
        const privateTestsDir = path.join(problemDir, 'private');
        
        let problemConfig;
        try {
            const configData = await fs.readFile(path.join(problemDir, 'problem.json'), 'utf8');
            problemConfig = JSON.parse(configData);
        } catch (e) {
            // Infrastructure error, intentionally do NOT update verdict so it stays pending/retries
            throw new Error(`Could not load problem.json for problem ${submission.problem_id}: ${e.message}`);
        }

        const timeLimitMs = problemConfig.time_limit_ms || 2000;
        const memoryLimitMb = problemConfig.memory_limit_mb || 256;

        // 3. Workspace setup
        const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 1000000);
        const compileContainerName = `compile-${submissionId}-${uniqueId}`;
        const runContainerName = `run-${submissionId}-${uniqueId}`;
        workspaceDir = path.resolve(__dirname, '../../../tmp/judge', `${submissionId}-${uniqueId}`);
        await fs.mkdir(workspaceDir, { recursive: true });
        
        const mainCppPath = path.join(workspaceDir, 'main.cpp');
        await fs.writeFile(mainCppPath, submission.source_code);

        // 4. Docker Compilation
        try {
            await execFileAsync('docker', [
                'run', '--rm', '--name', compileContainerName,
                '--network', 'none',
                '--memory', '512m',
                '--memory-swap', '512m',
                '--pids-limit', '64',
                '--cpus', '1',
                '--cap-drop', 'ALL',
                '--security-opt', 'no-new-privileges',
                '-v', `${workspaceDir}:/workspace`, // Read-write for compile
                '-w', '/workspace',
                'gcc:14', // Pinned image
                'g++', '-std=c++17', '-O2', '-o', 'main', 'main.cpp'
            ], { timeout: 15000, maxBuffer: 1024 * 1024 });
        } catch (e) {
            await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['compilation_error', submissionId]);
            return;
        }

        // 5. Execution Phase
        let files;
        try {
            files = await fs.readdir(privateTestsDir);
        } catch (e) {
             throw new Error(`Could not read private test directory: ${e.message}`);
        }
        
        const inputFiles = files.filter(f => f.endsWith('.in')).sort();
        
        for (const inFile of inputFiles) {
            const baseName = inFile.slice(0, -3);
            const outFile = `${baseName}.out`;
            
            const inPath = path.join(privateTestsDir, inFile);
            const outPath = path.join(privateTestsDir, outFile);
            
            let expectedOutput = '';
            try {
                expectedOutput = await fs.readFile(outPath, 'utf8');
            } catch (e) {
                throw new Error(`Missing expected output file ${outFile}`);
            }

            const inputData = await fs.readFile(inPath, 'utf8');

            let actualOutput = '';
            try {
                const childPromise = execFileAsync('docker', [
                    'run', '--rm', '-i', '--name', runContainerName,
                    '--network', 'none',
                    '--memory', `${memoryLimitMb}m`,
                    '--memory-swap', `${memoryLimitMb}m`,
                    '--pids-limit', '64',
                    '--cpus', '1',
                    '--cap-drop', 'ALL',
                    '--security-opt', 'no-new-privileges',
                    '-v', `${workspaceDir}:/workspace:ro`, // Read-only for execution!
                    '-w', '/workspace',
                    'gcc:14', // Pinned image
                    './main'
                ], { 
                    timeout: timeLimitMs + 2000,
                    maxBuffer: 1024 * 1024 // 1 MB limit
                });
                
                childPromise.child.stdin.write(inputData);
                childPromise.child.stdin.end();

                const { stdout } = await childPromise;
                actualOutput = stdout;
            } catch (e) {
                if (e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
                    await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['runtime_error', submissionId]);
                    return;
                }
                if (e.killed || e.signal === 'SIGTERM' || e.code === 'ETIMEDOUT' || (e.message && e.message.includes('timeout'))) {
                    await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['time_limit_exceeded', submissionId]);
                    return;
                }
                
                await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['runtime_error', submissionId]);
                return;
            }

            // 6. Comparison Phase
            const normExpected = normalizeOutput(expectedOutput);
            const normActual = normalizeOutput(actualOutput);

            if (normExpected !== normActual) {
                await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['wrong_answer', submissionId]);
                return;
            }
        }

        // 7. All tests passed
        await client.query('UPDATE submissions SET verdict = $1 WHERE id = $2', ['accepted', submissionId]);

    } catch (e) {
        console.error(`Job execution failed fundamentally: ${e.message}`);
        throw e;
    } finally {
        if (client) client.release();
        
        // Force reap any orphaned containers caused by node timeouts
        try {
            await execFileAsync('docker', ['rm', '-f', compileContainerName, runContainerName]);
        } catch (e) {
            // Ignore if containers don't exist
        }

        if (workspaceDir) {
            try {
                await fs.rm(workspaceDir, { recursive: true, force: true });
            } catch (cleanupErr) {
                console.error(`Failed to cleanup workspace ${workspaceDir}: ${cleanupErr.message}`);
            }
        }
    }
}, {
    connection: redisConfig
});

worker.on('completed', job => {
    console.log(`Job ${job.id} completed successfully for submission ${job.data.submissionId}`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job.id} failed for submission ${job.data.submissionId}: ${err.message}`);
});

console.log('Submission worker started and listening to submission-queue');
