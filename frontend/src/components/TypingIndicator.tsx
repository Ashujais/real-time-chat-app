import React from 'react';
import './TypingIndicator.css';

interface TypingIndicatorProps {
  typingUsers: string[];
  currentUsername: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUsername }) => {
  const othersTyping = typingUsers.filter(u => u !== currentUsername);

  if (othersTyping.length === 0) return null;

  let typingText = '';
  if (othersTyping.length === 1) {
    typingText = `${othersTyping[0]} is typing`;
  } else if (othersTyping.length === 2) {
    typingText = `${othersTyping[0]} and ${othersTyping[1]} are typing`;
  } else {
    typingText = 'Several people are typing';
  }

  return (
    <div className="typing-indicator-container">
      <span className="typing-text">{typingText}</span>
      <div className="typing-dots">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  );
};
