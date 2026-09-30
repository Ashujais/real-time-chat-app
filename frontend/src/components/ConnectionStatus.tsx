import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected }) => {
  return (
    <div className="connection-status-container" title={isConnected ? 'Connected' : 'Disconnected'}>
      <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
      <span className="status-text">{isConnected ? 'Connected' : 'Disconnected'}</span>
    </div>
  );
};
