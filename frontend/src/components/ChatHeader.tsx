import React from 'react';
import { ConnectionStatus } from './ConnectionStatus';
import { OnlineUsers } from './OnlineUsers';
import './ChatHeader.css';

interface ChatHeaderProps {
  username: string;
  isConnected: boolean;
  onlineUsers: string[];
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ username, isConnected, onlineUsers }) => {
  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <h1>Real-Time Chat</h1>
        <ConnectionStatus isConnected={isConnected} />
      </div>
      <div className="chat-header-right">
        <span className="current-user">Logged in as <strong>{username}</strong></span>
        <OnlineUsers users={onlineUsers} />
      </div>
    </header>
  );
};
