const fs = require('fs');
const path = require('path');
const ProblemProvider = require('./ProblemProvider');

/**
 * FilesystemProvider
 * 
 * Used ONLY by importProblemBank.js.
 * This should NEVER be used by runtime APIs!
 */
class FilesystemProvider extends ProblemProvider {
    constructor() {
        super();
        this.baseDir = path.join(__dirname, '../../../problem_bank/problems');
    }

    async listProblems() {
        // Only used by importer if it wanted a list, but our importer scans directly
        throw new Error("listProblems not supported in import-only provider");
    }

    async getProblemById(id) {
        const paddedId = String(id).padStart(3, '0');
        const probDir = path.join(this.baseDir, paddedId);
        const jsonPath = path.join(probDir, 'problem.json');
        
        if (!fs.existsSync(jsonPath)) return null;
        return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    async getPublicTestCases(id) {
        return this._getTests(id, 'public');
    }

    async getPrivateTestCases(id) {
        return this._getTests(id, 'private');
    }

    _getTests(id, dirName) {
        const paddedId = String(id).padStart(3, '0');
        const dirPath = path.join(this.baseDir, paddedId, dirName);
        
        if (!fs.existsSync(dirPath)) return [];
        
        const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.in')).sort();
        const tests = [];
        
        for (const inFile of files) {
            const outFile = inFile.replace('.in', '.out');
            tests.push({
                input: fs.readFileSync(path.join(dirPath, inFile), 'utf8'),
                output: fs.readFileSync(path.join(dirPath, outFile), 'utf8')
            });
        }
        
        return tests;
    }
}

module.exports = new FilesystemProvider();
