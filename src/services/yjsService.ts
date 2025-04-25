import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Awareness } from 'y-protocols/awareness';
import websocketService from './websocketService';
import { WebSocketMessageType } from '@/types/collaboration';
import useAuthStore from '@/store/authStore';

// Type declarations
interface YjsAwarenessState {
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

class YjsService {
  private docs: Map<string, Y.Doc> = new Map();
  private persistences: Map<string, IndexeddbPersistence> = new Map();
  private awarenesses: Map<string, Awareness> = new Map();
  private messageHandlerRemoval: (() => void) | null = null;
  
  // Get or create a Y.Doc for a document
  public getDocument(documentId: string): Y.Doc {
    if (!this.docs.has(documentId)) {
      // Create new Y.Doc
      const doc = new Y.Doc();
      this.docs.set(documentId, doc);
      
      // Set up persistence with IndexedDB
      const persistence = new IndexeddbPersistence(`document-${documentId}`, doc);
      this.persistences.set(documentId, persistence);
      
      // Set up awareness (cursor positions, selections, etc.)
      const awareness = new Awareness(doc);
      this.awarenesses.set(documentId, awareness);
      
      // Handle awareness updates
      awareness.on('update', this.handleAwarenessUpdate.bind(this, documentId));
      
      // Handle document updates
      doc.on('update', this.handleDocumentUpdate.bind(this, documentId));
      
      // Set up listeners for WebSocket messages if not already set up
      if (!this.messageHandlerRemoval) {
        this.messageHandlerRemoval = websocketService.onMessage(this.handleWebSocketMessage.bind(this));
      }
      
      // Set initial awareness state
      const user = useAuthStore.getState().user;
      if (user) {
        awareness.setLocalState({
          user: {
            id: user.id,
            name: user.name,
            color: this.getRandomColor(),
          }
        });
      }
    }
    
    return this.docs.get(documentId)!;
  }
  
  // Get awareness for a document
  public getAwareness(documentId: string): Awareness {
    if (!this.awarenesses.has(documentId)) {
      this.getDocument(documentId); // This will create the awareness
    }
    
    return this.awarenesses.get(documentId)!;
  }
  
  // Connect to a document for collaborative editing
  public async connect(documentId: string): Promise<void> {
    const user = useAuthStore.getState().user;
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Connect to WebSocket
    if (!websocketService.isConnected()) {
      await websocketService.connect(user.id);
    }
    
    // Join room
    await websocketService.joinRoom(documentId);
    
    // Get or create Y.Doc
    this.getDocument(documentId);
  }
  
  // Disconnect from a document
  public async disconnect(documentId: string): Promise<void> {
    // Leave WebSocket room
    await websocketService.leaveRoom();
    
    // Clean up Y.Doc and related resources
    if (this.docs.has(documentId)) {
      const doc = this.docs.get(documentId)!;
      doc.destroy();
      this.docs.delete(documentId);
    }
    
    if (this.persistences.has(documentId)) {
      const persistence = this.persistences.get(documentId)!;
      persistence.destroy();
      this.persistences.delete(documentId);
    }
    
    if (this.awarenesses.has(documentId)) {
      const awareness = this.awarenesses.get(documentId)!;
      awareness.destroy();
      this.awarenesses.delete(documentId);
    }
    
    // Disconnect from WebSocket if no more documents
    if (this.docs.size === 0) {
      websocketService.disconnect();
      
      if (this.messageHandlerRemoval) {
        this.messageHandlerRemoval();
        this.messageHandlerRemoval = null;
      }
    }
  }
  
  // Update cursor position
  public updateCursor(documentId: string, index: number): void {
    const awareness = this.getAwareness(documentId);
    const state = awareness.getLocalState() as YjsAwarenessState;
    
    if (state) {
      awareness.setLocalState({
        ...state,
        cursor: {
          ...state.cursor,
          index
        }
      });
    }
  }
  
  // Update selection
  public updateSelection(documentId: string, anchor: number, head: number): void {
    const awareness = this.getAwareness(documentId);
    const state = awareness.getLocalState() as YjsAwarenessState;
    
    if (state) {
      awareness.setLocalState({
        ...state,
        selection: { anchor, head }
      });
    }
  }
  
  // Get text content of a document
  public getText(documentId: string, name: string = 'content'): Y.Text {
    const doc = this.getDocument(documentId);
    return doc.getText(name);
  }
  
