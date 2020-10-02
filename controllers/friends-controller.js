const mongoose = require('mongoose');

const User = require('../models/User');
const Friends = require('../models/Friends');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// 1- Friend request
exports.sendFriendRequest = catchAsync(async (req, res, next) => {
  const userA = await User.findById(req.user.id);
  const recipientUser = req.body.recipient;
  const userB = await User.findById(recipientUser);

  if (!userA || !userB) {
    return next(new AppError('No user exists with that ID', 404));
  }

  const docA = await Friends.findOneAndUpdate(
    {
      requester: userA,
      recipient: userB,
    },
    {
      $set: { status: 1 },
    },
    {
      upsert: true,
      new: true,
    }
  );

  const docB = await Friends.findOneAndUpdate(
    {
      recipient: userA,
      requester: userB,
    },
    {
      $set: { status: 2 },
    },
    {
      upsert: true,
      new: true,
    }
  );

  const updateUserA = await User.findOneAndUpdate(
    { _id: userA },
    { $push: { friends: docA._id } }
  );

  const updateUserB = await User.findOneAndUpdate(
    { _id: userB },
    { $push: { friends: docB._id } }
  );

  res.status(200).json({
    status: 'success',
    data: {
      updateUserA,
      updateUserB,
    },
  });
});

// 2- Accept Friend request
exports.acceptFriendRequest = catchAsync(async (req, res, next) => {
  const userA = await User.findById(req.user.id);
  const recipientUser = req.body.recipient;
  const userB = await User.findById(recipientUser);

  if (!userA || !userB) {
    return next(new AppError('No user exists with that ID', 404));
  }

  await Friends.findOneAndUpdate(
    { requester: userA, recipient: userB },
    { $set: { status: 3 } }
  );
  await Friends.findOneAndUpdate(
    { recipient: userA, requester: userB },
    { $set: { status: 3 } }
  );

  res.status(200).json({
    status: 'success',
  });
});

// 3- Reject friend request
exports.rejectFriendRequest = catchAsync(async (req, res, next) => {
  const userA = await User.findById(req.user.id);
  const recipientUser = req.body.recipient;
  const userB = await User.findById(recipientUser);

  if (!userA || !userB) {
    return next(new AppError('No user exists with that ID', 404));
  }

  const docA = await Friends.findOneAndRemove({
    requester: userA,
    recipient: userB,
  });

  const docB = await Friends.findOneAndRemove({
    recipient: userA,
    requester: userB,
  });

  const updateUserA = await User.findOneAndUpdate(
    { _id: userA },
    { $pull: { friends: docA._id } }
  );

  const updateUserB = await User.findOneAndUpdate(
    { _id: userA },
    { $pull: { friends: docB._id } }
  );

  res.status(204).json({
    status: 'success',
    data: {
      updateUserA,
      updateUserB,
    },
  });
});

// 4- check whether recipient is friend of requester
exports.checkFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const recipientUser = await User.findById(req.body.recipient);

  if (!user) {
    return next(new AppError('No user exists with that ID', 404));
  }

  await User.aggregate([
    {
      $lookup: {
        from: Friends.collection.name,
        let: { friends: '$friends' },
        pipeline: [
          {
            $match: {
              recipient: mongoose.Schema.ObjectId(recipientUser),
              $expr: { $in: ['$_id', '$$friends'] },
            },
          },
          {
            $project: { status: 1 },
          },
        ],
        as: 'friends',
      },
    },
    {
      $addFields: {
        friendsStatus: {
          $ifNull: [{ $min: '$friends.status' }, 0],
        },
      },
    },
  ]);
  next();
});

// 5- get all friends
exports.getAllFriends = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user exists with that ID', 404));
  }

  const friendList = await user.populate('friends');

  res.status(200).json({
    status: 'success',
    data: {
      friendList,
    },
  });
});

// 6- Get one friend
exports.getFriend = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const friend = await User.findById({ name: req.query.name });

  if (!user || !friend) {
    return next(new AppError('No user exists with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      friend,
    },
  });
});
