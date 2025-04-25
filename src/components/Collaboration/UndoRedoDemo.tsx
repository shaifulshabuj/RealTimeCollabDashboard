import React, { useState, useEffect, useRef } from 'react';
import { YjsProvider } from '@/components/Collaboration/YjsProvider';
import { useYjsContext } from '@/hooks/useYjsContext';
import useUndoRedo from '@/hooks/useUndoRedo';
import useWebSocketSync from '@/hooks/useWebSocketSync';

const UndoRedoDemo: React.FC = () => {
  const documentId = 'undo-redo-demo';
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('Start typing here to test undo/redo functionality...');
  const [history, setHistory] = useState<string[]>([]);
  
  // Use our WebSocket sync hook for real-time collaboration
  const { isConnected, isInRoom } = useWebSocketSync(documentId);
  
  // Use our undo/redo hook
  const { undo, redo, canUndo, canRedo, clear } = useUndoRedo(documentId);
  
  // Access Y.js context
  const yjsContext = useYjsContext();
  
  // Initialize text from Y.js document
  useEffect(() => {
    if (!yjsContext.doc || !yjsContext.text) return;
    
    // Set initial text value
    setText(yjsContext.text.toString());
    
    // Listen for text changes
    const observer = () => {
      const newText = yjsContext.text?.toString() || '';
      setText(newText);
      
      // Add to history log
      setHistory(prev => {
        const newHistory = [...prev, newText];
        // Keep history limited to last 10 entries
        return newHistory.slice(-10);
      });
    };
    
    if (yjsContext.text) {
      yjsContext.text.observe(observer);
    }
    
    return () => {
      if (yjsContext.text) {
        yjsContext.text.unobserve(observer);
      }
    };
  }, [yjsContext.doc, yjsContext.text]);
  
  // Handle text changes
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
  
  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z or Command+Z (undo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      
      // Check for Ctrl+Shift+Z or Command+Shift+Z (redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      
      // Check for Ctrl+Y or Command+Y (alternative redo)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [undo, redo]);
  
  return (
    <YjsProvider documentId={documentId}>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Undo/Redo Functionality Demo</h1>
        
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
        
        {/* Undo/Redo buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`px-4 py-2 rounded ${
              canUndo 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Undo
          </button>
          
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`px-4 py-2 rounded ${
              canRedo 
                ? 'bg-blue-500 text-white hover:bg-blue-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Redo
          </button>
          
          <button
            onClick={clear}
            className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Clear History
          </button>
        </div>
        
        {/* Collaborative text area */}
        <div className="mb-6">
          <label htmlFor="collaborative-text" className="block font-medium mb-2">
            Collaborative Text Area
          </label>
          <textarea
            ref={textareaRef}
            id="collaborative-text"
            value={text}
            onChange={handleTextChange}
            className="w-full h-40 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type something here..."
          />
          <p className="text-sm text-gray-500 mt-1">
            Try typing some text, then use the Undo/Redo buttons or keyboard shortcuts (Ctrl+Z / Ctrl+Y)
          </p>
        </div>
        
        {/* History log */}
        <div className="mb-4">
          <h2 className="font-semibold mb-2">Change History</h2>
          <div className="bg-gray-100 p-3 rounded max-h-40 overflow-y-auto">
            {history.length > 0 ? (
              <ul className="text-sm">
                {history.map((entry, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-mono text-xs bg-gray-200 px-1 rounded mr-2">
                      {index + 1}
                    </span>
                    {entry.length > 50 ? `${entry.substring(0, 50)}...` : entry}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No changes yet</p>
            )}
          </div>
        </div>
        
        <div className="text-sm text-gray-600 mt-6 p-3 bg-gray-50 rounded">
          <h3 className="font-semibold mb-1">How to test:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Type some text in the text area</li>
            <li>Make multiple changes</li>
            <li>Click the Undo button or press Ctrl+Z to undo changes</li>
            <li>Click the Redo button or press Ctrl+Y to redo changes</li>
            <li>Open this page in multiple browser windows to see collaborative undo/redo</li>
          </ol>
        </div>
      </div>
    </YjsProvider>
  );
};

export default UndoRedoDemo;
