const problemService = require('../services/problemService');

exports.getProblems = async (req, res) => {
    try {
        const problems = await problemService.getAllProblems();
        res.status(200).json(problems);
    } catch (error) {
        console.error('Error in getProblems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const problemData = await problemService.getProblemById(id);
        res.status(200).json(problemData);
    } catch (error) {
        if (error.code === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Problem not found' });
        }
        console.error('Error in getProblemById:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
