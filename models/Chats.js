const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
  },
  time: {
    type: Date,
    default: Date.now(),
  },
});

const Chat = mongoose.model('chats', chatSchema);

module.exports = Chat;
