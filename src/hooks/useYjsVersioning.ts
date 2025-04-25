import { useState, useCallback } from 'react';
import * as Y from 'yjs';
import { useYjsContext } from '@/hooks/useYjsContext';

export interface DocumentVersion {
  version: number;
  name: string;
  description?: string;
  timestamp: string;
  snapshot: Uint8Array | null;
}

interface UseYjsVersioningResult {
  // Version information
  currentVersion: number;
  versionHistory: DocumentVersion[];
  
  // Methods
  createVersion: (name: string, description?: string) => void;
  restoreVersion: (version: number) => Promise<boolean>;
  compareVersions: (versionA: number, versionB: number) => {
    added: string[];
    removed: string[];
    changed: string[];
  };
  
  // Status
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for working with document versioning in Y.js
 */
export function useYjsVersioning(): UseYjsVersioningResult {
  const {
    doc,
    map,
    getVersion,
    createVersion: contextCreateVersion,
    getVersionHistory
  } = useYjsContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create a new version
  const createVersion = useCallback((name: string, description?: string) => {
    try {
      contextCreateVersion(name, description);
    } catch (err) {
      setError(`Failed to create version: ${(err as Error).message}`);
    }
  }, [contextCreateVersion]);

  // Restore a previous version
  const restoreVersion = useCallback(async (version: number): Promise<boolean> => {
    if (!doc || !map) {
      setError('Document not loaded');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const versionHistory = getVersionHistory();
      const versionEntry = versionHistory.find((v: DocumentVersion) => v.version === version);

      if (!versionEntry || !versionEntry.snapshot) {
        throw new Error(`Version ${version} not found or has no snapshot`);
      }

      // Apply the snapshot to restore the document state
      Y.applyUpdate(doc, versionEntry.snapshot);

      // Create a new version to mark the restoration
      contextCreateVersion(`Restored from version ${version}`, 
        `Document restored to version "${versionEntry.name}" (${version})`);

      setIsLoading(false);
      return true;
    } catch (err) {
      setError(`Failed to restore version: ${(err as Error).message}`);
      setIsLoading(false);
      return false;
    }
  }, [doc, map, getVersionHistory, contextCreateVersion]);

  // Compare two versions to see what changed
  const compareVersions = useCallback((versionA: number, versionB: number) => {
    const result = {
      added: [] as string[],
      removed: [] as string[],
      changed: [] as string[]
    };

    if (!doc) {
      setError('Document not loaded');
      return result;
    }

    try {
      const versionHistory = getVersionHistory();
      const versionEntryA = versionHistory.find((v: DocumentVersion) => v.version === versionA);
      const versionEntryB = versionHistory.find((v: DocumentVersion) => v.version === versionB);

      if (!versionEntryA || !versionEntryA.snapshot) {
        throw new Error(`Version ${versionA} not found or has no snapshot`);
      }

      if (!versionEntryB || !versionEntryB.snapshot) {
        throw new Error(`Version ${versionB} not found or has no snapshot`);
      }

      // Create temporary docs to apply the snapshots
      const docA = new Y.Doc();
      const docB = new Y.Doc();

      Y.applyUpdate(docA, versionEntryA.snapshot);
      Y.applyUpdate(docB, versionEntryB.snapshot);

      // Compare text content
      const textA = docA.getText('content').toString();
      const textB = docB.getText('content').toString();

      // Simple line-by-line comparison (could be enhanced with diff algorithm)
      const linesA = textA.split('\n');
      const linesB = textB.split('\n');

      const uniqueToA = linesA.filter(line => !linesB.includes(line));
      const uniqueToB = linesB.filter(line => !linesA.includes(line));

      result.removed = uniqueToA;
      result.added = uniqueToB;

      // Compare metadata
      const mapA = docA.getMap('metadata');
      const mapB = docB.getMap('metadata');

      mapA.forEach((valueA, key) => {
        if (!mapB.has(key)) {
          result.removed.push(`Metadata: ${key}`);
        } else if (JSON.stringify(valueA) !== JSON.stringify(mapB.get(key))) {
          result.changed.push(`Metadata: ${key}`);
        }
      });

      mapB.forEach((_, key) => {
        if (!mapA.has(key)) {
          result.added.push(`Metadata: ${key}`);
        }
      });

      // Clean up temporary docs
      docA.destroy();
      docB.destroy();

      return result;
    } catch (err) {
      setError(`Failed to compare versions: ${(err as Error).message}`);
      return result;
    }
  }, [doc, getVersionHistory]);

  return {
    currentVersion: getVersion(),
    versionHistory: getVersionHistory(),
    createVersion,
    restoreVersion,
    compareVersions,
    isLoading,
    error
  };
}

export default useYjsVersioning;
