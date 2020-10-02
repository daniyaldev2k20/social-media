const express = require('express');
const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');

const router = express.Router();

router.post('/chat', authController.protect, chatsController.startChat);
router.post(
  '/groupChat',
  authController.protect,
  chatsController.startGroupChat
);

module.exports = router;
