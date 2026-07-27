const pool = require('../config/db');

exports.createUser = async (req, res) => {
    try {
        let { username, email } = req.body;
        
        if (typeof username !== 'string' || typeof email !== 'string') {
            return res.status(400).json({ error: 'username and email must be strings' });
        }
        
        username = username.trim();
        email = email.trim();
        
        if (!username || !email) {
            return res.status(400).json({ error: 'username and email are required and cannot be empty' });
        }
        
        const result = await pool.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
            [username, email]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        console.error('Error in createUser:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
