import { useEffect, useCallback, useState, useRef } from 'react';
import { WebSocketMessageType, WebSocketMessage } from '@/types/collaboration';
import websocketService from '@/services/websocketService';
import yjsService from '@/services/yjsService';
import useAuthStore from '@/store/authStore';

/**
 * Hook to sync Y.js documents over WebSocket
 */
export const useWebSocketSync = (documentId: string) => {
  const { user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(websocketService.isConnected());
  const [isInRoom, setIsInRoom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket server
  const connect = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Connect to WebSocket server if not already connected
      if (!websocketService.isConnected()) {
        await websocketService.connect(user.id);
      }

      // Join the document room
      await websocketService.joinRoom(documentId);
      setIsInRoom(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError((err as Error).message);
      setIsLoading(false);
    }
  }, [user, documentId]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(async () => {
    try {
      if (websocketService.isConnected() && isInRoom) {
        await websocketService.leaveRoom();
        setIsInRoom(false);
      }
    } catch (err) {
      console.error('Error disconnecting from WebSocket:', err);
      setError((err as Error).message);
    }
  }, [isInRoom]);

  // Handle Y.js document updates
  const setupDocumentSync = useCallback(() => {
    if (!documentId || !user) return;

    const doc = yjsService.getDocument(documentId);
    if (!doc) return;

    // Set up document update handler
    const updateHandler = (update: Uint8Array, origin: unknown) => {
      // Only send updates that originated locally (not from WebSocket)
      if (origin !== 'websocket') {
        websocketService.sendDocumentUpdate(update);
      }
    };

    // Subscribe to document updates
    doc.on('update', updateHandler);

    // Set up awareness update handler
    const awareness = yjsService.getAwareness(documentId);
    if (awareness) {
      const awarenessUpdateHandler = ({ added, updated }: { added: number[], updated: number[], removed: number[] }) => {
        // Only send local awareness updates
        const localClientId = doc.clientID;
        if (added.includes(localClientId) || updated.includes(localClientId)) {
          const awarenessState = awareness.getLocalState();
          if (awarenessState) {
            websocketService.sendAwarenessUpdate({
              clientId: localClientId,
              state: awarenessState
            });
          }
        }
      };

      awareness.on('update', awarenessUpdateHandler);

      // Clean up awareness handler
      return () => {
        awareness.off('update', awarenessUpdateHandler);
        doc.off('update', updateHandler);
      };
    }

    // Clean up document handler
    return () => {
      doc.off('update', updateHandler);
    };
  }, [documentId, user]);

  // Handle incoming WebSocket messages
  const setupMessageHandler = useCallback(() => {
    // Note: YjsService already handles most of the WebSocket messages
    // This is just for additional custom handling if needed
    const messageHandler = (message: WebSocketMessage): void => {
      if (!documentId || message.roomId !== `doc-${documentId}`) return;

      // Handle custom message types not already handled by YjsService
      switch (message.type) {
        case WebSocketMessageType.JOIN_ROOM:
          // Handle user joining the room (log removed to avoid linting issues)
          // User joined notification could be shown in the UI instead
          break;

        case WebSocketMessageType.LEAVE_ROOM:
          // Handle user leaving the room (log removed to avoid linting issues)
          // User left notification could be shown in the UI instead
          break;

        // Other custom message handling can be added here
        // Note: SYNC_UPDATE and AWARENESS_UPDATE are already handled by YjsService
      }
    };

    // Register message handler
    const unsubscribe = websocketService.onMessage(messageHandler);
    return unsubscribe;
  }, [documentId]);

  // Handle WebSocket connection status changes
  const setupConnectionStatusHandler = useCallback(() => {
    const connectionStatusHandler = (connected: boolean) => {
      setIsConnected(connected);
      
      // If disconnected, try to reconnect
      if (!connected && user) {
        // Attempt to reconnect after a delay
        setTimeout(() => {
          connect().catch(console.error);
        }, 2000);
      }
    };

    // Register connection status handler
    const unsubscribe = websocketService.onConnectionStatusChange(connectionStatusHandler);
    return unsubscribe;
  }, [connect, user]);

  // Track if the component is mounted
  const isMounted = useRef(true);

  // Set up WebSocket connection and handlers
  useEffect(() => {
    if (!documentId || !user) return;

    // Set isMounted to true when the effect runs
    isMounted.current = true;

    // Connect to WebSocket
    connect().catch(err => {
      if (isMounted.current) {
        console.error(err);
      }
    });

    // Set up document sync
    const cleanupDocSync = setupDocumentSync();
    
    // Set up message handler
    const cleanupMessageHandler = setupMessageHandler();
    
    // Set up connection status handler
    const cleanupConnectionHandler = setupConnectionStatusHandler();

    // Clean up on unmount
    return () => {
      // Set isMounted to false when cleaning up
      isMounted.current = false;
      
      if (cleanupDocSync) cleanupDocSync();
      if (cleanupMessageHandler) cleanupMessageHandler();
      if (cleanupConnectionHandler) cleanupConnectionHandler();
      
      disconnect().catch(err => {
        console.error('Error during disconnect:', err);
      });
    };
  }, [
    documentId, 
    user, 
    connect, 
    disconnect, 
    setupDocumentSync, 
    setupMessageHandler, 
    setupConnectionStatusHandler
  ]);

  return {
    isConnected,
    isInRoom,
    isLoading,
    error,
    connect,
    disconnect
  };
};

export default useWebSocketSync;
