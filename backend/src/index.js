require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

async function startServer() {
    try {
        console.log('Verifying PostgreSQL connection...');
        const result = await pool.query('SELECT NOW();');
        console.log('PostgreSQL connected');
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('FATAL: Failed to connect to PostgreSQL.');
        console.error(error.message);
        process.exit(1);
    }
}

startServer();
