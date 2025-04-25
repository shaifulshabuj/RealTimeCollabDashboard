import React, { useState, useEffect } from 'react';
import { YjsProvider } from '@/components/Collaboration/YjsProvider';
import { useYjsContext } from '@/hooks/useYjsContext';
import useCrdtOperations from '@/hooks/useCrdtOperations';

/**
 * Demo component to showcase CRDT operations
 */
const CrdtOperationsContent: React.FC<{ documentId: string }> = ({ documentId }) => {
  const [textContent, setTextContent] = useState('');
  const [insertIndex, setInsertIndex] = useState(0);
  const [insertText, setInsertText] = useState('');
  const [deleteIndex, setDeleteIndex] = useState(0);
  const [deleteLength, setDeleteLength] = useState(1);
  
  const [mapKey, setMapKey] = useState('');
  const [mapValue, setMapValue] = useState('');
  const [mapEntries, setMapEntries] = useState<Record<string, unknown>>({});
  
  const [arrayItem, setArrayItem] = useState('');
  const [arrayIndex, setArrayIndex] = useState(0);
  const [arrayItems, setArrayItems] = useState<string[]>([]);
  
  const { text, map } = useYjsContext();
  const {
    insertText: insertTextOp,
    deleteText: deleteTextOp,
    setMapValue: setMapValueOp,
    deleteMapKey: deleteMapKeyOp,
    insertArrayItems: insertArrayItemsOp,
    deleteArrayItems: deleteArrayItemsOp,
    updateArrayItem: updateArrayItemOp,
    undo,
    redo
  } = useCrdtOperations(documentId);
  
  // Update local state when Y.js text changes
  useEffect(() => {
    if (!text) return;
    
    const updateText = () => {
      setTextContent(text.toString());
    };
    
    // Initial update
    updateText();
    
    // Subscribe to changes
    text.observe(updateText);
    
    return () => {
      text.unobserve(updateText);
    };
  }, [text]);
  
  // Update local state when Y.js map changes
  useEffect(() => {
    if (!map) return;
    
    const updateMap = () => {
      const entries: Record<string, unknown> = {};
      map.forEach((value, key) => {
        entries[key] = value;
      });
      setMapEntries(entries);
    };
    
    // Initial update
    updateMap();
    
    // Subscribe to changes
    map.observe(updateMap);
    
    return () => {
      map.unobserve(updateMap);
    };
  }, [map]);
  
  // Handle text operations
  const handleInsertText = () => {
    if (insertText && insertIndex >= 0 && insertIndex <= textContent.length) {
      insertTextOp(insertIndex, insertText);
      setInsertText('');
    }
  };
  
  const handleDeleteText = () => {
    if (deleteIndex >= 0 && deleteLength > 0 && deleteIndex + deleteLength <= textContent.length) {
      deleteTextOp(deleteIndex, deleteLength);
    }
  };
  
  // Handle map operations
  const handleSetMapValue = () => {
    if (mapKey) {
      setMapValueOp('metadata', mapKey, mapValue);
      setMapKey('');
      setMapValue('');
    }
  };
  
  const handleDeleteMapKey = (key: string) => {
    deleteMapKeyOp('metadata', key);
  };
  
  // Handle array operations
  const handleInsertArrayItem = () => {
    if (arrayItem) {
      insertArrayItemsOp('items', arrayIndex, [arrayItem]);
      setArrayItems([...arrayItems.slice(0, arrayIndex), arrayItem, ...arrayItems.slice(arrayIndex)]);
      setArrayItem('');
    }
  };
  
  const handleDeleteArrayItem = (index: number) => {
    deleteArrayItemsOp('items', index, 1);
    setArrayItems(arrayItems.filter((_, i) => i !== index));
  };
  
  const handleUpdateArrayItem = (index: number, value: string) => {
    updateArrayItemOp('items', index, value);
    setArrayItems(arrayItems.map((item, i) => i === index ? value : item));
  };
  
  return (
    <div className="p-4 space-y-8">
      <h2 className="text-2xl font-bold mb-4">CRDT Operations Demo</h2>
      
      {/* Text Operations */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Text Operations</h3>
        
        <div className="mb-4">
          <p className="font-medium mb-1">Current Text:</p>
          <div className="border p-2 min-h-[100px] rounded bg-gray-50 whitespace-pre-wrap">
            {textContent || <span className="text-gray-400">No text yet. Insert some text below.</span>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="font-medium mb-1">Insert Text:</p>
            <div className="flex space-x-2">
              <input
                type="number"
                className="border rounded px-2 py-1 w-20"
                placeholder="Index"
                value={insertIndex}
                onChange={(e) => setInsertIndex(Number(e.target.value))}
                min={0}
                max={textContent.length}
              />
              <input
                type="text"
                className="border rounded px-2 py-1 flex-grow"
                placeholder="Text to insert"
                value={insertText}
                onChange={(e) => setInsertText(e.target.value)}
              />
              <button
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                onClick={handleInsertText}
              >
                Insert
              </button>
            </div>
          </div>
          
          <div>
            <p className="font-medium mb-1">Delete Text:</p>
            <div className="flex space-x-2">
              <input
                type="number"
                className="border rounded px-2 py-1 w-20"
                placeholder="Index"
                value={deleteIndex}
                onChange={(e) => setDeleteIndex(Number(e.target.value))}
                min={0}
                max={textContent.length - 1}
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-20"
                placeholder="Length"
                value={deleteLength}
                onChange={(e) => setDeleteLength(Number(e.target.value))}
                min={1}
                max={textContent.length - deleteIndex}
              />
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={handleDeleteText}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            onClick={undo}
          >
            Undo
          </button>
          <button
            className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
            onClick={redo}
          >
            Redo
          </button>
        </div>
      </div>
      
      {/* Map Operations */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Map Operations</h3>
        
        <div className="mb-4">
          <p className="font-medium mb-1">Current Map Entries:</p>
          <div className="border p-2 min-h-[100px] rounded bg-gray-50">
            {Object.keys(mapEntries).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(mapEntries).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <div>
                      <span className="font-mono">{key}:</span>{' '}
                      <span className="text-blue-600">{JSON.stringify(value)}</span>
                    </div>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteMapKey(key)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">No map entries yet. Add some below.</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            className="border rounded px-2 py-1 flex-grow"
            placeholder="Key"
            value={mapKey}
            onChange={(e) => setMapKey(e.target.value)}
          />
          <input
            type="text"
            className="border rounded px-2 py-1 flex-grow"
            placeholder="Value"
            value={mapValue}
            onChange={(e) => setMapValue(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            onClick={handleSetMapValue}
          >
            Set
          </button>
        </div>
      </div>
      
      {/* Array Operations */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="text-lg font-semibold mb-2">Array Operations</h3>
        
        <div className="mb-4">
          <p className="font-medium mb-1">Current Array Items:</p>
          <div className="border p-2 min-h-[100px] rounded bg-gray-50">
            {arrayItems.length > 0 ? (
              <div className="space-y-2">
                {arrayItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-mono">{index}:</span>{' '}
                      <span className="text-green-600">{item}</span>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleUpdateArrayItem(index, prompt('New value:', item) || item)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteArrayItem(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">No array items yet. Add some below.</span>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <input
            type="number"
            className="border rounded px-2 py-1 w-20"
            placeholder="Index"
            value={arrayIndex}
            onChange={(e) => setArrayIndex(Number(e.target.value))}
            min={0}
            max={arrayItems.length}
          />
          <input
            type="text"
            className="border rounded px-2 py-1 flex-grow"
            placeholder="Item"
            value={arrayItem}
            onChange={(e) => setArrayItem(e.target.value)}
          />
          <button
            className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
            onClick={handleInsertArrayItem}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Wrapper component that provides the Y.js context
 */
const CrdtOperationsDemo: React.FC = () => {
  const documentId = 'crdt-demo';
  
  return (
    <YjsProvider documentId={documentId}>
      <CrdtOperationsContent documentId={documentId} />
    </YjsProvider>
  );
};

export default CrdtOperationsDemo;
