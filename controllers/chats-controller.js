const User = require('../models/User');
const Chats = require('../models/Chats');
const AppError = require('../utils/appError');
const formatMessage = require('../utils/socket/messageFormat');
const catchAsync = require('../utils/catchAsync');

exports.sendMessage = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }

  const message = formatMessage(req.body.msg);
  const chat = await Chats.create({});
});
