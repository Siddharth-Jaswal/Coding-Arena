const fs = require('fs/promises');
const path = require('path');

const PROBLEM_BANK_DIR = path.resolve(__dirname, '../../../problem_bank/problems');

class FilesystemProvider {
    /**
     * Scans the problem bank and returns all valid numeric directory names (e.g. '001').
     * Ignores non-numeric files/folders like .DS_Store or README.md.
     */
    async getAllProblemDirectories() {
        try {
            const entries = await fs.readdir(PROBLEM_BANK_DIR, { withFileTypes: true });
            const validDirs = entries
                .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
                .map(entry => entry.name);
            return validDirs;
        } catch (error) {
            console.error('FilesystemProvider error: Failed to read problem bank directory', error);
            throw error;
        }
    }

    /**
     * Reads and parses problem.json for a specific problem folder.
     */
    async readProblemJson(folderName) {
        const jsonPath = path.join(PROBLEM_BANK_DIR, folderName, 'problem.json');
        try {
            const data = await fs.readFile(jsonPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') return null; // File doesn't exist
            console.error(`FilesystemProvider error: Failed to read ${jsonPath}`, error);
            throw error;
        }
    }

    /**
     * Scans the public directory of a problem and returns paired sample tests.
     * Output schema: [{ input: "...", output: "..." }]
     */
    async readPublicSampleTests(folderName) {
        const publicDir = path.join(PROBLEM_BANK_DIR, folderName, 'public');
        
        try {
            const entries = await fs.readdir(publicDir, { withFileTypes: true });
            
            // Map files by base name (e.g., '01' from '01.in')
            const testsMap = new Map();
            
            for (const entry of entries) {
                if (!entry.isFile()) continue;
                
                const ext = path.extname(entry.name);
                const base = path.basename(entry.name, ext);
                
                if (ext !== '.in' && ext !== '.out') continue;
                
                if (!testsMap.has(base)) {
                    testsMap.set(base, { input: '', output: '' });
                }
                
                const filePath = path.join(publicDir, entry.name);
                const content = await fs.readFile(filePath, 'utf8');
                
                if (ext === '.in') {
                    testsMap.get(base).input = content;
                } else if (ext === '.out') {
                    testsMap.get(base).output = content;
                }
            }
            
            // Convert to array and sort by test name (e.g. 01, 02) to maintain predictable order
            const sortedKeys = Array.from(testsMap.keys()).sort();
            return sortedKeys.map(key => testsMap.get(key));

        } catch (error) {
            if (error.code === 'ENOENT') {
                // Return empty array if public/ directory doesn't exist at all
                return [];
            }
            console.error(`FilesystemProvider error: Failed to read tests from ${publicDir}`, error);
            throw error;
        }
    }
}

module.exports = new FilesystemProvider();
