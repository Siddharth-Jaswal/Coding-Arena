const path = require('path');
const fs = require('fs/promises');
const pool = require('../config/db');
const googleDriveProvider = require('../storage/GoogleDriveProvider');
const cppCompiler = require('./CppCompiler');
const executor = require('./Executor');
const outputComparator = require('./OutputComparator');

class JudgeEngine {
    async run(submissionId) {
        // 1. Fetch submission
        const subRes = await pool.query(`
            SELECT problem_id, language, source_code 
            FROM submissions 
            WHERE id = $1
        `, [submissionId]);

        if (subRes.rowCount === 0) {
            throw new Error(`Submission ${submissionId} not found`);
        }
        
        const { problem_id, language, source_code } = subRes.rows[0];

        if (language !== 'cpp' && language !== 'cpp17' && language !== 'c++') {
            return "Compilation Error"; // Minimal judge only supports C++
        }

        // 2. Fetch hidden test cache directory
        let cacheDir;
        try {
            const isCached = await googleDriveProvider.verifyCache(problem_id);
            if (!isCached) {
                cacheDir = await googleDriveProvider.downloadArchive(problem_id);
            } else {
                const paddedId = String(problem_id).padStart(3, '0');
                cacheDir = path.join(googleDriveProvider.cacheDir, paddedId);
            }
        } catch (error) {
            console.error(`Failed to fetch assets for problem ${problem_id}:`, error);
            throw error; // Let worker handle it
        }

        const runDir = path.join(__dirname, '..', '..', 'judge', 'runs', String(submissionId));
        
        // 3. Compile
        let executablePath;
        try {
            executablePath = await cppCompiler.compile(source_code, runDir);
        } catch (error) {
            if (error.message === 'Compilation Error') {
                return "Compilation Error";
            }
            throw error;
        }

        // 4. Execute
        // Expecting 001.in and 001.out directly inside the extracted zip
        const inputFilePath = path.join(cacheDir, '001.in');
        const expectedOutputPath = path.join(cacheDir, '001.out');
        
        let actualOutput;
        try {
            actualOutput = await executor.run(executablePath, inputFilePath);
        } catch (error) {
            console.error('Execution error:', error);
            // Ignore runtime errors per spec, but return Wrong Answer for safety if it crashes
            return "Wrong Answer";
        }

        // 5. Compare
        const verdict = await outputComparator.compare(actualOutput, expectedOutputPath);
        
        // Clean up run dir asynchronously (optional, but good practice)
        fs.rm(runDir, { recursive: true, force: true }).catch(() => {});

        return verdict;
    }
}

module.exports = new JudgeEngine();
