const matchmakingService = require('./matchmaking.service');

const getStatus = async (req, res) => {
    try {
        const status = await matchmakingService.getQueueStatus();
        res.status(200).json({ success: true, data: status });
    } catch (error) {
        console.error('Error fetching matchmaking status:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getStatus
};
