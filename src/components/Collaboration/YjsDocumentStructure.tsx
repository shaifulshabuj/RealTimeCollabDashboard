import React, { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { useYjsContext } from '@/hooks/useYjsContext';

interface YjsDocumentStructureProps {
  documentId?: string; // Made optional since it's not used in this component
  initialTitle?: string;
  initialMetadata?: Record<string, unknown>;
  onDocumentLoaded?: (doc: Y.Doc) => void;
}

/**
 * YjsDocumentStructure handles the initialization and structure of a Y.js document
 * It ensures the document has the proper structure with content, metadata, and comments
 */
const YjsDocumentStructure: React.FC<YjsDocumentStructureProps> = ({
  initialTitle = 'Untitled Document',
  initialMetadata = {},
  onDocumentLoaded
}) => {
  const {
    doc,
    text,
    map,
    array,
    isConnected,
    isLoading,
    error,
    getTitle,
    setTitle,
    getMetadata,
    setMetadata
  } = useYjsContext();
  
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize document structure when connected
  useEffect(() => {
    if (isConnected && !isLoading && doc && text && map && array && !isInitialized) {
      // Initialize document structure if it's a new document
      if (text.length === 0) {
        // Set initial content if empty
        text.insert(0, '');
      }

      // Set initial title if not set
      if (!getTitle()) {
        setTitle(initialTitle);
      }

      // Set initial metadata if not set
      const currentMetadata = getMetadata();
      Object.entries(initialMetadata).forEach(([key, value]) => {
        if (currentMetadata[key] === undefined) {
          setMetadata(key, value);
        }
      });

      // Initialize version if not set
      if (!map.get('version')) {
        map.set('version', 1);
        map.set('versionHistory', [{
          version: 1,
          name: 'Initial Version',
          timestamp: new Date().toISOString(),
          snapshot: Y.encodeStateAsUpdate(doc)
        }]);
      }

      // Set creation time if not set
      if (!map.get('createdAt')) {
        map.set('createdAt', new Date().toISOString());
      }

      // Update last modified time
      map.set('lastModifiedAt', new Date().toISOString());

      // Initialize document schema version for future compatibility
      if (!map.get('schemaVersion')) {
        map.set('schemaVersion', '1.0');
      }

      // Mark as initialized
      setIsInitialized(true);

      // Notify parent component that document is loaded
      if (onDocumentLoaded && doc) {
        onDocumentLoaded(doc);
      }
    }
  }, [
    isConnected, 
    isLoading, 
    doc, 
    text, 
    map, 
    array, 
    isInitialized,
    initialTitle,
    initialMetadata,
    getTitle,
    setTitle,
    getMetadata,
    setMetadata,
    onDocumentLoaded
  ]);

  // Update last modified time when document changes
  useEffect(() => {
    if (isConnected && map && doc) {
      const updateLastModified = () => {
        map.set('lastModifiedAt', new Date().toISOString());
      };

      // Listen for document updates
      doc.on('update', updateLastModified);

      return () => {
        doc.off('update', updateLastModified);
      };
    }
  }, [isConnected, doc, map]);

  // Handle errors
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  // Show loading state
  if (isLoading) {
    return <div className="text-gray-500">Loading document structure...</div>;
  }

  // Nothing to render - this is just a structural component
  return null;
};

export default YjsDocumentStructure;
