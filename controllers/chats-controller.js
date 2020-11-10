const User = require('../models/User');
const Message = require('../models/Message');
const formatMessage = require('../utils/socketio/format-message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
} = require('../utils/socketio/connected-users');

module.exports = (ioServer) => {
  const botName = 'Chat Bot';
  ioServer.on('connection', (socket) => {
    socket.on('join', ({ username }) => {
      const user = userJoin(socket.id, username);

      console.log(`User connected ${socket.id}`);

      // Welcome current user
      socket.emit(
        'message',
        formatMessage(botName, 'Welcome to Social Media API')
      );

      socket.emit('message', `${user.username} has joined the chat`);
    });

    socket.on('typing', (msg) => {
      const user = getCurrentUser(socket.id);
      ioServer.emit('typing', formatMessage(user.username, msg));
    });

    socket.on('chatMessage', async (msg) => {
      const user = getCurrentUser(socket.id);
      ioServer.emit('message', formatMessage(user.username, msg));

      Message.create({ message: msg });
    });

    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        ioServer.emit(
          'user-left',
          formatMessage(botName, `${user.username} has left the chat`)
        );
      }
    });
  });
};
