import React, { useEffect, useState } from 'react';
import { useYjsContext } from '@/hooks/useYjsContext';
import useAuthStore from '@/store/authStore';
import { UserPresence } from '@/hooks/useYjs';

interface ActiveUser {
  id: string;
  name: string;
  color: string;
  cursor?: {
    index: number;
  };
  selection?: {
    anchor: number;
    head: number;
  };
  lastActive: string;
}

interface PresenceAwarenessProps {
  documentId: string;
}

const PresenceAwareness: React.FC<PresenceAwarenessProps> = ({ documentId: _documentId }) => {
  const { userPresences } = useYjsContext();
  const { user } = useAuthStore();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);

  // Update active users when userPresences changes
  useEffect(() => {
    if (!userPresences || !user) return;

    // Convert userPresences to ActiveUser array
    const users: ActiveUser[] = userPresences
      .filter(presence => presence.user && presence.user.id !== user.id) // Filter out current user
      .map((presence: UserPresence) => ({
        id: presence.user.id,
        name: presence.user.name,
        color: presence.color || '#3b82f6', // Default to blue if no color
        cursor: presence.cursor,
        selection: presence.selection,
        lastActive: new Date().toISOString()
      }));

    setActiveUsers(users);
  }, [userPresences, user]);

  // Render user presence indicators
  return (
    <div className="presence-awareness">
      {/* Active users avatars */}
      <div className="flex -space-x-2 overflow-hidden mb-2">
        {activeUsers.map(activeUser => (
          <div
            key={activeUser.id}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white"
            style={{ 
              backgroundColor: activeUser.color,
              position: 'relative'
            }}
            title={activeUser.name}
          >
            <span className="absolute inset-0 flex items-center justify-center text-white font-semibold text-xs">
              {activeUser.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Active users list */}
      {activeUsers.length > 0 && (
        <div className="text-sm text-gray-600 mb-4">
          <h3 className="font-semibold mb-1">Currently editing:</h3>
          <ul className="space-y-1">
            {activeUsers.map(activeUser => (
              <li key={activeUser.id} className="flex items-center">
                <span
                  className="h-3 w-3 rounded-full mr-2"
                  style={{ backgroundColor: activeUser.color }}
                ></span>
                <span>{activeUser.name}</span>
                {activeUser.cursor && (
                  <span className="text-xs text-gray-500 ml-2">
                    (at position {activeUser.cursor.index})
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeUsers.length === 0 && (
        <div className="text-sm text-gray-500 mb-4">
          No other users are currently editing this document.
        </div>
      )}
    </div>
  );
};

export default PresenceAwareness;
