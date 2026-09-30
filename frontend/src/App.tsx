import React, { useState } from 'react';
import { LoginScreen } from './screens/LoginScreen';
import { ChatScreen } from './screens/ChatScreen';
import './App.css';

function App() {
  const [username, setUsername] = useState<string | null>(null);

  return (
    <div className="app">
      {!username ? (
        <LoginScreen onJoin={setUsername} />
      ) : (
        <ChatScreen username={username} />
      )}
    </div>
  );
}

export default App;
