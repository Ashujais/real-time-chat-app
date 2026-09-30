'use strict';

const { v4: uuidv4 } = require('uuid');

const generateId = () => {
  return uuidv4();
};

const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

module.exports = {
  generateId,
  getCurrentTimestamp
};
