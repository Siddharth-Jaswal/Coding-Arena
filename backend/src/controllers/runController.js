const runEngine = require('../judge/RunEngine');

exports.createRun = async (req, res) => {
    try {
        const { problem_id, language, source_code } = req.body;

        if (!problem_id || !language || !source_code) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Execute synchronously in-memory
        const result = await runEngine.run(problem_id, language, source_code);

        return res.status(200).json(result);
    } catch (error) {
        console.error('Run Code Error:', error);
        return res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
