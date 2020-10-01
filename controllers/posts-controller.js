const User = require('../models/User');
const Post = require('../models/Post');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create({
    user: req.user.id,
    post: req.body.post,
  });

  res.status(201).json({
    status: 'success',
    data: {
      newPost,
    },
  });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find().sort({ date: -1 });

  res.status(200).json({
    status: 'success',
    data: {
      postsLength: posts.length,
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findOne(req.params.id);

  if (!post) {
    return next(new AppError('No post not found with specified id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post not found with specified id', 404));
  }

  await post.remove();

  res.status(204).json({
    status: 'success',
    message: 'Post removed',
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError('No post not found with specified id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      post,
    },
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  //If post has already been liked
  if (post.likes.some((el) => el.user.toString() === req.user.id)) {
    return next();
  }

  post.likes.unshift({ user: req.user.id });

  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      likes: post.likes,
    },
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  //If post has not been liked
  if (!post.likes.some((el) => el.user.toString() === req.user.id)) {
    return next();
  }

  post.likes.filter(({ user }) => user.toString !== req.user.id);

  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      likes: post.likes,
    },
  });
});

exports.commentOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  const user = await User.findById(req.user.id);

  const userComment = {
    user,
    comment: req.body.comment,
  };

  post.comments.unshift(userComment);

  res.status(200).json({
    status: 'success',
    data: {
      comments: post.comments,
    },
  });
});

exports.deleteCommentOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  const userComment = post.comments.find(
    (comment) => comment.id === req.params.comment_id
  );

  //Checking for comment's existence
  if (!userComment) {
    return next(new AppError('Comment does not exists', 404));
  }

  post.comments.filter(({ id }) => id !== userComment);

  await post.save();

  res.status(200).json({
    status: 'success',
    data: {
      comments: post.comments,
    },
  });
});
