const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
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
