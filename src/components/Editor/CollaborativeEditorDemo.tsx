import React from 'react';
import { YjsProvider } from '@/components/Collaboration/YjsProvider';
import CollaborativeEditor from './CollaborativeEditor';
import useAuthStore from '@/store/authStore';

const CollaborativeEditorDemo: React.FC = () => {
  const { user } = useAuthStore();
  const documentId = 'collaborative-editor-demo';

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Collaborative Rich Text Editor</h1>
      
      {/* Current user info */}
      {user && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <h2 className="font-semibold text-sm text-blue-800">You are signed in as:</h2>
          <div className="flex items-center mt-1">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="ml-2">
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Collaborative editor with Yjs provider */}
      <YjsProvider documentId={documentId}>
        <CollaborativeEditor documentId={documentId} />
      </YjsProvider>
      
      <div className="mt-8 text-sm text-gray-600 p-3 bg-gray-50 rounded">
        <h3 className="font-semibold mb-1">How to test:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Open this page in multiple browser windows</li>
          <li>Sign in with different user accounts in each window</li>
          <li>Edit the document in one window and see changes in real-time in the other windows</li>
          <li>Try formatting text using the toolbar buttons or keyboard shortcuts</li>
          <li>Test the undo/redo functionality</li>
          <li>Notice how user presence is displayed in real-time</li>
        </ol>
        
        <div className="mt-4">
          <h4 className="font-semibold">Features:</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Real-time collaborative editing</li>
            <li>Rich text formatting (bold, italic, underline, code)</li>
            <li>Headings and paragraph styles</li>
            <li>Undo/redo functionality</li>
            <li>User presence awareness</li>
            <li>Keyboard shortcuts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditorDemo;
