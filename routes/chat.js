const express = require('express');
const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');

const router = express.Router();

router.use(authController.protect);

router.get('/start-chat', chatsController.startChat);

module.exports = router;
