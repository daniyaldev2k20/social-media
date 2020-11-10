const express = require('express');
const homePageController = require('../controllers/home-page-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router();

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

router.get('/chat', authController.protect, homePageController.getChatFeature);

module.exports = router;
