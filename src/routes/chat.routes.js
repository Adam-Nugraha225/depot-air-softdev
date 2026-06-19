const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', chatController.getActiveChats);
router.get('/:userId', chatController.getMessages);
router.post('/', chatController.sendMessage);

module.exports = router;
