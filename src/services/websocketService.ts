import { io, Socket } from 'socket.io-client';
import { 
  WebSocketMessage, 
  WebSocketMessageType 
} from '@/types/collaboration';

// Configuration
const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL || 'ws://localhost:8080';

class WebSocketService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: WebSocketMessage) => void)[] = [];
  private connectionStatusHandlers: ((connected: boolean) => void)[] = [];
  private userId: string | null = null;
  private roomId: string | null = null;
  
  // Connect to the WebSocket server
  public connect(userId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        
        this.socket = io(WS_SERVER_URL, {
          transports: ['websocket'],
          query: { userId },
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000
        });
        
        this.socket.on('connect', () => {
          console.log('WebSocket connected');
          this.notifyConnectionStatusChange(true);
          resolve(true);
        });
        
        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
          this.notifyConnectionStatusChange(false);
        });
        
        this.socket.on('reconnect', () => {
          console.log('WebSocket reconnected');
          this.notifyConnectionStatusChange(true);
          
          // Rejoin room if needed
          if (this.roomId) {
            this.joinRoom(this.roomId).catch(console.error);
          }
        });
        
        this.socket.on('error', (error) => {
          console.error('WebSocket error:', error);
          this.notifyConnectionStatusChange(false);
          reject(error);
        });
        
        this.socket.on('message', (message: WebSocketMessage) => {
          this.handleIncomingMessage(message);
        });
      } catch (error) {
        console.error('Error connecting to WebSocket:', error);
        reject(error);
      }
    });
  }
  
  // Disconnect from the WebSocket server
  public disconnect(): void {
    if (this.socket) {
      // Leave room before disconnecting
      if (this.roomId) {
        this.leaveRoom().catch(console.error);
      }
      
      this.socket.disconnect();
      this.socket = null;
      this.userId = null;
      this.roomId = null;
      this.notifyConnectionStatusChange(false);
    }
  }
  
  // Join a collaboration room
  public async joinRoom(documentId: string): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to WebSocket server');
    }
    
    if (!this.userId) {
      throw new Error('User ID not set');
    }
    
    const roomId = `doc-${documentId}`;
    this.roomId = roomId;
    
    return new Promise((resolve, reject) => {
      this.socket!.emit('joinRoom', {
        roomId,
        userId: this.userId
      }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log(`Joined room ${roomId}`);
          
          // Notify others that we joined
          this.sendMessage({
            type: WebSocketMessageType.JOIN_ROOM,
            roomId,
            senderId: this.userId!,
            data: {},
            timestamp: new Date().toISOString()
          });
          
          resolve();
        } else {
          console.error(`Failed to join room ${roomId}:`, response.error);
          reject(new Error(response.error));
        }
      });
    });
  }
  
  // Leave the current collaboration room
  public async leaveRoom(): Promise<void> {
    if (!this.socket || !this.socket.connected) {
      throw new Error('Not connected to WebSocket server');
    }
    
    if (!this.roomId || !this.userId) {
      throw new Error('Not in a room or user ID not set');
    }
    
    return new Promise((resolve, reject) => {
      // Notify others that we're leaving
      this.sendMessage({
        type: WebSocketMessageType.LEAVE_ROOM,
        roomId: this.roomId,
        senderId: this.userId!,
        data: {},
        timestamp: new Date().toISOString()
      });
      
      this.socket!.emit('leaveRoom', {
        roomId: this.roomId,
        userId: this.userId
      }, (response: { success: boolean; error?: string }) => {
        if (response.success) {
          console.log(`Left room ${this.roomId}`);
          this.roomId = null;
          resolve();
        } else {
          console.error(`Failed to leave room ${this.roomId}:`, response.error);
          reject(new Error(response.error));
        }
      });
    });
  }
  
  // Send a message to the WebSocket server
  public sendMessage(message: WebSocketMessage): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send message: not connected to WebSocket server');
      return;
    }
    
    this.socket.emit('message', message);
  }
  
  // Send a document update
  public sendDocumentUpdate(update: Uint8Array): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send update: not connected to WebSocket server');
      return;
    }
    
    if (!this.roomId || !this.userId) {
      console.error('Cannot send update: not in a room or user ID not set');
      return;
    }
    
    this.sendMessage({
      type: WebSocketMessageType.SYNC_UPDATE,
      roomId: this.roomId,
      senderId: this.userId,
      data: { update },
      timestamp: new Date().toISOString()
    });
  }
  
  // Send an awareness update (cursor position, selection, etc.)
  public sendAwarenessUpdate(awarenessUpdate: any): void {
    if (!this.socket || !this.socket.connected) {
      console.error('Cannot send awareness update: not connected to WebSocket server');
      return;
    }
    
    if (!this.roomId || !this.userId) {
      console.error('Cannot send awareness update: not in a room or user ID not set');
      return;
    }
    
    this.sendMessage({
      type: WebSocketMessageType.AWARENESS_UPDATE,
      roomId: this.roomId,
      senderId: this.userId,
      data: awarenessUpdate,
      timestamp: new Date().toISOString()
    });
  }
  
  // Register a message handler
  public onMessage(handler: (message: WebSocketMessage) => void): () => void {
    this.messageHandlers.push(handler);
    
    // Return a function to remove the handler
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }
  
  // Register a connection status handler
  public onConnectionStatusChange(handler: (connected: boolean) => void): () => void {
    this.connectionStatusHandlers.push(handler);
    
    // Call immediately with current status
    if (this.socket) {
      handler(this.socket.connected);
    } else {
      handler(false);
    }
    
    // Return a function to remove the handler
    return () => {
      this.connectionStatusHandlers = this.connectionStatusHandlers.filter(h => h !== handler);
    };
  }
  
  // Check if connected to the WebSocket server
  public isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }
  
  // Handle incoming messages
  private handleIncomingMessage(message: WebSocketMessage): void {
    // Log the message for debugging
    console.log('Received message:', message.type, 'from:', message.senderId);
    
    // Notify all registered handlers
    for (const handler of this.messageHandlers) {
      try {
        handler(message);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    }
  }
  
  // Notify connection status change
  private notifyConnectionStatusChange(connected: boolean): void {
    for (const handler of this.connectionStatusHandlers) {
      try {
        handler(connected);
      } catch (error) {
        console.error('Error in connection status handler:', error);
      }
    }
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
