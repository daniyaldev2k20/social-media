const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  textCreatedAt: {
    type: String,
    default: moment().format('h:mm a'),
  },
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
