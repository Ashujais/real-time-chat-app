import React, { useState, KeyboardEvent, useRef } from 'react';
import './MessageInput.css';

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  onTyping: () => void;
  isConnected: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping, isConnected }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleSend = async () => {
    if (!message.trim() || !isConnected || isSending) return;

    try {
      setIsSending(true);
      setError(null);
      await onSendMessage(message.trim());
      setMessage('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="message-input-wrapper">
      {error && <div className="message-input-error">{error}</div>}
      <div className="message-input-container">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={!isConnected || isSending}
          maxLength={1000}
          rows={1}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || !isConnected || isSending}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};
