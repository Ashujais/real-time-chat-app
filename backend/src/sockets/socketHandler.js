'use strict';

const onlineUsers = new Map();

const initializeSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('user:join', (data) => {
      const username = data?.username;
      if (username) {
        onlineUsers.set(socket.id, username);
        io.emit('user:online', {
          username,
          onlineUsers: Array.from(onlineUsers.values())
        });
      }
    });

    socket.on('user:typing', (data) => {
      if (data?.username) {
        socket.broadcast.emit('user:typing', { username: data.username });
      }
    });

    socket.on('user:stop-typing', (data) => {
      if (data?.username) {
        socket.broadcast.emit('user:stop-typing', { username: data.username });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      const username = onlineUsers.get(socket.id);
      if (username) {
        onlineUsers.delete(socket.id);
        io.emit('user:offline', {
          username,
          onlineUsers: Array.from(onlineUsers.values())
        });
      }
    });
  });
};

module.exports = initializeSockets;
