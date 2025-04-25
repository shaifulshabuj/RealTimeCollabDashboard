import { useState, useEffect, useCallback } from 'react';
import useDocumentStore from '@/store/documentStore';
import { Document, DocumentStatus, DocumentComment, DocumentVersion } from '@/types/document';
import { useYjs } from './useYjs';

interface UseDocumentOptions {
  documentId?: string;
  autoConnect?: boolean;
}

interface UseDocumentResult {
  document: Document | null;
  isLoading: boolean;
  error: string | null;
  comments: DocumentComment[];
  history: DocumentVersion[];
  collaborators: { id: string; name: string; color: string }[];
  
  // Y.js integration
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  
  // Document actions
  fetchDocument: () => Promise<void>;
  updateDocument: (updates: Partial<Document>) => Promise<void>;
  updateStatus: (status: DocumentStatus) => Promise<void>;
  
  // Comments actions
  fetchComments: () => Promise<void>;
  addComment: (comment: Omit<DocumentComment, 'id'>) => Promise<DocumentComment>;
  updateComment: (id: string, updates: Partial<DocumentComment>) => Promise<void>;
  resolveComment: (id: string, userId: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  
  // History actions
  fetchHistory: () => Promise<void>;
  createVersion: (content: string, comment: string) => Promise<DocumentVersion>;
  restoreVersion: (versionId: string) => Promise<void>;
}

export function useDocument({
  documentId,
  autoConnect = true
}: UseDocumentOptions = {}): UseDocumentResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Document store state
  const document = useDocumentStore(state => 
    documentId ? (state.currentDocument?.id === documentId ? state.currentDocument : null) : null
  );
  const comments = useDocumentStore(state => 
    documentId ? state.documentComments.filter(c => c.documentId === documentId) : []
  );
  const history = useDocumentStore(state => 
    documentId ? state.documentHistory.filter(v => v.documentId === documentId) : []
  );
  
  // Document store actions
  const fetchDocumentById = useDocumentStore(state => state.fetchDocumentById);
  const updateDocument = useDocumentStore(state => state.updateDocument);
  const updateDocumentStatus = useDocumentStore(state => state.updateDocumentStatus);
  const fetchComments = useDocumentStore(state => state.fetchComments);
  const addComment = useDocumentStore(state => state.addComment);
  const updateComment = useDocumentStore(state => state.updateComment);
  const resolveComment = useDocumentStore(state => state.resolveComment);
  const deleteComment = useDocumentStore(state => state.deleteComment);
  const fetchDocumentHistory = useDocumentStore(state => state.fetchDocumentHistory);
  const createDocumentVersion = useDocumentStore(state => state.createDocumentVersion);
  const restoreDocumentVersion = useDocumentStore(state => state.restoreDocumentVersion);
  
  // Y.js integration for real-time collaboration
  const {
    isConnected,
    connect,
    disconnect,
    userPresences
  } = useYjs({
    documentId: documentId || '',
    textName: 'content',
    mapName: 'metadata'
  });
  
  // Map user presences to collaborators
  const collaborators = userPresences.map(presence => ({
    id: presence.user.id,
    name: presence.user.name,
    color: presence.color
  }));
  
  // Fetch document data
  const fetchDocument = useCallback(async () => {
    if (!documentId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchDocumentById(documentId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, fetchDocumentById]);
  
  // Update document status
  const updateStatus = useCallback(async (status: DocumentStatus) => {
    if (!documentId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await updateDocumentStatus(documentId, status);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, updateDocumentStatus]);
  
  // Fetch document comments
  const fetchDocumentComments = useCallback(async () => {
    if (!documentId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchComments(documentId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, fetchComments]);
  
  // Fetch document history
  const fetchHistory = useCallback(async () => {
    if (!documentId) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await fetchDocumentHistory(documentId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [documentId, fetchDocumentHistory]);
  
  // Create a new document version
  const createVersion = useCallback(async (content: string, comment: string) => {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const version = await createDocumentVersion(documentId, content, comment);
      return version;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documentId, createDocumentVersion]);
  
  // Restore a document version
  const restoreVersion = useCallback(async (versionId: string) => {
    if (!documentId) {
      throw new Error('Document ID is required');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await restoreDocumentVersion(documentId, versionId);
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [documentId, restoreDocumentVersion]);
  
  // Initial data loading
  useEffect(() => {
    if (documentId) {
      fetchDocument();
      fetchDocumentComments();
      fetchHistory();
    }
  }, [documentId, fetchDocument, fetchDocumentComments, fetchHistory]);
  
  // Auto-connect to real-time collaboration
  useEffect(() => {
    if (documentId && autoConnect && !isConnected) {
      connect().catch(err => {
        console.error('Failed to connect to real-time collaboration:', err);
        setError('Failed to connect to real-time collaboration: ' + (err as Error).message);
      });
    }
    
    return () => {
      if (isConnected) {
        disconnect().catch(console.error);
      }
    };
  }, [documentId, autoConnect, isConnected, connect, disconnect]);
  
  return {
    document,
    isLoading,
    error,
    comments,
    history,
    collaborators,
    isConnected,
    connect,
    disconnect,
    fetchDocument,
    updateDocument,
    updateStatus,
    fetchComments: fetchDocumentComments,
    addComment,
    updateComment,
    resolveComment,
    deleteComment,
    fetchHistory,
    createVersion,
    restoreVersion
  };
}
