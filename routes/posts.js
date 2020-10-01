const express = require('express');
const postController = require('../controllers/posts-controller');
const authController = require('../controllers/auth-controller');

//mergeParams preserves the req.params value from parent router, if conflicting param
//names arise in parent anc child routes then child takes precedence
//by default each router has access to parameters of their specific routes, in route below
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.get('/getAllPosts', postController.getAllPosts);
router.post('/createPost', postController.createPost);

// Individual Post
router
  .route('/:id')
  .get(postController.getPost)
  .delete(postController.deletePost)
  .patch(postController.updatePost);

// Post comment and like/dislike
router.route('/:id/like').patch(postController.likePost);
router.route('/:id/unlike').patch(postController.unlikePost);
router.route('/:id/comment').post(postController.commentOnPost);
router
  .route('/:id/comment/:comment_id')
  .delete(postController.deleteCommentOnPost);

module.exports = router;
