const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class CppCompiler {
    /**
     * Compiles C++ source code.
     * @param {string} sourceCode 
     * @param {string} runDir 
     * @returns {Promise<string>} Path to the executable, or throws "Compilation Error"
     */
    async compile(sourceCode, runDir) {
        await fs.mkdir(runDir, { recursive: true });
        
        const sourcePath = path.join(runDir, 'source.cpp');
        const executablePath = path.join(runDir, process.platform === 'win32' ? 'solution.exe' : 'solution');
        
        await fs.writeFile(sourcePath, sourceCode, 'utf8');

        try {
            await execPromise(`g++ -std=c++17 -O2 "${sourcePath}" -o "${executablePath}"`);
            return executablePath;
        } catch (error) {
            throw new Error('Compilation Error');
        }
    }
}

module.exports = new CppCompiler();
