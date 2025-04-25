// Document Types
export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  lastEditedBy: User;
  collaborators: User[];
  tags: string[];
  status: DocumentStatus;
  version: number;
  workflowType: WorkflowType;
}

export enum DocumentStatus {
  DRAFT = 'draft',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export enum WorkflowType {
  LOGISTICS = 'logistics',
  INVENTORY = 'inventory',
  SHIPMENT = 'shipment',
  PRODUCTION = 'production',
  QUALITY_CONTROL = 'quality_control',
  MAINTENANCE = 'maintenance',
  CUSTOM = 'custom'
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  createdAt: string;
  createdBy: User;
  comment: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  content: string;
  createdAt: string;
  createdBy: User;
  position: CommentPosition;
  resolved: boolean;
  resolvedBy?: User;
  resolvedAt?: string;
  replies: DocumentCommentReply[];
}

export interface DocumentCommentReply {
  id: string;
  commentId: string;
  content: string;
  createdAt: string;
  createdBy: User;
}

export interface CommentPosition {
  elementId?: string;
  startOffset?: number;
  endOffset?: number;
  x?: number;
  y?: number;
}

// For document history tracking
export interface DocumentChange {
  id: string;
  documentId: string;
  userId: string;
  timestamp: string;
  type: ChangeType;
  data: unknown;
}

export enum ChangeType {
  CONTENT_ADDED = 'content_added',
  CONTENT_DELETED = 'content_deleted',
  CONTENT_MODIFIED = 'content_modified',
  FIELD_UPDATED = 'field_updated',
  COLLABORATOR_ADDED = 'collaborator_added',
  COLLABORATOR_REMOVED = 'collaborator_removed',
  STATUS_CHANGED = 'status_changed'
}
