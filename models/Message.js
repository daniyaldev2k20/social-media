const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  messageCreatedAt: {
    type: String,
    default: moment().format('h:mm a'),
  },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
