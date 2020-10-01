const express = require('express');
const friendsController = require('../controllers/friends-controller');
const authController = require('../controllers/auth-controller');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/').get(friendsController.getAllFriends);

router.route('/getFriend').get(friendsController.getFriend);
router
  .route('/sendFriendRequest')
  .post(friendsController.checkFriends, friendsController.sendFriendRequest);
router
  .route('/acceptFriendRequest')
  .post(friendsController.acceptFriendRequest);
router
  .route('/rejectFriendRequest')
  .post(friendsController.rejectFriendRequest);

module.exports = router;
