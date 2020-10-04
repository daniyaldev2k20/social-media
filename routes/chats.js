const express = require('express');
const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');

const router = express.Router();

router.use(authController.protect);

router.post('/chat', chatsController.startChat);
router.post('/groupChat', chatsController.startGroupChat);

module.exports = router;
