const { verifyToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token format' });
        }

        const decoded = verifyToken(token);
        
        // Verify user still exists in database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User not found' });
        }

        // Attach sanitized user to request object
        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            rating: user.rating,
            wins: user.wins,
            losses: user.losses,
            draws: user.draws
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ success: false, message: 'Unauthorized: Token expired' });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token signature' });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
    }
};

module.exports = {
    requireAuth
};
