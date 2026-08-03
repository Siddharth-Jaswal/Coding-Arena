const fs = require('fs/promises');
const { spawn } = require('child_process');

class Executor {
    /**
     * Executes the compiled program with the given input file.
     * @param {string} executablePath 
     * @param {string} inputFilePath 
     * @returns {Promise<string>} Program's standard output
     */
    async run(executablePath, inputFilePath) {
        return new Promise((resolve, reject) => {
            const child = spawn(executablePath);

            let stdoutData = '';
            let stderrData = '';

            child.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderrData += data.toString();
            });

            child.on('close', (code) => {
                // Ignore code for now as we don't have Runtime Error verdict explicitly supported yet.
                // Outputting stdout directly
                resolve(stdoutData);
            });

            child.on('error', (err) => {
                reject(err);
            });

            // Feed the input file into stdin
            fs.readFile(inputFilePath)
                .then(inputBuffer => {
                    child.stdin.write(inputBuffer);
                    child.stdin.end();
                })
                .catch(err => {
                    child.kill();
                    reject(err);
                });
        });
    }
}

module.exports = new Executor();
