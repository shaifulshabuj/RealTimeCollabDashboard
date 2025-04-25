import { User } from './user';

export interface YjsDocumentData {
  id: string;
  type: string;
  data: Uint8Array; // Serialized Y.Doc
}

export interface CollaborationRoom {
  id: string;
  documentId: string;
  activeUsers: ActiveUser[];
  lastUpdate: string;
}

export interface ActiveUser {
  user: User;
  joinedAt: string;
  color: string;
  clientId: string;
}

export interface CollaborationUpdate {
  type: CollaborationUpdateType;
  data: unknown;
  user: User;
  timestamp: string;
}

export enum CollaborationUpdateType {
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  CURSOR_MOVED = 'cursor_moved',
  SELECTION_CHANGED = 'selection_changed',
  DOCUMENT_UPDATED = 'document_updated',
  COMMENT_ADDED = 'comment_added',
  COMMENT_UPDATED = 'comment_updated',
  COMMENT_RESOLVED = 'comment_resolved',
  VERSION_CREATED = 'version_created'
}

export interface WebSocketMessage {
  type: WebSocketMessageType;
  roomId: string;
  senderId: string;
  data: unknown;
  timestamp: string;
}

export enum WebSocketMessageType {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  SYNC_UPDATE = 'sync_update',
  AWARENESS_UPDATE = 'awareness_update',
  ERROR = 'error',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect'
}

export interface SyncUpdate {
  update: Uint8Array;
  documentId: string;
}

export interface AwarenessUpdate {
  added: number[];
  updated: number[];
  removed: number[];
  states: Record<number, unknown>;
}
