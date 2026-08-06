const express = require('express');
const userController = require('./user.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

// All user routes are protected
router.use(requireAuth);

router.get('/me', userController.getMe);
router.patch('/me', userController.updateProfile);
router.get('/me/submissions', userController.getMySubmissions);
router.get('/me/solved', userController.getMySolvedProblems);

module.exports = router;
