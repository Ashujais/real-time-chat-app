'use strict';

const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const messageRoutes = require('./src/routes/messageRoutes');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/messages', messageRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
