const express = require('express');
const rateLimit = require('express-rate-limit');
const userController = require('../controllers/user-controller');
const authController = require('../controllers/auth-controller');
const chatsController = require('../controllers/chats-controller');
const postRouter = require('./posts');
const friendsRouter = require('./friends');

const router = express.Router();

const loginLimit = rateLimit({
  max: 3,
  windowMs: 60 * 60 * 1000, //window period for requests
  message: 'Too many login attempts, please try again in an hour',
});

// SignUp/Login/Authentication
router.post('/signup', authController.signUp);
router.post('/login', loginLimit, authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);
router.patch('/updateUser', userController.updateUser);

// User Profile
router.route('/:id/getProfile/').get(userController.getUserProfile);
router.post('/:id/createUserProfile', userController.createUserProfile);
router
  .route('/updateUserProfile/:id')
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateProfile
  );
router.route('/deactivateMe/:id').delete(userController.deactivateProfile);

router.route('/').get(userController.getAllUsers);

router.route('/chat').get(chatsController.startChat);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser);

// User Posts
router.use('/:id/posts', postRouter);

// User Friends
router.use('/:id/friends', friendsRouter);

module.exports = router;
