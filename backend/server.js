'use strict';

const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const config = require('./src/config');
const initializeSockets = require('./src/sockets/socketHandler');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

initializeSockets(io);

server.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
});
