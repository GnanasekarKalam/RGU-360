// src/types/graph-integration.types.ts
// Microsoft Graph API Type Definitions

/**
 * Graph Drive Item Metadata
 */
export interface GraphDriveItem {
  id: string;
  name: string;
  description?: string;
  type: 'file' | 'folder';
  size?: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  createdBy?: GraphUser;
  lastModifiedBy?: GraphUser;
  webUrl: string;
  parentReference?: {
    driveId: string;
    id: string;
    path: string;
  };
  folder?: {
    childCount: number;
  };
  file?: {
    mimeType: string;
  };
  hashes?: {
    quickXorHash: string;
    sha1Hash: string;
  };
}

/**
 * Graph User Information
 */
export interface GraphUser {
  id: string;
  displayName: string;
  email: string;
}

/**
 * Folder Structure for Organization
 */
export interface FolderStructure {
  facultyFolderId?: string;
  studentFolderId?: string;
  accreditationFolderId?: string;
  evidenceFolderId?: string;
  documentsFolderId?: string;
  archivesFolderId?: string;
}

/**
 * Faculty Folder Configuration
 */
export interface FacultyFolderConfig {
  facultyId: string;
  facultyName: string;
  email: string;
  folderId: string;
  subfolders: {
    research: string;
    publications: string;
    fdp: string;
    phd: string;
    consulting: string;
    personal: string;
  };
  permissions: PermissionAssignment[];
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Student Folder Configuration
 */
export interface StudentFolderConfig {
  studentId: string;
  studentName: string;
  enrollmentId: string;
  email: string;
  academicYear: number;
  folderId: string;
  subfolders: {
    assignments: string;
    projects: string;
    exams: string;
    certificates: string;
    research: string;
  };
  permissions: PermissionAssignment[];
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * Accreditation Evidence Folder
 */
export interface AccreditationFolderConfig {
  accreditationId: string;
  accreditationType: string; // NBA, NAAC, UGC, AICTE, IQAC
  folderId: string;
  subfolders: {
    criteria: Record<string, string>; // Criteria ID -> Folder ID mapping
    evidence: string;
    reports: string;
    correspondence: string;
  };
  permissions: PermissionAssignment[];
  createdAt: Date;
  lastUpdated: Date;
}

/**
 * File Upload Configuration
 */
export interface FileUploadConfig {
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  parentFolderId: string;
  metadata?: Record<string, any>;
  description?: string;
  tags?: string[];
  expiryDate?: Date;
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  filePath: string;
  webUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  versionId: string;
}

/**
 * Document Preview Configuration
 */
export interface DocumentPreviewConfig {
  fileId: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  isPreviewable: boolean;
}

/**
 * Document Preview Response
 */
export interface DocumentPreviewResponse {
  fileId: string;
  fileName: string;
  previewUrl: string;
  thumbnailUrl?: string;
  mimeType: string;
  canPreview: boolean;
  canDownload: boolean;
  canShare: boolean;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

/**
 * File Version Information
 */
export interface FileVersion {
  versionId: string;
  versionNumber: number;
  name: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
  lastModifiedBy: GraphUser;
  isLatest: boolean;
}

/**
 * Version Control Response
 */
export interface VersionControlResponse {
  fileId: string;
  fileName: string;
  currentVersion: FileVersion;
  previousVersions: FileVersion[];
  totalVersions: number;
}

/**
 * Permission Assignment
 */
export interface PermissionAssignment {
  id: string;
  grantedTo: GraphUser;
  grantedToV2?: {
    siteUser?: {
      displayName: string;
      id: string;
    };
    application?: {
      displayName: string;
      id: string;
    };
    device?: {
      displayName: string;
      id: string;
    };
  };
  roles: string[]; // ['read', 'edit', 'manage']
  expirationDateTime?: string;
  hasPassword?: boolean;
  shareId?: string;
}

/**
 * Permission Request
 */
export interface PermissionRequest {
  fileId: string;
  grantedToEmail: string;
  roles: string[]; // ['read', 'edit', 'manage']
  type: 'user' | 'group' | 'organization';
  expirationDays?: number;
  password?: string;
  notifyPeople?: boolean;
}

/**
 * Permission Response
 */
export interface PermissionResponse {
  permissionId: string;
  fileId: string;
  fileName: string;
  grantedTo: GraphUser;
  roles: string[];
  createdAt: Date;
  expirationDate?: Date;
  status: 'active' | 'expired' | 'revoked';
}

/**
 * Bulk Upload Configuration
 */
export interface BulkUploadConfig {
  folderId: string;
  files: FileUploadConfig[];
  onProgress?: (progress: number, fileName: string) => void;
  onComplete?: () => void;
  onError?: (error: Error, fileName: string) => void;
}

/**
 * Bulk Upload Response
 */
export interface BulkUploadResponse {
  success: boolean;
  totalFiles: number;
  uploadedFiles: FileUploadResponse[];
  failedFiles: {
    fileName: string;
    error: string;
  }[];
  uploadedAt: Date;
}

/**
 * Evidence Submission
 */
export interface EvidenceSubmission {
  accreditationId: string;
  criteriaId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  description: string;
  tags: string[];
  submittedBy: string;
  submittedAt: Date;
  status: 'pending' | 'verified' | 'rejected';
  verifiedBy?: string;
  verificationNotes?: string;
}

/**
 * Folder Activity Log
 */
export interface FolderActivity {
  id: string;
  itemId: string;
  itemName: string;
  action: 'created' | 'modified' | 'deleted' | 'shared' | 'versioned';
  performedBy: GraphUser;
  performedAt: Date;
  details: Record<string, any>;
}

/**
 * Search Results
 */
export interface SearchResult {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  matchHighlights: string[];
  webUrl: string;
  size?: number;
  lastModifiedDateTime: string;
  parentReference?: {
    path: string;
  };
}

/**
 * Advanced Search Query
 */
export interface AdvancedSearchQuery {
  query: string;
  folderId?: string;
  fileType?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  modifiedAfter?: Date;
  modifiedBefore?: Date;
  minSize?: number;
  maxSize?: number;
  tags?: string[];
}

/**
 * Sharing Link Configuration
 */
export interface SharingLinkConfig {
  fileId: string;
  type: 'view' | 'edit' | 'embed';
  scope: 'anonymous' | 'organization' | 'users';
  password?: string;
  expirationDateTime?: string;
  message?: string;
  recipients?: string[];
}

/**
 * Sharing Link Response
 */
export interface SharingLinkResponse {
  id: string;
  fileId: string;
  link: {
    scope: string;
    type: string;
    webUrl: string;
  };
  grantedTo: GraphUser[];
  createdDateTime: string;
  expirationDateTime?: string;
}

/**
 * OneDrive Quota Information
 */
export interface OneDriveQuota {
  total: number;
  used: number;
  remaining: number;
  state: 'normal' | 'nearing' | 'critical';
  percentageUsed: number;
  percentageRemaining: number;
}

/**
 * Sync Configuration
 */
export interface SyncConfiguration {
  enabled: boolean;
  folderMappings: {
    facultyFolderId: string;
    studentFolderId: string;
    accreditationFolderId: string;
  };
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  lastSyncTime: Date;
  nextSyncTime: Date;
  status: 'active' | 'paused' | 'error';
}

/**
 * Recycle Bin Item
 */
export interface RecycleBinItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  deletedDateTime: string;
  size?: number;
  parentReference?: {
    path: string;
  };
}

/**
 * Integration Statistics
 */
export interface IntegrationStatistics {
  totalFaculty: number;
  totalStudents: number;
  totalAccreditations: number;
  totalFiles: number;
  totalFolders: number;
  totalStorageUsed: number;
  quotaRemaining: number;
  activePermissions: number;
  recentActivities: FolderActivity[];
  lastSyncTime: Date;
}

export default {
  GraphDriveItem,
  GraphUser,
  FolderStructure,
  FacultyFolderConfig,
  StudentFolderConfig,
  AccreditationFolderConfig,
  FileUploadConfig,
  FileUploadResponse,
  DocumentPreviewConfig,
  DocumentPreviewResponse,
  FileVersion,
  VersionControlResponse,
  PermissionAssignment,
  PermissionRequest,
  PermissionResponse,
  BulkUploadConfig,
  BulkUploadResponse,
  EvidenceSubmission,
  FolderActivity,
  SearchResult,
  AdvancedSearchQuery,
  SharingLinkConfig,
  SharingLinkResponse,
  OneDriveQuota,
  SyncConfiguration,
  RecycleBinItem,
  IntegrationStatistics,
};
