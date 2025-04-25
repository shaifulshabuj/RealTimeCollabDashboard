import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  Document, 
  DocumentComment, 
  DocumentStatus,
  DocumentVersion 
} from '@/types/document';

interface DocumentState {
  documents: Document[];
  currentDocument: Document | null;
  documentComments: DocumentComment[];
  documentHistory: DocumentVersion[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDocuments: () => Promise<void>;
  fetchDocumentById: (id: string) => Promise<void>;
  createDocument: (document: Omit<Document, 'id'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  updateDocumentStatus: (id: string, status: DocumentStatus) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  
  // Comments
  fetchComments: (documentId: string) => Promise<void>;
  addComment: (comment: Omit<DocumentComment, 'id'>) => Promise<DocumentComment>;
  updateComment: (id: string, updates: Partial<DocumentComment>) => Promise<void>;
  resolveComment: (id: string, userId: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  
  // History
  fetchDocumentHistory: (documentId: string) => Promise<void>;
  createDocumentVersion: (
    documentId: string, 
    content: string, 
    comment: string
  ) => Promise<DocumentVersion>;
  restoreDocumentVersion: (documentId: string, versionId: string) => Promise<void>;
}

// Mock implementations for now - will connect to actual APIs later
const useDocumentStore = create<DocumentState>()(
  devtools(
    immer((set, get) => ({
      documents: [],
      currentDocument: null,
      documentComments: [],
      documentHistory: [],
      isLoading: false,
      error: null,
      
      // Actions with mock implementations
      fetchDocuments: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          setTimeout(() => {
            set({ documents: [] as Document[], isLoading: false });
          }, 1000);
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      fetchDocumentById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          setTimeout(() => {
            const mockDocument = {} as Document; // would be fetched from API
            set({ currentDocument: mockDocument, isLoading: false });
          }, 1000);
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      createDocument: async (document) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const newDocument = { 
            ...document, 
            id: `doc-${Date.now()}` 
          } as Document;
          
          set(state => {
            state.documents.push(newDocument);
            state.isLoading = false;
          });
          
          return newDocument;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateDocument: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set(state => {
            const index = state.documents.findIndex(doc => doc.id === id);
            if (index !== -1) {
              state.documents[index] = { ...state.documents[index], ...updates };
              if (state.currentDocument?.id === id) {
                state.currentDocument = { ...state.currentDocument, ...updates };
              }
            }
            state.isLoading = false;
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      updateDocumentStatus: async (id, status) => {
        await get().updateDocument(id, { status });
      },
      
      deleteDocument: async (id) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          set(state => {
            state.documents = state.documents.filter(doc => doc.id !== id);
            if (state.currentDocument?.id === id) {
              state.currentDocument = null;
            }
            state.isLoading = false;
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // Comments
      fetchComments: async (documentId) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          setTimeout(() => {
            set({ documentComments: [], isLoading: false });
          }, 1000);
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      addComment: async (comment) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const newComment = { 
            ...comment, 
            id: `comment-${Date.now()}` 
          } as DocumentComment;
          
          set(state => {
            state.documentComments.push(newComment);
            state.isLoading = false;
          });
          
          return newComment;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      updateComment: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          set(state => {
            const index = state.documentComments.findIndex(comment => comment.id === id);
            if (index !== -1) {
              state.documentComments[index] = { 
                ...state.documentComments[index], 
                ...updates 
              };
            }
            state.isLoading = false;
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      resolveComment: async (id, userId) => {
        set({ isLoading: true, error: null });
        try {
          set(state => {
            const index = state.documentComments.findIndex(comment => comment.id === id);
            if (index !== -1) {
              state.documentComments[index].resolved = true;
              state.documentComments[index].resolvedAt = new Date().toISOString();
              // Would get user details in real implementation
              state.documentComments[index].resolvedBy = { id: userId } as any;
            }
            state.isLoading = false;
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      deleteComment: async (id) => {
        set({ isLoading: true, error: null });
        try {
          set(state => {
            state.documentComments = state.documentComments.filter(
              comment => comment.id !== id
            );
            state.isLoading = false;
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      // History
      fetchDocumentHistory: async (documentId) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          setTimeout(() => {
            set({ documentHistory: [], isLoading: false });
          }, 1000);
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },
      
      createDocumentVersion: async (documentId, content, comment) => {
        set({ isLoading: true, error: null });
        try {
          // Mock API call
          const newVersion = {
            id: `version-${Date.now()}`,
            documentId,
            content,
            comment,
            version: get().documentHistory.length + 1,
            createdAt: new Date().toISOString(),
            // Would get user details in real implementation
            createdBy: {} as any
          } as DocumentVersion;
          
          set(state => {
            state.documentHistory.push(newVersion);
            state.isLoading = false;
          });
          
          return newVersion;
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          throw error;
        }
      },
      
      restoreDocumentVersion: async (documentId, versionId) => {
        set({ isLoading: true, error: null });
        try {
          const version = get().documentHistory.find(v => v.id === versionId);
          
          if (version) {
            await get().updateDocument(documentId, { 
              content: version.content,
              version: version.version
            });
          }
          
          set({ isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      }
    }))
  )
);

export default useDocumentStore;
