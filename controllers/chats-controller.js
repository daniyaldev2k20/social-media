const Message = require('../models/Message');
const formatMessage = require('../utils/socketio/format-message');
const {
  userJoin,
  getCurrentUser,
  userLeave,
} = require('../utils/socketio/connected-users');

module.exports.startChat = (socketio) => {
  const botName = 'Chat Bot';

  socketio.on('connection', (socket) => {
    socket.on('join', ({ username }) => {
      const user = userJoin(socket.id, username);

      console.log(`User connected ${socket.id}`);

      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to ChatCord'));

      socket.emit('message', `${user.username} has joined the chat`);
    });

    socket.on('typing', (msg) => {
      const user = getCurrentUser(socket.id);
      socketio.emit('typing', formatMessage(user.username, msg));
    });

    socket.on('chatMessage', async (msg) => {
      const user = getCurrentUser(socket.id);
      socketio.emit('message', formatMessage(user.username, msg));

      Message.create({ user, msg });
    });

    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if (user) {
        socketio.emit(
          'user-left',
          formatMessage(botName, `${user.username} has left the chat`)
        );
      }
    });
  });
};
