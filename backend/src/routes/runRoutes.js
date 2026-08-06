const express = require('express');
const runController = require('../controllers/runController');

const router = express.Router();

router.post('/', runController.createRun);

module.exports = router;
