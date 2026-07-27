const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const submissionController = require('../controllers/submissionController');

router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.get('/:userId/submissions', submissionController.getUserSubmissions);

module.exports = router;
