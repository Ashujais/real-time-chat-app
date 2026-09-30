import React from 'react';
import { Message } from '../types';
import { formatTime } from '../utils/formatTime';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <div className={`message-bubble-container ${isOwnMessage ? 'own-message' : 'other-message'}`}>
      {!isOwnMessage && <div className="message-sender">{message.username}</div>}
      <div className="message-content">
        <p className="message-text">{message.message}</p>
        <span className="message-time">{formatTime(message.createdAt)}</span>
      </div>
    </div>
  );
};
