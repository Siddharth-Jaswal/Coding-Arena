const pool = require('../config/db');

exports.createProblem = async (req, res) => {
    try {
        const { title, description, difficulty } = req.body;
        
        if (!title || !description || !difficulty) {
            return res.status(400).json({ error: 'title, description, and difficulty are required' });
        }
        
        if (!['easy', 'medium', 'hard'].includes(difficulty)) {
            return res.status(400).json({ error: 'difficulty must be easy, medium, or hard' });
        }
        
        const result = await pool.query(
            'INSERT INTO problems (title, description, difficulty) VALUES ($1, $2, $3) RETURNING *',
            [title, description, difficulty]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error in createProblem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProblems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM problems ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error in getProblems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM problems WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error in getProblemById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
