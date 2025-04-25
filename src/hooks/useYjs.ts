import { useState, useEffect, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
import { Awareness } from 'y-protocols/awareness';
import yjsService from '@/services/yjsService';
import { User } from '@/types/user';
import useAuthStore from '@/store/authStore';

interface UseYjsOptions {
  documentId: string;
  textName?: string;
  mapName?: string;
  arrayName?: string;
}

export interface YjsAwarenessState {
  user: {
    id: string;
    name: string;
    color: string;
  };
  cursor?: {
    index: number;
    anchor?: number;
    head?: number;
  };
  selection?: {
    anchor: number;
    head: number;
  };
}

export interface UserPresence {
  user: {
    id: string;
    name: string;
  };
  color: string;
  cursor?: {
    index: number;
  };
  selection?: {
    anchor: number;
    head: number;
  };
}

interface UseYjsResult {
  // Document components
  doc: Y.Doc;
  text: Y.Text | null;
  map: Y.Map<any> | null;
  array: Y.Array<any> | null;
  
  // Awareness
  awareness: Awareness;
  userPresences: UserPresence[];
  
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Methods
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateCursor: (index: number) => void;
  updateSelection: (anchor: number, head: number) => void;
  getTextContent: () => string;
}

export function useYjs({
  documentId,
  textName = 'content',
  mapName = 'metadata',
  arrayName
}: UseYjsOptions): UseYjsResult {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userPresences, setUserPresences] = useState<UserPresence[]>([]);
  
  const user = useAuthStore(state => state.user);
  
  // Get or create Y.Doc and related components
  const doc = useMemo(() => yjsService.getDocument(documentId), [documentId]);
  const text = useMemo(() => textName ? yjsService.getText(documentId, textName) : null, [documentId, textName]);
  const map = useMemo(() => mapName ? yjsService.getMap(documentId, mapName) : null, [documentId, mapName]);
  const array = useMemo(() => arrayName ? yjsService.getArray(documentId, arrayName) : null, [documentId, arrayName]);
  const awareness = useMemo(() => yjsService.getAwareness(documentId), [documentId]);
  
  // Connect to the document
  const connect = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await yjsService.connect(documentId);
      setIsConnected(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, user]);
  
  // Disconnect from the document
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await yjsService.disconnect(documentId);
      setIsConnected(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);
  
  // Update cursor position
  const updateCursor = useCallback((index: number) => {
    yjsService.updateCursor(documentId, index);
  }, [documentId]);
  
  // Update selection
  const updateSelection = useCallback((anchor: number, head: number) => {
    yjsService.updateSelection(documentId, anchor, head);
  }, [documentId]);
  
  // Get text content
  const getTextContent = useCallback(() => {
    return text ? text.toString() : '';
  }, [text]);
  
  // Listen for awareness updates
  useEffect(() => {
    const awarenessChangeHandler = () => {
      const states = awareness.getStates() as Map<number, YjsAwarenessState>;
      const presences: UserPresence[] = [];
      
      states.forEach((state, clientId) => {
        if (state.user) {
          presences.push({
            user: {
              id: state.user.id,
              name: state.user.name
            },
            color: state.user.color,
            cursor: state.cursor,
            selection: state.selection
          });
        }
      });
      
      setUserPresences(presences);
    };
    
    // Initialize with current states
    awarenessChangeHandler();
    
    // Listen for changes
    awareness.on('change', awarenessChangeHandler);
    
    return () => {
      awareness.off('change', awarenessChangeHandler);
    };
  }, [awareness]);
  
  // Auto disconnect on unmount
  useEffect(() => {
    return () => {
      disconnect().catch(console.error);
    };
  }, [disconnect]);
  
  return {
    doc,
    text,
    map,
    array,
    awareness,
    userPresences,
    isConnected,
    isLoading,
    error,
    connect,
    disconnect,
    updateCursor,
    updateSelection,
    getTextContent
  };
}
