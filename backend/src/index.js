require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const problemRoutes = require('./routes/problemRoutes');
const userRoutes = require('./routes/userRoutes');
const submissionRoutes = require('./routes/submissionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/problems', problemRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);

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
