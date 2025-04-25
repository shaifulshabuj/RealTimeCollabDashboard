import { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import useDocumentStore from '@/store/documentStore';
import { DocumentVersion } from '@/types/document';
import { useAuth } from '@/hooks/useAuth';

interface VersionHistorySidebarProps {
  documentId: string;
  onClose: () => void;
}

export default function VersionHistorySidebar({ documentId, onClose }: VersionHistorySidebarProps) {
  const { user } = useAuth();
  const [newVersionComment, setNewVersionComment] = useState('');
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const history = useDocumentStore((state) => 
    state.documentHistory.filter(v => v.documentId === documentId)
  );
  const fetchHistory = useDocumentStore((state) => state.fetchDocumentHistory);
  const createVersion = useDocumentStore((state) => state.createDocumentVersion);
  const restoreVersion = useDocumentStore((state) => state.restoreDocumentVersion);
  const document = useDocumentStore((state) => 
    state.currentDocument?.id === documentId ? state.currentDocument : null
  );
  
  // Fetch version history when component mounts
  useEffect(() => {
    const loadHistory = async () => {
      try {
        await fetchHistory(documentId);
      } catch (error) {
        console.error('Failed to fetch version history:', error);
      }
    };
    
    loadHistory();
  }, [documentId, fetchHistory]);
  
  // Handle creating a new version
  const handleCreateVersion = async () => {
    if (!user || !document) return;
    
    setIsCreatingVersion(true);
    
    try {
      await createVersion(
        documentId,
        document.content,
        newVersionComment || `Version ${history.length + 1}`
      );
      
      setNewVersionComment('');
    } catch (error) {
      console.error('Failed to create version:', error);
    } finally {
      setIsCreatingVersion(false);
    }
  };
  
  // Handle restoring a version
  const handleRestoreVersion = async (versionId: string) => {
    if (!user) return;
    
    setIsRestoring(true);
    
    try {
      await restoreVersion(versionId);
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Sort versions by creation time (newest first)
  const sortedVersions = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  return (
    <div className="w-80 border-l border-neutral-200 bg-white flex flex-col h-full">
      <div className="border-b border-neutral-200 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium text-neutral-900 flex items-center">
          <ClockIcon className="h-5 w-5 text-neutral-500 mr-2" />
          Version History
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-500"
        >
          <XMarkIcon className="h-5 w-5" />
          <span className="sr-only">Close panel</span>
        </button>
      </div>
      
      <div className="p-4 border-b border-neutral-200">
        <div>
          <label htmlFor="version-comment" className="block text-sm font-medium text-neutral-700">
            Version comment (optional)
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="version-comment"
              id="version-comment"
              className="block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="What changed in this version?"
              value={newVersionComment}
              onChange={(e) => setNewVersionComment(e.target.value)}
              disabled={isCreatingVersion}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleCreateVersion}
            disabled={isCreatingVersion}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-neutral-300 disabled:cursor-not-allowed"
          >
            {isCreatingVersion ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Creating...
              </>
            ) : (
              'Save Current Version'
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedVersions.length === 0 ? (
          <div className="text-center py-6">
            <ClockIcon className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">No version history yet</p>
            <p className="text-neutral-400 text-xs mt-1">
              Save a version to track changes over time
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {sortedVersions.map((version) => (
              <VersionItem
                key={version.id}
                version={version}
                onRestore={handleRestoreVersion}
                isRestoring={isRestoring}
                isCurrent={version.version === document?.version}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface VersionItemProps {
  version: DocumentVersion;
  onRestore: (versionId: string) => void;
  isRestoring: boolean;
  isCurrent: boolean;
}

function VersionItem({ version, onRestore, isRestoring, isCurrent }: VersionItemProps) {
  const formattedDate = new Date(version.createdAt).toLocaleString();
  
  return (
    <li className="px-4 py-4 hover:bg-neutral-50">
      <div>
        <div className="flex justify-between">
          <h4 className="text-sm font-medium text-neutral-900">
            Version {version.version}
            {isCurrent && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Current
              </span>
            )}
          </h4>
          <time dateTime={version.createdAt} className="text-xs text-neutral-500">
            {formattedDate}
          </time>
        </div>
        
        <div className="mt-1">
          <p className="text-sm text-neutral-500">
            Created by {version.createdBy.name}
          </p>
        </div>
        
        {version.comment && (
          <div className="mt-1">
            <p className="text-sm text-neutral-700">{version.comment}</p>
          </div>
        )}
        
        {!isCurrent && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onRestore(version.id)}
              disabled={isRestoring}
              className="inline-flex items-center px-3 py-1 border border-neutral-300 shadow-sm text-xs font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {isRestoring ? 'Restoring...' : 'Restore this version'}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
