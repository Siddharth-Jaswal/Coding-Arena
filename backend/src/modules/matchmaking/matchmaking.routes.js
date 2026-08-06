const express = require('express');
const matchmakingController = require('./matchmaking.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/status', matchmakingController.getStatus);

module.exports = router;
