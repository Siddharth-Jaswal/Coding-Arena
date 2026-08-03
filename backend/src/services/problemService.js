const provider = require('../providers/filesystemProvider');

class ProblemService {
    /**
     * Retrieves lightweight metadata for all available problems.
     * Returns: Array of { id, title, difficulty, tags }
     */
    async getAllProblems() {
        const folders = await provider.getAllProblemDirectories();
        const problemsMetadata = [];

        for (const folder of folders) {
            const problem = await provider.readProblemJson(folder);
            if (problem) {
                // Extract only lightweight metadata
                problemsMetadata.push({
                    id: problem.id,
                    title: problem.title,
                    difficulty: problem.difficulty,
                    tags: problem.tags || []
                });
            }
        }

        // Sort by problem ID ascending
        problemsMetadata.sort((a, b) => a.id - b.id);
        
        return problemsMetadata;
    }

    /**
     * Retrieves the complete problem definition and its public sample tests.
     * Throws an error with code 'NOT_FOUND' if problem does not exist.
     */
    async getProblemById(id) {
        // ID should be padded to 3 characters (e.g., '1' -> '001')
        const folderName = String(id).padStart(3, '0');
        
        const problem = await provider.readProblemJson(folderName);
        if (!problem) {
            const err = new Error('Problem not found');
            err.code = 'NOT_FOUND';
            throw err;
        }

        const sampleTests = await provider.readPublicSampleTests(folderName);

        return {
            problem,
            sample_tests: sampleTests
        };
    }
}

module.exports = new ProblemService();
