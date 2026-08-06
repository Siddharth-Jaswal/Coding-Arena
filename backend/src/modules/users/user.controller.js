const userService = require('./user.service');

const getMe = async (req, res) => {
    // req.user is populated by auth.middleware
    res.status(200).json({
        success: true,
        data: req.user
    });
};

const updateProfile = async (req, res) => {
    try {
        const { displayName, avatar } = req.body;
        
        const updatedUser = await userService.updateUser(req.user.id, { displayName, avatar });
        
        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getMySubmissions = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = parseInt(req.query.offset, 10) || 0;
        
        const submissions = await userService.getUserSubmissions(req.user.id, { limit, offset });
        
        res.status(200).json({
            success: true,
            data: submissions
        });
    } catch (error) {
        console.error('Get Submissions Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

const getMySolvedProblems = async (req, res) => {
    try {
        const solved = await userService.getSolvedProblems(req.user.id);
        
        res.status(200).json({
            success: true,
            data: solved
        });
    } catch (error) {
        console.error('Get Solved Problems Error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getMe,
    updateProfile,
    getMySubmissions,
    getMySolvedProblems
};
