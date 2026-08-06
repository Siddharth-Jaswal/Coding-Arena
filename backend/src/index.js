require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const problemRoutes = require('./routes/problemRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const runRoutes = require('./routes/runRoutes');
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const matchmakingRoutes = require('./modules/matchmaking/matchmaking.routes');
const { initializeSocket } = require('./socket');
const http = require('http');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/run', runRoutes);
app.use('/api/matchmaking', matchmakingRoutes);

// Initialize Socket.io
initializeSocket(server);

async function startServer() {
    try {
        console.log('Verifying PostgreSQL connection...');
        const result = await pool.query('SELECT NOW();');
        console.log('PostgreSQL connected');
        
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('FATAL: Failed to connect to PostgreSQL.');
        console.error(error.message);
        process.exit(1);
    }
}

startServer();
