const moment = require('moment');
const User = require('../models/User');
const Message = require('../models/Message');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.startChat = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new AppError('User does not exists by that ID', 404));
  }

  req.io.on('connection', (clientSocket) => {
    console.log(`Client-Socket connected ${clientSocket.id}`);

    Message.find({})
      .sort({ textCreatedAt: -1 })
      .limit(10)
      .then((messages) => {
        clientSocket.emit('Load chat messages', messages.reverse());
      });

    console.log('new client connection');

    clientSocket.on('disconnection', () => {
      console.log('user disconnected');
    });

    clientSocket.on('message', async (data) => {
      const messageBody = {
        text: data.text,
        userName: data.userName,
        user: user.id,
        textCreatedAt: moment().format('h:mm a'),
      };

      const msgFromServer = await Message.create(messageBody);

      msgFromServer.save().then(() => {
        req.io.emit('message', messageBody);
      });
    });
  });
});
