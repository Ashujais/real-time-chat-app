import { useState, useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../services/socket';

export const useSocket = (username: string | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!username) return;

    const socket = getSocket();
    
    socket.connect();

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('user:join', { username });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setOnlineUsers([]);
    });

    socket.on('user:online', (data: { username: string; onlineUsers: string[] }) => {
      setOnlineUsers(data.onlineUsers);
    });

    socket.on('user:offline', (data: { username: string; onlineUsers: string[] }) => {
      setOnlineUsers(data.onlineUsers);
    });

    socket.on('user:typing', (data: { username: string }) => {
      setTypingUsers(prev => {
        if (!prev.includes(data.username)) {
          return [...prev, data.username];
        }
        return prev;
      });
    });

    socket.on('user:stop-typing', (data: { username: string }) => {
      setTypingUsers(prev => prev.filter(u => u !== data.username));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user:online');
      socket.off('user:offline');
      socket.off('user:typing');
      socket.off('user:stop-typing');
      disconnectSocket();
    };
  }, [username]);

  const emitTyping = () => {
    if (!username) return;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('user:typing', { username });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('user:stop-typing', { username });
      }, 2000);
    }
  };

  return { socket: getSocket(), isConnected, onlineUsers, typingUsers, emitTyping };
};
