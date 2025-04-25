import { useEffect, useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useYjsContext } from './useYjsContext';

/**
 * Hook to manage undo/redo functionality using Y.js UndoManager
 * @param documentId - The ID of the document to manage history for
 */
export const useUndoRedo = (_documentId: string) => {
  const yjsContext = useYjsContext();
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  
  // Initialize UndoManager
  useEffect(() => {
    if (!yjsContext.doc) return;
    
    // Create a new UndoManager instance
    // We track Y.Text, Y.Map, and Y.Array types
    const trackedTypes = [];
    
    if (yjsContext.text) {
      trackedTypes.push(yjsContext.text);
    }
    
    if (yjsContext.map) {
      trackedTypes.push(yjsContext.map);
    }
    
    if (yjsContext.array) {
      trackedTypes.push(yjsContext.array);
    }
    
    if (trackedTypes.length === 0) return;
    
    // Create UndoManager with tracked types
    const manager = new Y.UndoManager(trackedTypes, {
      // We can add additional options here if needed
      // For example, to capture metadata about each change
      captureTimeout: 500, // Group changes made within 500ms as a single undo step
    });
    
    setUndoManager(manager);
    
    // Initial state
    setCanUndo(manager.canUndo());
    setCanRedo(manager.canRedo());
    
    // Clean up
    return () => {
      manager.destroy();
    };
  }, [yjsContext.doc, yjsContext.text, yjsContext.map, yjsContext.array]);
  
  // Listen for changes to undo/redo state
  useEffect(() => {
    if (!undoManager) return;
    
    // Update state when undo/redo stack changes
    const handleStackChange = () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    };
    
    // Listen for stack changes
    undoManager.on('stack-item-added', handleStackChange);
    undoManager.on('stack-item-popped', handleStackChange);
    undoManager.on('stack-item-updated', handleStackChange);
    undoManager.on('stack-cleared', handleStackChange);
    
    // Clean up listeners
    return () => {
      undoManager.off('stack-item-added', handleStackChange);
      undoManager.off('stack-item-popped', handleStackChange);
      undoManager.off('stack-item-updated', handleStackChange);
      undoManager.off('stack-cleared', handleStackChange);
    };
  }, [undoManager]);
  
  // Undo the last change
  const undo = useCallback(() => {
    if (undoManager && canUndo) {
      undoManager.undo();
    }
  }, [undoManager, canUndo]);
  
  // Redo the last undone change
  const redo = useCallback(() => {
    if (undoManager && canRedo) {
      undoManager.redo();
    }
  }, [undoManager, canRedo]);
  
  // Clear all undo/redo history
  const clear = useCallback(() => {
    if (undoManager) {
      undoManager.clear();
    }
  }, [undoManager]);
  
  return {
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    undoManager,
  };
};

export default useUndoRedo;
