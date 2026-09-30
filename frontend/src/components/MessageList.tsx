import React, { useEffect, useRef, useState } from 'react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import './MessageList.css';

interface MessageListProps {
  messages: Message[];
  currentUsername: string;
  isLoading: boolean;
  error: string | null;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, currentUsername, isLoading, error }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    // Check if user is near the bottom (within 100px)
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, shouldAutoScroll]);

  if (isLoading) {
    return (
      <div className="message-list-container centered">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="message-list-container centered error-state">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="message-list-container centered empty-state">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="message-list-container" ref={listRef} onScroll={handleScroll}>
      <div className="message-list">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwnMessage={msg.username === currentUsername} />
        ))}
      </div>
    </div>
  );
};
