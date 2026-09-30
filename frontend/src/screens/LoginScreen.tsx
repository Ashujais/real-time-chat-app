import React, { useState } from 'react';
import './LoginScreen.css';

interface LoginScreenProps {
  onJoin: (username: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Username cannot be empty');
      return;
    }
    if (trimmed.length > 50) {
      setError('Username must be less than 50 characters');
      return;
    }
    onJoin(trimmed);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Real-Time Chat</h1>
        <p>Enter a username to join the conversation.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Username"
            autoFocus
          />
          {error && <span className="login-error">{error}</span>}
          <button type="submit">Join Chat</button>
        </form>
      </div>
    </div>
  );
};
