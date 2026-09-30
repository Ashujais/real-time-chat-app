'use strict';

const validateMessage = (req, res, next) => {
  let { username, message } = req.body;

  if (!username || typeof username !== 'string') {
    return res.status(400).json({ success: false, error: 'Username is required and must be a string' });
  }

  username = username.trim();
  if (username.length === 0 || username.length > 50) {
    return res.status(400).json({ success: false, error: 'Username must be between 1 and 50 characters' });
  }

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required and must be a string' });
  }

  message = message.trim();
  if (message.length === 0 || message.length > 1000) {
    return res.status(400).json({ success: false, error: 'Message must be between 1 and 1000 characters' });
  }

  req.body.username = username;
  req.body.message = message;
  next();
};

module.exports = {
  validateMessage
};
