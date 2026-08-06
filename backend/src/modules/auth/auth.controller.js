const authService = require('./auth.service');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Basic validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long'
            });
        }
        
        if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
            return res.status(400).json({
                success: false,
                message: 'Username must be 3-20 alphanumeric characters'
            });
        }

        const result = await authService.registerUser({ username, email, password });
        
        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message === 'Username is already taken' || error.message === 'Email is already registered') {
            return res.status(409).json({ success: false, message: error.message });
        }
        console.error('Registration Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const result = await authService.loginUser({ email, password });

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return res.status(401).json({ success: false, message: error.message });
        }
        console.error('Login Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    register,
    login
};
