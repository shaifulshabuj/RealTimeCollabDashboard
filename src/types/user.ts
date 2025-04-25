export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  department?: string;
  position?: string;
  status: UserStatus;
  lastActive?: string;
  preferences: UserPreferences;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

export enum UserStatus {
  ONLINE = 'online',
  IDLE = 'idle',
  OFFLINE = 'offline'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  emailNotifications: boolean;
  language: string;
  timeFormat: '12h' | '24h';
  autoSave: boolean;
  showPresence: boolean;
}

export interface UserPresence {
  userId: string;
  documentId: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastActive: string;
  color: string;
}

export interface CursorPosition {
  path: number[];
  offset: number;
}

export interface SelectionRange {
  anchor: CursorPosition;
  focus: CursorPosition;
}
