import { useCallback } from 'react';
import crdtOperations, { 
  TextOperation, 
  MapOperation, 
  ArrayOperation
} from '@/services/crdtOperations';
import { useYjsContext } from './useYjsContext';
import useAuthStore from '@/store/authStore';
import { User } from '@/types/user';

/**
 * Hook for using CRDT operations in React components
 * 
 * This hook provides a simplified interface for performing CRDT operations
 * on Y.js documents, maps, and arrays.
 */
export function useCrdtOperations(documentId: string) {
  const { doc, text, map, array } = useYjsContext();
  const user = useAuthStore(state => state.user) as User;
  
  // Text operations
  const insertText = useCallback((index: number, content: string) => {
    if (!user) return;
    
    const operation: TextOperation = {
      type: 'insert',
      index,
      content
    };
    
    crdtOperations.applyTextOperation(documentId, operation, user);
  }, [documentId, user]);
  
  const deleteText = useCallback((index: number, length: number) => {
    if (!user) return;
    
    const operation: TextOperation = {
      type: 'delete',
      index,
      length
    };
    
    crdtOperations.applyTextOperation(documentId, operation, user);
  }, [documentId, user]);
  
  const formatText = useCallback((index: number, length: number, attributes: Record<string, unknown>) => {
    if (!user) return;
    
    const operation: TextOperation = {
      type: 'format',
      index,
      length,
      attributes
    };
    
    crdtOperations.applyTextOperation(documentId, operation, user);
  }, [documentId, user]);
  
  // Map operations
  const setMapValue = useCallback((mapName: string, key: string, value: unknown) => {
    if (!user) return;
    
    const operation: MapOperation = {
      type: 'set',
      key,
      value
    };
    
    crdtOperations.applyMapOperation(documentId, mapName, operation, user);
  }, [documentId, user]);
  
  const deleteMapKey = useCallback((mapName: string, key: string) => {
    if (!user) return;
    
    const operation: MapOperation = {
      type: 'delete',
      key
    };
    
    crdtOperations.applyMapOperation(documentId, mapName, operation, user);
  }, [documentId, user]);
  
  // Array operations
  const insertArrayItems = useCallback((arrayName: string, index: number, items: unknown[]) => {
    if (!user) return;
    
    const operation: ArrayOperation = {
      type: 'insert',
      index,
      items
    };
    
    crdtOperations.applyArrayOperation(documentId, arrayName, operation, user);
  }, [documentId, user]);
  
  const deleteArrayItems = useCallback((arrayName: string, index: number, length: number) => {
    if (!user) return;
    
    const operation: ArrayOperation = {
      type: 'delete',
      index,
      length
    };
    
    crdtOperations.applyArrayOperation(documentId, arrayName, operation, user);
  }, [documentId, user]);
  
  const updateArrayItem = useCallback((arrayName: string, index: number, item: unknown) => {
    if (!user) return;
    
    const operation: ArrayOperation = {
      type: 'update',
      index,
      item
    };
    
    crdtOperations.applyArrayOperation(documentId, arrayName, operation, user);
  }, [documentId, user]);
  
  // Undo/Redo operations
  const undo = useCallback(() => {
    if (!user) return;
    crdtOperations.undo(documentId);
  }, [documentId, user]);
  
  const redo = useCallback(() => {
    if (!user) return;
    crdtOperations.redo(documentId);
  }, [documentId, user]);
  
  // Create UndoManager
  const createUndoManager = useCallback(() => {
    if (!user) return null;
    return crdtOperations.createUndoManager(documentId, user);
  }, [documentId, user]);
  
  return {
    // Document state
    doc,
    text,
    map,
    array,
    
    // Text operations
    insertText,
    deleteText,
    formatText,
    
    // Map operations
    setMapValue,
    deleteMapKey,
    
    // Array operations
    insertArrayItems,
    deleteArrayItems,
    updateArrayItem,
    
    // Undo/Redo
    undo,
    redo,
    createUndoManager
  };
}

export default useCrdtOperations;
