const User = require('../models/User');
const Chats = require('../models/Chats');
const AppError = require('../utils/appError');
const formatMessage = require('../utils/socket/messageFormat');
const catchAsync = require('../utils/catchAsync');

exports.initiate = catchAsync(async (req, res, next) => {});

exports.sendMessage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }
});

exports.getRecentMessages = catchAsync(async (req, res, next) => {});
