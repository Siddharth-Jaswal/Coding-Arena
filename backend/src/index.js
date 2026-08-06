const config = require('./config');
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

const PORT = config.port;

app.use(cors({
    origin: config.allowedOrigins
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'code_arena_api',
        environment: config.nodeEnv,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.use('/api/problems', problemRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/run', runRoutes);
app.use('/api/matchmaking', matchmakingRoutes);

// Initialize Socket.io
initializeSocket(server);

const { redisClient, pubClient, subClient } = require('./redis/client');

async function startServer() {
    try {
        await pool.query('SELECT NOW();');
        console.log('[API] Database Connected');
        
        // Redis connection is implicit in ioredis, but we can verify it
        if (redisClient.status === 'ready') {
             console.log('[API] Redis Connected');
        }
        
        server.listen(PORT, () => {
            console.log('[API] Socket.IO Started');
            console.log(`[API] Listening on Port ${PORT}`);
        });
    } catch (error) {
        console.error('FATAL: Failed to start server.');
        console.error(error.message);
        process.exit(1);
    }
}

async function gracefulShutdown() {
    console.log('\n[API] Initiating graceful shutdown...');
    try {
        console.log('[API] 1. Stopping HTTP server');
        await new Promise((resolve) => server.close(resolve));
        
        const { getIo } = require('./socket');
        console.log('[API] 2. Closing Socket.IO');
        getIo().close();

        console.log('[API] 3. Disconnecting Redis');
        await redisClient.quit();
        await pubClient.quit();
        await subClient.quit();

        console.log('[API] 4. Disconnecting Database');
        await pool.end();
        
        console.log('[API] Shutdown complete.');
        process.exit(0);
    } catch (err) {
        console.error('[API] Error during shutdown:', err);
        process.exit(1);
    }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();
