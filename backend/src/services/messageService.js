'use strict';

const db = require('../models/database');
const { generateId, getCurrentTimestamp } = require('../utils/helpers');

const createMessage = (username, messageContent) => {
  const id = generateId();
  const createdAt = getCurrentTimestamp();

  const stmt = db.prepare('INSERT INTO messages (id, username, message, createdAt) VALUES (?, ?, ?, ?)');
  stmt.run(id, username, messageContent, createdAt);

  return {
    id,
    username,
    message: messageContent,
    createdAt
  };
};

const getMessages = (limit = 50, offset = 0) => {
  const stmt = db.prepare('SELECT * FROM messages ORDER BY createdAt ASC LIMIT ? OFFSET ?');
  const messages = stmt.all(limit, offset);
  
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM messages');
  const total = countStmt.get().count;

  return {
    messages,
    total
  };
};

module.exports = {
  createMessage,
  getMessages
};
