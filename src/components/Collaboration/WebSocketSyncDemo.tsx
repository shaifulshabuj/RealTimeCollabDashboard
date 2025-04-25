import React, { useState, useEffect } from 'react';
import useWebSocketSync from '@/hooks/useWebSocketSync';
import { useYjsContext } from '@/hooks/useYjsContext';

const WebSocketSyncDemo: React.FC = () => {
  const documentId = 'test-document';
  const yjsContext = useYjsContext();
  const [text, setText] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  
  // Use our WebSocket sync hook
  const { isConnected, isInRoom, isLoading, error } = useWebSocketSync(documentId);
  
  useEffect(() => {
    if (!yjsContext.doc || !yjsContext.text) return;
    
    // Get the Y.Text from the context
    const yText = yjsContext.text;
    
    // Initial text value
    setText(yText.toString());
    
    // Listen for text changes
    const observer = () => {
      setText(yText.toString());
    };
    
    yText.observe(observer);
    
    // Update connection status
    setConnectionStatus(
      isLoading ? 'Connecting...' : 
      error ? `Error: ${error}` :
      isConnected ? (isInRoom ? 'Connected to room' : 'Connected, not in room') : 
      'Disconnected'
    );
    
    return () => {
      yText.unobserve(observer);
    };
  }, [documentId, yjsContext.doc, yjsContext.text, isConnected, isInRoom, isLoading, error]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!yjsContext.doc || !yjsContext.text) return;
    
    // Apply the change to the Y.Text
    yjsContext.doc.transact(() => {
      if (yjsContext.text) {
        yjsContext.text.delete(0, yjsContext.text.length);
        yjsContext.text.insert(0, e.target.value);
      }
    });
  };
  
  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">WebSocket Sync Demo</h1>
      
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <span className="font-semibold mr-2">Status:</span>
          <span className={`px-2 py-1 rounded text-sm ${
            isConnected && isInRoom ? 'bg-green-100 text-green-800' : 
            isConnected ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {connectionStatus}
          </span>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="collaborative-text" className="block font-medium mb-2">
          Collaborative Text (changes are synced in real-time)
        </label>
        <textarea
          id="collaborative-text"
          value={text}
          onChange={handleTextChange}
          className="w-full h-40 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type something here..."
        />
      </div>
      
      <div className="text-sm text-gray-600">
        <p>Open this page in multiple browser windows to see real-time collaboration in action.</p>
        <p>Changes you make will be synced across all connected clients.</p>
      </div>
    </div>
  );
};

export default WebSocketSyncDemo;
