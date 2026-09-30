import React from 'react';
import { ChatHeader } from '../components/ChatHeader';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';
import { TypingIndicator } from '../components/TypingIndicator';
import { useSocket } from '../hooks/useSocket';
import { useChat } from '../hooks/useChat';
import './ChatScreen.css';

interface ChatScreenProps {
  username: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ username }) => {
  const { isConnected, onlineUsers, typingUsers, emitTyping } = useSocket(username);
  const { messages, isLoading, error, sendMessage } = useChat(username);

  return (
    <div className="chat-screen-container">
      <div className="chat-screen-content">
        <ChatHeader username={username} isConnected={isConnected} onlineUsers={onlineUsers} />
        <MessageList 
          messages={messages} 
          currentUsername={username} 
          isLoading={isLoading} 
          error={error} 
        />
        <TypingIndicator typingUsers={typingUsers} currentUsername={username} />
        <MessageInput 
          onSendMessage={sendMessage} 
          onTyping={emitTyping} 
          isConnected={isConnected} 
        />
      </div>
    </div>
  );
};
