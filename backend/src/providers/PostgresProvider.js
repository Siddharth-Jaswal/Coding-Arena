const ProblemProvider = require('./ProblemProvider');
const pool = require('../config/db');

class PostgresProvider extends ProblemProvider {
    
    async listProblems() {
        const result = await pool.query(`
            SELECT id, title, difficulty, tags
            FROM problems
            ORDER BY id ASC
        `);
        // Map to exact format expected by frontend
        return result.rows.map(row => ({
            id: parseInt(row.id, 10),
            title: row.title,
            difficulty: row.difficulty, // Canonical casing maintained by DB
            tags: row.tags
        }));
    }

    async getProblemById(id) {
        const result = await pool.query(`
            SELECT id, title, statement, input_format, output_format,
                   constraints, difficulty, tags, time_limit_ms, memory_limit_mb
            FROM problems
            WHERE id = $1
        `, [id]);
        
        if (result.rowCount === 0) return null;
        
        const prob = result.rows[0];
        prob.id = parseInt(prob.id, 10);
        return prob;
    }

    async getPublicTestCases(id) {
        const result = await pool.query(`
            SELECT input_data AS input, output_data AS output
            FROM test_cases
            WHERE problem_id = $1 AND visibility = 'PUBLIC'
            ORDER BY case_order ASC
        `, [id]);
        
        return result.rows;
    }

    async getPrivateTestCases(id) {
        const result = await pool.query(`
            SELECT input_data AS input, output_data AS output
            FROM test_cases
            WHERE problem_id = $1 AND visibility = 'PRIVATE'
            ORDER BY case_order ASC
        `, [id]);
        
        return result.rows;
    }
}

module.exports = new PostgresProvider();
