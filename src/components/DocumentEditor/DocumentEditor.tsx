import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  ShareIcon, 
  UserPlusIcon, 
  DocumentDuplicateIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useDocument } from '@/hooks/useDocument';
import { DocumentStatus } from '@/types/document';
import UserPresenceIndicator from './UserPresenceIndicator';
import EditorToolbar from './EditorToolbar';
import CommentSidebar from './CommentSidebar';
import VersionHistorySidebar from './VersionHistorySidebar';
import CollaboratorsSidebar from './CollaboratorsSidebar';

export default function DocumentEditor() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const editorRef = useRef<HTMLDivElement>(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  
  const {
    document,
    isLoading,
    error,
    collaborators,
    isConnected,
    connect,
    updateDocument,
    updateStatus
  } = useDocument({ 
    documentId: documentId || '', 
    autoConnect: true 
  });
  
  // Initialize editor content when document loads
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
    }
  }, [document]);
  
  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    if (!document || title === document.title && content === document.content) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      await updateDocument(document.id, {
        title,
        content,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to auto-save document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [document, title, content, updateDocument]);
  
  // Auto-save on content change (debounced)
  useEffect(() => {
    if (!document) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [document, title, content, handleAutoSave]);
  
  // Handle document status change
  const handleStatusChange = async (status: DocumentStatus) => {
    if (!documentId) return;
    
    try {
      await updateStatus(status);
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };
  
  // Handle editor content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };
  
  // Navigate back to documents list
  const handleBack = () => {
    navigate('/documents');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading document...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading document: {error}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Documents
          </button>
        </div>
      </div>
    );
  }
  
  if (!document) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XMarkIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Document not found. It may have been deleted or you don't have permission to view it.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Back to Documents
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Document header */}
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center mr-4 text-neutral-500 hover:text-neutral-700"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Back</span>
          </button>
          
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold text-neutral-900 border-0 focus:outline-none focus:ring-0 bg-transparent w-full"
              placeholder="Document Title"
            />
            <div className="flex items-center text-sm text-neutral-500 mt-1">
              <span className={isConnected ? "text-green-600" : "text-red-600"}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
              <span className="mx-2">•</span>
              <span>{isSaving ? "Saving..." : "Saved"}</span>
              <span className="mx-2">•</span>
              <span>
                Last edited {document.updatedAt
                  ? new Date(document.updatedAt).toLocaleString()
                  : "never"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Status dropdown */}
          <div className="relative">
            <select
              id="status"
              name="status"
              value={document.status}
              onChange={(e) => handleStatusChange(e.target.value as DocumentStatus)}
              className={`
                block border-0 rounded-md py-1 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500
                ${
                  document.status === DocumentStatus.PUBLISHED
                    ? 'bg-green-100 text-green-800'
                    : document.status === DocumentStatus.IN_REVIEW
                    ? 'bg-yellow-100 text-yellow-800'
                    : document.status === DocumentStatus.DRAFT
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-neutral-100 text-neutral-800'
                }
              `}
            >
              {Object.values(DocumentStatus).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
          
          {/* Document actions */}
          <button
            type="button"
            onClick={() => setShowCollaborators(!showCollaborators)}
            className={`
              p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500
              ${showCollaborators ? 'bg-neutral-100' : ''}
            `}
          >
            <UserPlusIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Collaborators</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowComments(!showComments)}
            className={`
              p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500
              ${showComments ? 'bg-neutral-100' : ''}
            `}
          >
            <ChatBubbleLeftIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Comments</span>
          </button>
          
          <button
            type="button"
            onClick={() => setShowVersionHistory(!showVersionHistory)}
            className={`
              p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500
              ${showVersionHistory ? 'bg-neutral-100' : ''}
            `}
          >
            <ClockIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Version History</span>
          </button>
          
          <button
            type="button"
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <ShareIcon className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Share</span>
          </button>
        </div>
      </div>
      
      {/* Toolbar */}
      <EditorToolbar />
      
      {/* Main editor area with sidebars */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content area */}
        <div className="flex-1 overflow-auto p-4">
          <div 
            ref={editorRef}
            className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg border border-neutral-200 p-6 min-h-[calc(100vh-16rem)]"
          >
            <textarea
              value={content}
              onChange={handleContentChange}
              className="w-full h-full min-h-[calc(100vh-20rem)] border-0 focus:outline-none focus:ring-0 bg-transparent resize-none font-normal text-base leading-relaxed"
              placeholder="Start typing your document..."
            />
          </div>
        </div>
        
        {/* Sidebars */}
        {showVersionHistory && (
          <VersionHistorySidebar
            documentId={document.id}
            onClose={() => setShowVersionHistory(false)}
          />
        )}
        
        {showComments && (
          <CommentSidebar
            documentId={document.id}
            onClose={() => setShowComments(false)}
          />
        )}
        
        {showCollaborators && (
          <CollaboratorsSidebar
            documentId={document.id}
            collaborators={collaborators}
            onClose={() => setShowCollaborators(false)}
          />
        )}
      </div>
      
      {/* Collaborator presence indicator */}
      <div className="border-t border-neutral-200 px-4 py-2">
        <UserPresenceIndicator collaborators={collaborators} />
      </div>
    </div>
  );
}
