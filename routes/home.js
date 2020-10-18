const express = require('express');
const homePageController = require('../controllers/home-page-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

//Rendering pug templates
router.get('/', authController.isLoggedIn, homePageController.getHomePage);

router.get(
  '/login',
  authController.isLoggedIn,
  homePageController.getLoginForm
);

router.get(
  '/signup',
  authController.isLoggedIn,
  homePageController.getSignUpForm
);

router.get('/chat', authController.protect, homePageController.getChatPage);

module.exports = router;
