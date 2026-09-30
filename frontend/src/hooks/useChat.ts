import { useState, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { fetchMessages, sendMessage as apiSendMessage } from '../services/api';
import { getSocket } from '../services/socket';

export const useChat = (username: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) return;

    const loadHistory = async () => {
      setIsLoading(true);
      setError(null);
      const res = await fetchMessages();
      if (res.success) {
        setMessages(res.data);
      } else {
        setError(res.error || 'Failed to load messages');
      }
      setIsLoading(false);
    };

    loadHistory();

    const socket = getSocket();
    
    const handleNewMessage = (message: Message) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.find(m => m.id === message.id)) return prev;
        return [...prev, message];
      });
    };

    socket.on('message:new', handleNewMessage);

    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [username]);

  const sendMessage = useCallback(async (text: string) => {
    if (!username) return;
    const res = await apiSendMessage(username, text);
    if (!res.success) {
      throw new Error(res.error || 'Failed to send message');
    }
    // Note: We don't add the message to state here.
    // It will be added when it's received via the 'message:new' socket event.
  }, [username]);

  return { messages, isLoading, error, sendMessage };
};
