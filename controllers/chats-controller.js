const User = require('../models/User');
const Message = require('../models/Message');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const formatMessage = require('../utils/socketio/format-message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
} = require('../utils/socketio/connected-users');

exports.startChat = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new AppError('No user exists with that ID', 404));
  }

  req.io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('join', () => {
      const connectedUser = userJoin(socket.id, user.name);

      req.io.emit('user joined', {
        username: user.name,
        users: connectedUsers,
      });
    });

    socket.on('typing', (clientMsg) => {
      req.io.emit('typing', {
        message: clientMsg.message,
        username: clientMsg.username,
      });
    });

    socket.on('newMessage', (clientMsg) => {
      req.io.emit('chat message', {
        message: clientMsg.message,
        username: clientMsg.username,
      });
    });
  });
});
