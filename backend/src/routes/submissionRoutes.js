const express = require('express');
const submissionController = require('../controllers/submissionController');

const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', requireAuth, submissionController.createSubmission);
router.get('/:id', submissionController.getSubmission);

module.exports = router;
