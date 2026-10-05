const friendService = require('./friend.service');

exports.getFriends = async (req, res) => {
    try {
        const friends = await friendService.getFriends(req.user.id);
        res.json({ success: true, friends });
    } catch (err) {
        console.error('getFriends error:', err);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
};

exports.getRequests = async (req, res) => {
    try {
        const requests = await friendService.getRequests(req.user.id);
        res.json({ success: true, ...requests });
    } catch (err) {
        console.error('getRequests error:', err);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
};

exports.sendRequest = async (req, res) => {
    try {
        const { target } = req.body;
        if (!target) {
            return res.status(400).json({ success: false, error: 'Target username or ID is required' });
        }
        const result = await friendService.sendRequest(req.user.id, target);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.respondToRequest = async (req, res) => {
    try {
        const { requestId, action } = req.body;
        if (!requestId || !action) {
            return res.status(400).json({ success: false, error: 'requestId and action (ACCEPT/REJECT) are required' });
        }
        const result = await friendService.respondToRequest(req.user.id, requestId, action);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;
        const result = await friendService.removeFriend(req.user.id, friendId);
        res.json(result);
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const users = await friendService.searchUsers(req.user.id, q || '');
        res.json({ success: true, users });
    } catch (err) {
        console.error('searchUsers error:', err);
        res.status(500).json({ success: false, error: err.message || 'Internal server error' });
    }
};
