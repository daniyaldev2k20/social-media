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
  const botName = 'Chat Bot';
  const connectedUser = await User.findById(req.user.id);

  if (!connectedUser) {
    return next(new AppError('No user exists with that ID', 404));
  }

  req.io.on('connection', (socket) => {
    socket.on('join', () => {
      const user = userJoin(connectedUser.id, connectedUser.name);

      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

      socket.emit('message', `${user.username} has joined the chat`);
    });

    socket.on('typing', (msg) => {
      const user = getCurrentUser(connectedUser.id);
      req.io.emit('typing', formatMessage(user.username, msg));
    });

    socket.on('chatMessage', async (msg) => {
      const user = getCurrentUser(connectedUser.id);
      req.io.emit('message', formatMessage(user.username, msg));

      await Message.create({ user, msg });
    });

    socket.on('disconnect', () => {
      const user = userLeave(connectedUser.id);
      if (user) {
        req.io.emit(
          'user-left',
          formatMessage(botName, `${user.username} has left the chat`)
        );
      }
    });
  });
});
