const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.post('/', problemController.createProblem);
router.get('/', problemController.getProblems);
router.get('/:id', problemController.getProblemById);

module.exports = router;
