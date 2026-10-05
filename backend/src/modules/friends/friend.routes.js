const express = require('express');
const friendController = require('./friend.controller');
const { requireAuth } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(requireAuth);

router.get('/', friendController.getFriends);
router.get('/requests', friendController.getRequests);
router.post('/request', friendController.sendRequest);
router.post('/respond', friendController.respondToRequest);
router.delete('/:friendId', friendController.removeFriend);
router.get('/search', friendController.searchUsers);

module.exports = router;
