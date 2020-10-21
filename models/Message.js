const mongoose = require('mongoose');
// const messageFormat = require('../utils/socket/messageFormat');

const MessageSchema = new mongoose.Schema({});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
