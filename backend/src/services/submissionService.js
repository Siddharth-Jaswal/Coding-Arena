const pool = require('../config/db');
const { judgeQueue } = require('../queue/judgeQueue');

class SubmissionService {
    async createSubmission(userId, problemId, language, sourceCode) {
        // Validate problem exists
        const problemRes = await pool.query('SELECT id FROM problems WHERE id = $1', [problemId]);
        if (problemRes.rowCount === 0) {
            throw new Error(`Problem ID ${problemId} does not exist.`);
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insert submission
            const result = await client.query(`
                INSERT INTO submissions (user_id, problem_id, language, source_code, status)
                VALUES ($1, $2, $3, $4, 'queued')
                RETURNING id, status
            `, [userId, problemId, language, sourceCode]);

            const submission = result.rows[0];

            // Push to BullMQ inside transaction scope
            await judgeQueue.add('process-submission', {
                submission_id: submission.id,
                user_id: userId,
                problem_id: problemId,
                language: language
            });

            await client.query('COMMIT');

            return {
                submission_id: submission.id,
                status: submission.status
            };
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    }

    async getSubmission(id) {
        const result = await pool.query(`
            SELECT id as submission_id, status, verdict
            FROM submissions
            WHERE id = $1
        `, [id]);

        if (result.rowCount === 0) {
            return null;
        }

        return result.rows[0];
    }

    async getUserSubmissions(userId) {
        const result = await pool.query(`
            SELECT id, problem_id, language, status, verdict, created_at, started_at, finished_at
            FROM submissions
            WHERE user_id = $1
            ORDER BY created_at DESC
        `, [userId]);
        return result.rows;
    }
}

module.exports = new SubmissionService();
