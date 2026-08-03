const fs = require('fs/promises');

class OutputComparator {
    /**
     * Compares actual output with expected output.
     * @param {string} actualOutput 
     * @param {string} expectedOutputPath 
     * @returns {Promise<string>} 'Accepted' or 'Wrong Answer'
     */
    async compare(actualOutput, expectedOutputPath) {
        const expectedBuffer = await fs.readFile(expectedOutputPath);
        const expectedOutput = expectedBuffer.toString('utf8');

        const normalizedActual = actualOutput.trim().replace(/\r\n/g, '\n');
        const normalizedExpected = expectedOutput.trim().replace(/\r\n/g, '\n');

        console.log(`[DEBUG] Actual: '${normalizedActual}'`);
        console.log(`[DEBUG] Expected: '${normalizedExpected}'`);

        if (normalizedActual === normalizedExpected) {
            return 'Accepted';
        } else {
            return 'Wrong Answer';
        }
    }
}

module.exports = new OutputComparator();
