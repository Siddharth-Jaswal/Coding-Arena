const submissionService = require('../services/submissionService');

class SubmissionController {
    async createSubmission(req, res) {
        try {
            const { problem_id, language, source_code } = req.body;
            const user_id = req.user.id; // from auth middleware

            if (!problem_id || !language || !source_code) {
                return res.status(400).json({ error: 'problem_id, language, and source_code are required' });
            }

            const submission = await submissionService.createSubmission(user_id, problem_id, language, source_code);
            return res.status(201).json(submission);
        } catch (error) {
            if (error.message.includes('does not exist')) {
                return res.status(404).json({ error: error.message });
            }
            console.error('Error creating submission:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getSubmission(req, res) {
        try {
            const { id } = req.params;
            const submission = await submissionService.getSubmission(id);

            if (!submission) {
                return res.status(404).json({ error: 'Submission not found' });
            }

            return res.json(submission);
        } catch (error) {
            console.error('Error getting submission:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    async getUserSubmissions(req, res) {
        try {
            const { userId } = req.params;
            const submissions = await submissionService.getUserSubmissions(userId);
            return res.json(submissions);
        } catch (error) {
            console.error('Error getting user submissions:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new SubmissionController();
