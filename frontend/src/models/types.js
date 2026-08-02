/**
 * @typedef {Object} User
 * @property {string} id - The user ID (represented as string to prevent JS precision loss for BIGINT).
 * @property {string} username - The user's username.
 * @property {string} email - The user's email address.
 * @property {string} created_at - ISO 8601 string of user creation time.
 */

/**
 * @typedef {Object} Problem
 * @property {string} id - The problem ID.
 * @property {string} title - The problem title.
 * @property {string} description - The markdown description of the problem.
 * @property {"easy" | "medium" | "hard"} difficulty - The difficulty level.
 * @property {string} created_at - ISO 8601 string of problem creation time.
 */

/**
 * @typedef {Object} Submission
 * @property {string} id - The submission ID.
 * @property {string} user_id - The user ID who made the submission.
 * @property {string} problem_id - The problem ID.
 * @property {string} language - The programming language used (e.g., 'cpp', 'python').
 * @property {string} source_code - The actual code submitted.
 * @property {"pending" | "accepted" | "wrong_answer" | "runtime_error" | "time_limit_exceeded" | "compilation_error"} verdict - The current status of the submission.
 * @property {string} created_at - ISO 8601 string of submission time.
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - The error message returned by the backend.
 */

/**
 * @typedef {Object} Match
 * @property {string} id - The match ID (future).
 * @property {string} player1_id - The first player (future).
 * @property {string} player2_id - The opponent (future).
 * @property {"waiting" | "in_progress" | "finished"} status - The match status (future).
 */
