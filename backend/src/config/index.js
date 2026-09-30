'use strict';

require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DB_PATH || './data/chat.db',
  nodeEnv: process.env.NODE_ENV || 'development'
};
