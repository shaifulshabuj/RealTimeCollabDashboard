import React, { useState, useEffect, useRef, useCallback } from 'react';
import { YjsProvider } from '@/components/Collaboration/YjsProvider';
import { usePresenceAwareness } from '@/hooks/usePresenceAwareness';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import useAuthStore from '@/store/authStore';

const PresenceAwarenessDemo: React.FC = () => {
  const documentId = 'presence-demo';
  const { user } = useAuthStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('Start typing here to see presence awareness in action...');
  
  // Use our WebSocket sync hook for real-time collaboration
  const { isConnected, isInRoom } = useWebSocketSync(documentId);
  
  // Use our presence awareness hook
  const { activeUsers, updateCursor, updateSelection, isReady } = usePresenceAwareness(documentId);
  
  // Handle text changes
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };
  
  // Handle cursor position changes
  const handleSelectionChange = useCallback(() => {
    if (!textareaRef.current || !isReady) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    
    // Update cursor position
    updateCursor(selectionStart);
    
    // Update selection if there is one
    if (selectionStart !== selectionEnd) {
      updateSelection(selectionStart, selectionEnd);
    }
  }, [isReady, updateCursor, updateSelection]);
  
  // Set up event listeners for cursor and selection changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Handle selection changes
    const handleSelect = () => handleSelectionChange();
    
    // Handle click events to track cursor position
    const handleClick = () => handleSelectionChange();
    
    // Handle keyup events to track cursor position after keyboard navigation
    const handleKeyUp = (e: KeyboardEvent) => {
      // Only track cursor for navigation keys
      if (
        e.key === 'ArrowUp' || 
        e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || 
        e.key === 'ArrowRight' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        handleSelectionChange();
      }
    };
    
    textarea.addEventListener('select', handleSelect);
    textarea.addEventListener('click', handleClick);
    textarea.addEventListener('keyup', handleKeyUp);
    
    return () => {
      textarea.removeEventListener('select', handleSelect);
      textarea.removeEventListener('click', handleClick);
      textarea.removeEventListener('keyup', handleKeyUp);
    };
  }, [isReady, updateCursor, updateSelection, handleSelectionChange]);
  
  return (
    <YjsProvider documentId={documentId}>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Presence Awareness Demo</h1>
        
        {/* Connection status */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="font-semibold mr-2">Status:</span>
            <span className={`px-2 py-1 rounded text-sm ${
              isConnected && isInRoom ? 'bg-green-100 text-green-800' : 
              isConnected ? 'bg-yellow-100 text-yellow-800' : 
              'bg-red-100 text-red-800'
            }`}>
              {isConnected && isInRoom ? 'Connected to room' : 
               isConnected ? 'Connected, not in room' : 
               'Disconnected'}
            </span>
          </div>
        </div>
        
        {/* Current user info */}
        {user && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <h2 className="font-semibold text-sm text-blue-800">You are signed in as:</h2>
            <div className="flex items-center mt-1">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="ml-2">
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Active users */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Active Users</h2>
          {activeUsers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeUsers.map(presence => (
                <div 
                  key={presence.user.id} 
                  className="flex items-center p-2 rounded border"
                  style={{ borderColor: presence.color }}
                >
                  <div 
                    className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ backgroundColor: presence.color }}
                  >
                    {presence.user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="ml-2 text-sm">{presence.user.name}</span>
                  {presence.cursor && (
                    <span className="ml-2 text-xs bg-gray-100 px-1 rounded">
                      cursor: {presence.cursor.index}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No other users are currently active.</p>
          )}
        </div>
        
        {/* Collaborative text area */}
        <div className="mb-4">
          <label htmlFor="collaborative-text" className="block font-medium mb-2">
            Collaborative Text Area
          </label>
          <textarea
            ref={textareaRef}
            id="collaborative-text"
            value={text}
            onChange={handleTextChange}
            onSelect={handleSelectionChange}
            className="w-full h-40 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type something here..."
          />
        </div>
        
        <div className="text-sm text-gray-600 mt-6 p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-1">How to test:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Open this page in multiple browser windows</li>
            <li>Sign in with different user accounts in each window</li>
            <li>Notice how user presence is displayed in real-time</li>
            <li>Click in different positions to see cursor positions update</li>
            <li>Make selections to see how they're tracked across clients</li>
          </ol>
        </div>
      </div>
    </YjsProvider>
  );
};

export default PresenceAwarenessDemo;
