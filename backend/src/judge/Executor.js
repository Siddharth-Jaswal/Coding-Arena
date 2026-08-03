const fs = require('fs/promises');
const { spawn } = require('child_process');

class Executor {
    /**
     * Executes the compiled program with the given input file.
     * @param {string} executablePath 
     * @param {string} inputFilePath 
     * @returns {Promise<string>} Program's standard output
     */
    async run(executablePath, inputFilePath, timeLimitMs = 2000) {
        return new Promise((resolve, reject) => {
            const child = spawn(executablePath);

            let stdoutData = '';
            let stderrData = '';
            let isKilled = false;

            const startTime = performance.now();

            const timer = setTimeout(() => {
                isKilled = true;
                child.kill('SIGKILL');
            }, timeLimitMs);

            child.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            child.on('close', (code, signal) => {
                clearTimeout(timer);
                const endTime = performance.now();
                const executionTimeMs = Math.round(endTime - startTime);

                if (isKilled) {
                    return reject(new Error("Time Limit Exceeded"));
                }

                if (code !== 0 || signal) {
                    return reject(new Error("Runtime Error"));
                }

                resolve({ stdoutData, executionTimeMs });
            });

            child.on('error', (err) => {
                clearTimeout(timer);
                reject(err);
            });

            // Feed the input file into stdin
            child.stdin.on('error', (err) => {
                // Ignore EPIPE and EOF errors (happens if child exits before reading all input)
                if (err.code !== 'EPIPE' && err.code !== 'EOF') {
                    console.error('stdin error:', err);
                }
            });

            fs.readFile(inputFilePath)
                .then(inputBuffer => {
                    if (!child.killed) {
                        child.stdin.write(inputBuffer);
                        child.stdin.end();
                    }
                })
                .catch(err => {
                    clearTimeout(timer);
                    child.kill();
                    reject(err);
                });
        });
    }
}

module.exports = new Executor();
