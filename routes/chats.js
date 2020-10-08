const express = require('express');
// const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');

const router = express.Router();

router.get('/sendMessage', chatsController.sendMessageToClient);
router.post('/getMessage', chatsController.getMessages);

module.exports = router;
