class ProblemProvider {
    /**
     * Define the provider contract for reading problems.
     */
    
    async listProblems() {
        throw new Error("Not implemented: listProblems");
    }

    async getProblemById(id) {
        throw new Error("Not implemented: getProblemById");
    }

    async getPublicTestCases(id) {
        throw new Error("Not implemented: getPublicTestCases");
    }

    async getPrivateTestCases(id) {
        throw new Error("Not implemented: getPrivateTestCases");
    }
}

module.exports = ProblemProvider;
