const ioServer = require('../server');
const User = require('../models/User');
const Chats = require('../models/Chats');
const AppError = require('../utils/appError');
const formatMessage = require('../utils/socket/messageFormat');
const catchAsync = require('../utils/catchAsync');

exports.initiate = catchAsync(async (req, res, next) => {});
exports.postMessage = catchAsync(async (req, res, next) => {});
exports.getRecentConversation = catchAsync(async (req, res, next) => {});
exports.getConversationByRoomId = catchAsync(async (req, res, next) => {});
exports.markConversationReadByRoomId = catchAsync(async (req, res, next) => {});
exports.deleteRoomById = catchAsync(async (req, res, next) => {});
exports.deleteMessageById = catchAsync(async (req, res, next) => {});
