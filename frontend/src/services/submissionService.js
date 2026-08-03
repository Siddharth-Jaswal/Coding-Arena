// Abstract submission service for Milestone 2
// The backend is under active development, so we decouple the UI from actual API endpoints.
// Once backend is finalized, we will swap these implementations to call axios (e.g. apiClient.post)

export const submissionService = {
  /**
   * Simulates running the code against sample test cases.
   * @param {string} problemId 
   * @param {string} code 
   * @param {string} language 
   * @returns Promise resolving to dummy execution results.
   */
  runCode: async (problemId, code, language) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: "Accepted", // 'Accepted', 'Wrong Answer', 'Compilation Error', etc.
          execution_time_ms: Math.floor(Math.random() * 50) + 10,
          memory_mb: (Math.random() * 5 + 1).toFixed(1),
          output: "Simulated output from the abstract runCode service.\nEverything looks good!",
          compiler_output: "Compiled successfully."
        });
      }, 1500); // 1.5s simulated delay
    });
  },

  /**
   * Simulates submitting the code for final judgment against private test cases.
   * @param {string} problemId 
   * @param {string} code 
   * @param {string} language 
   * @returns Promise resolving to dummy submission results.
   */
  submitCode: async (problemId, code, language) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: "Accepted", 
          execution_time_ms: Math.floor(Math.random() * 50) + 20,
          memory_mb: (Math.random() * 5 + 2).toFixed(1),
          verdict: "All test cases passed.",
          score: 100
        });
      }, 2500); // 2.5s simulated delay
    });
  }
};
