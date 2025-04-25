import React, { createContext, useEffect, ReactNode } from 'react';
import * as Y from 'yjs';
import { useYjs, UserPresence } from '@/hooks/useYjs';
import { Awareness } from 'y-protocols/awareness';

// Define types for document structure
export interface CommentData {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  position?: number;
  createdAt: string;
  updatedAt?: string;
  resolved?: boolean;
}

export interface VersionData {
  version: number;
  name: string;
  description?: string;
  timestamp: string;
  snapshot: Uint8Array | null;
}

// Define the context shape
interface YjsContextType {
  // Document components
  doc: Y.Doc | null;
  text: Y.Text | null;
  map: Y.Map<unknown> | null;
  array: Y.Array<unknown> | null;
  
  // Awareness and presence
  awareness: Awareness | null;
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
  
  // Document structure helpers
  getTitle: () => string;
  setTitle: (title: string) => void;
  getMetadata: () => Record<string, unknown>;
  setMetadata: (key: string, value: unknown) => void;
  getComments: () => Array<CommentData>;
  addComment: (comment: CommentData) => void;
  updateComment: (id: string, updates: Partial<CommentData>) => void;
  deleteComment: (id: string) => void;
  getVersion: () => number;
  createVersion: (name: string, description?: string) => void;
  getVersionHistory: () => Array<VersionData>;
}

// Create the context with default values
const YjsContext = createContext<YjsContextType>({
  doc: null,
  text: null,
  map: null,
  array: null,
  awareness: null,
  userPresences: [],
  isConnected: false,
  isLoading: false,
  error: null,
  connect: async () => {},
  disconnect: async () => {},
  updateCursor: () => {},
  updateSelection: () => {},
  getTextContent: () => '',
  getTitle: () => '',
  setTitle: () => {},
  getMetadata: () => ({}),
  setMetadata: () => {},
  getComments: () => [],
  addComment: () => {},
  updateComment: () => {},
  deleteComment: () => {},
  getVersion: () => 0,
  createVersion: () => {},
  getVersionHistory: () => []
});

interface YjsProviderProps {
  children: ReactNode;
  documentId: string;
}

export const YjsProvider: React.FC<YjsProviderProps> = ({ children, documentId }) => {
  const {
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
  } = useYjs({
    documentId,
    textName: 'content',
    mapName: 'metadata',
    arrayName: 'comments'
  });

  // Connect to the document when the component mounts
  useEffect(() => {
    connect().catch(console.error);
    
    return () => {
      disconnect().catch(console.error);
    };
  }, [connect, disconnect]);

  // Document structure helper methods
  const getTitle = (): string => {
    if (!map) return '';
    return map.get('title') || '';
  };

  const setTitle = (title: string): void => {
    if (!map) return;
    map.set('title', title);
  };

  const getMetadata = (): Record<string, unknown> => {
    if (!map) return {};
    
    const metadata: Record<string, unknown> = {};
    map.forEach((value, key) => {
      // Skip special keys that are handled separately
      if (key !== 'title' && key !== 'version' && key !== 'versionHistory') {
        metadata[key] = value;
      }
    });
    
    return metadata;
  };

  const setMetadata = (key: string, value: unknown): void => {
    if (!map) return;
    map.set(key, value);
  };

  const getComments = (): Array<CommentData> => {
    if (!array) return [];
    
    const comments: Array<CommentData> = [];
    array.forEach(comment => {
      comments.push(comment);
    });
    
    return comments;
  };

  const addComment = (comment: CommentData): void => {
    if (!array) return;
    array.push([comment]);
  };

  const updateComment = (id: string, updates: Partial<CommentData>): void => {
    if (!array) return;
    
    for (let i = 0; i < array.length; i++) {
      const comment = array.get(i);
      if (comment.id === id) {
        const updatedComment = { ...comment, ...updates };
        array.delete(i, 1);
        array.insert(i, [updatedComment]);
        break;
      }
    }
  };

  const deleteComment = (id: string): void => {
    if (!array) return;
    
    for (let i = 0; i < array.length; i++) {
      const comment = array.get(i);
      if (comment.id === id) {
        array.delete(i, 1);
        break;
      }
    }
  };

  const getVersion = (): number => {
    if (!map) return 0;
    return map.get('version') || 0;
  };

  const createVersion = (name: string, description?: string): void => {
    if (!map) return;
    
    const currentVersion = getVersion();
    const newVersion = currentVersion + 1;
    
    // Update current version
    map.set('version', newVersion);
    
    // Get current version history or initialize if not exists
    const versionHistory = map.get('versionHistory') || [];
    
    // Create new version entry
    const versionEntry = {
      version: newVersion,
      name,
      description,
      timestamp: new Date().toISOString(),
      snapshot: doc ? Y.encodeStateAsUpdate(doc) : null
    };
    
    // Add to version history
    versionHistory.push(versionEntry);
    map.set('versionHistory', versionHistory);
  };

  const getVersionHistory = (): Array<VersionData> => {
    if (!map) return [];
    return map.get('versionHistory') || [];
  };

  const contextValue: YjsContextType = {
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
    getTextContent,
    getTitle,
    setTitle,
    getMetadata,
    setMetadata,
    getComments,
    addComment,
    updateComment,
    deleteComment,
    getVersion,
    createVersion,
    getVersionHistory
  };

  return (
    <YjsContext.Provider value={contextValue}>
      {children}
    </YjsContext.Provider>
  );
};

// Export the context for use in the hook file
export { YjsContext };