  // Get map content of a document (for metadata, etc.)
  public getMap(documentId: string, name: string = 'metadata'): Y.Map<any> {
    const doc = this.getDocument(documentId);
    return doc.getMap(name);
  }
  
  // Get array content of a document (for lists, etc.)
  public getArray(documentId: string, name: string): Y.Array<any> {
    const doc = this.getDocument(documentId);
    return doc.getArray(name);
  }
  
  // Export document state
  public exportDocument(documentId: string): Uint8Array {
    const doc = this.getDocument(documentId);
    return Y.encodeStateAsUpdate(doc);
  }
  
  // Import document state
  public importDocument(documentId: string, update: Uint8Array): void {
    const doc = this.getDocument(documentId);
    Y.applyUpdate(doc, update);
  }
  
  // Get current awareness states
  public getAwarenessStates(documentId: string): Map<number, YjsAwarenessState> {
    const awareness = this.getAwareness(documentId);
    return awareness.getStates() as Map<number, YjsAwarenessState>;
  }
  
  // Clean up resources
  public destroy(): void {
    // Clean up all documents
    for (const [documentId] of this.docs) {
      this.disconnect(documentId).catch(console.error);
    }
    
    // Clean up remaining resources
    this.docs.clear();
    this.persistences.clear();
    this.awarenesses.clear();
    
    if (this.messageHandlerRemoval) {
      this.messageHandlerRemoval();
      this.messageHandlerRemoval = null;
    }
  }
  
  // Handle Y.js document updates
  private handleDocumentUpdate(documentId: string, update: Uint8Array, origin: any): void {
    // Skip updates from WebSocket to avoid loops
    if (origin === 'websocket') {
      return;
    }
    
    // Send update to other users via WebSocket
    websocketService.sendDocumentUpdate(update);
  }
  
  // Handle awareness updates
  private handleAwarenessUpdate(documentId: string, { added, updated, removed }: { added: number[], updated: number[], removed: number[] }): void {
    const awareness = this.getAwareness(documentId);
    
    // Send awareness update to other users via WebSocket
    websocketService.sendAwarenessUpdate({
      added,
      updated,
      removed,
      states: Object.fromEntries(awareness.getStates())
    });
  }
  
  // Handle WebSocket messages
  private handleWebSocketMessage(message: any): void {
    // Skip messages from self
    const userId = useAuthStore.getState().user?.id;
    if (message.senderId === userId) {
      return;
    }
    
    // Extract document ID from room ID
    const roomId = message.roomId;
    const documentId = roomId.startsWith('doc-') ? roomId.substring(4) : roomId;
    
    // Check if we're managing this document
    if (!this.docs.has(documentId)) {
      return;
    }
    
    const doc = this.docs.get(documentId)!;
    const awareness = this.awarenesses.get(documentId)!;
    
    switch (message.type) {
      case WebSocketMessageType.SYNC_UPDATE:
        // Apply document update
        const update = message.data.update;
        Y.applyUpdate(doc, update, 'websocket');
        break;
        
      case WebSocketMessageType.AWARENESS_UPDATE:
        // Apply awareness update
        const awarenessUpdate = message.data;
        
        // Merge remote awareness states with local
        for (const clientId of awarenessUpdate.added.concat(awarenessUpdate.updated)) {
          const state = awarenessUpdate.states[clientId];
          awareness.setStateLazy(clientId, state);
        }
        
        // Remove states for clients that left
        for (const clientId of awarenessUpdate.removed) {
          awareness.setStateLazy(clientId, null);
        }
        
        awareness.applyLocalStateChange();
        break;
    }
  }
  
  // Generate a random color for user presence
  private getRandomColor(): string {
    const colors = [
      '#f44336', // Red
      '#e91e63', // Pink
      '#9c27b0', // Purple
      '#673ab7', // Deep Purple
      '#3f51b5', // Indigo
      '#2196f3', // Blue
      '#03a9f4', // Light Blue
      '#00bcd4', // Cyan
      '#009688', // Teal
      '#4caf50', // Green
      '#8bc34a', // Light Green
      '#cddc39', // Lime
      '#ffc107', // Amber
      '#ff9800', // Orange
      '#ff5722'  // Deep Orange
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

// Create a singleton instance
const yjsService = new YjsService();

export default yjsService;
