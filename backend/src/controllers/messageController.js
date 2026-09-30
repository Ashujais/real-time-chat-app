'use strict';

const messageService = require('../services/messageService');

const createMessage = (req, res, next) => {
  try {
    const { username, message } = req.body;
    
    const newMessage = messageService.createMessage(username, message);
    
    // Broadcast via socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('message:new', newMessage);
    }
    
    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

const getMessages = (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;
    
    const { messages, total } = messageService.getMessages(limit, offset);
    
    res.status(200).json({
      success: true,
      data: messages,
      total
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getMessages
};
