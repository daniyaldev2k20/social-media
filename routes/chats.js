const express = require('express');
const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');

const router = express.Router();

router.use(authController.protect);

router.get('/startChat', chatsController.startChat);

module.exports = router;
