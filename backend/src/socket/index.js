const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { pubClient, subClient } = require('../redis/client');
const { verifyToken } = require('../utils/jwt');
const { registerHandlers } = require('./handlers');
const config = require('../config');

const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.allowedOrigins,
            methods: ['GET', 'POST']
        }
    });

    // Use Redis Adapter for multi-process broadcasting (Judge integration)
    io.adapter(createAdapter(pubClient, subClient));

    // Middleware for Authentication
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error('Unauthorized: No token provided'));
            }

            // Verify JWT
            const decoded = verifyToken(token);
            
            // Attach user to socket. 
            // DB lookup omitted intentionally per architecture design.
            socket.user = {
                id: decoded.userId,
                username: decoded.username,
                rating: decoded.rating || 1500
            };

            next();
        } catch (error) {
            next(new Error('Unauthorized: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} (User: ${socket.user.username})`);
        
        // Register all socket handlers
        registerHandlers(io, socket);
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = {
    initializeSocket,
    getIo
};
