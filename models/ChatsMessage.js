const mongoose = require('mongoose');
// const messageFormat = require('../utils/socket/messageFormat');

const chatMessageSchema = new mongoose.Schema({});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = ChatMessage;
