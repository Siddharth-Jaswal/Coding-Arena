const express = require('express');
const submissionController = require('../controllers/submissionController');

const router = express.Router();

router.post('/', submissionController.createSubmission);
router.get('/:id', submissionController.getSubmission);

module.exports = router;
