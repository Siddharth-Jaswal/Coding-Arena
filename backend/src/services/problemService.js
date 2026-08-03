const postgresProvider = require('../providers/PostgresProvider');

class ProblemService {
    /**
     * Retrieves lightweight metadata for all available problems.
     * Returns: Array of { id, title, difficulty, tags }
     */
    async getAllProblems() {
        return await postgresProvider.listProblems();
    }

    /**
     * Retrieves the complete problem definition and its public sample tests.
     * Throws an error with code 'NOT_FOUND' if problem does not exist.
     */
    async getProblemById(id) {
        const problem = await postgresProvider.getProblemById(id);
        if (!problem) {
            const err = new Error('Problem not found');
            err.code = 'NOT_FOUND';
            throw err;
        }

        const sampleTests = await postgresProvider.getPublicTestCases(id);

        return {
            problem,
            sample_tests: sampleTests
        };
    }
}

module.exports = new ProblemService();
