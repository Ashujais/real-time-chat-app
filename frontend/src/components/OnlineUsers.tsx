import React, { useState } from 'react';
import './OnlineUsers.css';

interface OnlineUsersProps {
  users: string[];
}

export const OnlineUsers: React.FC<OnlineUsersProps> = ({ users }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="online-users-container" onMouseEnter={() => setIsExpanded(true)} onMouseLeave={() => setIsExpanded(false)}>
      <div className="online-users-badge">
        <span className="badge-count">{users.length}</span> Online
      </div>
      {isExpanded && users.length > 0 && (
        <div className="online-users-dropdown">
          <ul>
            {users.map((user, idx) => (
              <li key={idx}>{user}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
