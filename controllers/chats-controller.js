const User = require('../models/User');
const Chats = require('../models/Chats');
const AppError = require('../utils/appError');
const formatMessage = require('../utils/socket/messageFormat');
const catchAsync = require('../utils/catchAsync');

exports.sendMessageToClient = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }

  // const message = formatMessage(req.body.msg);

  // await Chats.create({
  //   user,
  //   message,
  // });

  // req.io.emit('messageToClient', message);

  // res.status(201).json({
  //   status: 'success',
  //   data: message,
  // });
});

exports.getMessages = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }
});
