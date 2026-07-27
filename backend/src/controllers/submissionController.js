const pool = require('../config/db');
const submissionQueue = require('../queues/submissionQueue');

exports.createSubmission = async (req, res) => {
    try {
        const { user_id, problem_id, language, source_code } = req.body;
        
        if (!user_id || !problem_id) {
            return res.status(400).json({ error: 'user_id and problem_id are required' });
        }
        
        if (typeof language !== 'string' || !language.trim()) {
            return res.status(400).json({ error: 'language must be a non-empty string' });
        }
        
        if (typeof source_code !== 'string' || !source_code.trim()) {
            return res.status(400).json({ error: 'source_code must be a non-empty string' });
        }
        
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [user_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const problemCheck = await pool.query('SELECT id FROM problems WHERE id = $1', [problem_id]);
        if (problemCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        const verdict = 'pending';
        
        const result = await pool.query(
            'INSERT INTO submissions (user_id, problem_id, language, source_code, verdict) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, problem_id, language, source_code, verdict]
        );
        
        const submission = result.rows[0];
        
        await submissionQueue.add(
            'judge-submission',
            { submissionId: submission.id },
            { removeOnComplete: 100, removeOnFail: 500 }
        );
        
        res.status(201).json(submission);
    } catch (error) {
        console.error('Error in createSubmission:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM submissions WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error in getSubmissionById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserSubmissions = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const result = await pool.query('SELECT * FROM submissions WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error in getUserSubmissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
