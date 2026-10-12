export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  avatarUrl?: string; // For backward compatibility
  role: UserRole | string;
  department?: string;
  position?: string;
  status?: UserStatus;
  lastActive?: string;
  lastLogin?: string;
  createdAt: string;
  preferences?: UserPreferences;
}

// Helper function to get full name
export function getFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
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
  storageLocation: 'local' | 'indexedDB' | 'cloud';
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
