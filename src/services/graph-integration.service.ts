// src/services/graph-integration.service.ts
// Microsoft Graph API Integration Service - 30+ functions

import { Client } from '@microsoft/microsoft-graph-client';
import { Readable } from 'stream';
import { getGraphClient, GRAPH_FOLDERS, GraphApiError, formatFileSize, isPreviewableFile } from '../config/graph.config';
import {
  GraphDriveItem,
  FacultyFolderConfig,
  StudentFolderConfig,
  AccreditationFolderConfig,
  FileUploadResponse,
  FileUploadConfig,
  DocumentPreviewResponse,
  VersionControlResponse,
  PermissionResponse,
  PermissionRequest,
  BulkUploadResponse,
  SharingLinkResponse,
  SharingLinkConfig,
  OneDriveQuota,
  SearchResult,
  AdvancedSearchQuery,
  FolderActivity,
  RecycleBinItem,
  IntegrationStatistics,
} from '../types/graph-integration.types';

// ============================================================================
// FOLDER MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Create root folder structure for organization
 */
export async function createRootFolderStructure(): Promise<Record<string, string>> {
  try {
    const client = await getGraphClient();
    const folders: Record<string, string> = {};

    // Create main folders
    for (const [key, folderName] of Object.entries(GRAPH_FOLDERS)) {
      const folderData = {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const response = await client.api('/me/drive/root/children').post(folderData);
      folders[key] = response.id;
      console.log(`Created folder: ${folderName} (ID: ${response.id})`);
    }

    return folders;
  } catch (error) {
    console.error('Error creating root folder structure:', error);
    throw new GraphApiError(500, 'Failed to create root folder structure', error);
  }
}

/**
 * Create faculty folder structure
 */
export async function createFacultyFolder(
  facultyId: string,
  facultyName: string,
  email: string,
  parentFolderId?: string
): Promise<FacultyFolderConfig> {
  try {
    const client = await getGraphClient();

    // Create main faculty folder
    const facultyFolderData = {
      name: `${facultyName}_${facultyId}`,
      folder: {},
      description: `Faculty folder for ${facultyName}`,
      '@microsoft.graph.conflictBehavior': 'rename',
    };

    const parentId = parentFolderId || 'root';
    const facultyFolderResponse = await client
      .api(`/me/drive/${parentId === 'root' ? 'root/children' : `items/${parentId}/children`}`)
      .post(facultyFolderData);

    const folderId = facultyFolderResponse.id;

    // Create subfolders
    const subfolders: Record<string, string> = {};
    const subfolderNames = ['Research', 'Publications', 'FDP', 'PhD Supervision', 'Consulting', 'Personal'];

    for (const subfolder of subfolderNames) {
      const subfolderData = {
        name: subfolder,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const subfolderResponse = await client
        .api(`/me/drive/items/${folderId}/children`)
        .post(subfolderData);
      subfolders[subfolder.toLowerCase().replace(' ', '_')] = subfolderResponse.id;
    }

    const config: FacultyFolderConfig = {
      facultyId,
      facultyName,
      email,
      folderId,
      subfolders: subfolders as any,
      permissions: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    return config;
  } catch (error) {
    console.error('Error creating faculty folder:', error);
    throw new GraphApiError(500, 'Failed to create faculty folder', error);
  }
}

/**
 * Create student folder structure
 */
export async function createStudentFolder(
  studentId: string,
  studentName: string,
  enrollmentId: string,
  email: string,
  academicYear: number,
  parentFolderId?: string
): Promise<StudentFolderConfig> {
  try {
    const client = await getGraphClient();

    const studentFolderData = {
      name: `${studentName}_${enrollmentId}`,
      folder: {},
      description: `Student folder for ${studentName} (Year ${academicYear})`,
      '@microsoft.graph.conflictBehavior': 'rename',
    };

    const parentId = parentFolderId || 'root';
    const studentFolderResponse = await client
      .api(`/me/drive/${parentId === 'root' ? 'root/children' : `items/${parentId}/children`}`)
      .post(studentFolderData);

    const folderId = studentFolderResponse.id;

    // Create subfolders
    const subfolders: Record<string, string> = {};
    const subfolderNames = ['Assignments', 'Projects', 'Exams', 'Certificates', 'Research'];

    for (const subfolder of subfolderNames) {
      const subfolderData = {
        name: subfolder,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const subfolderResponse = await client
        .api(`/me/drive/items/${folderId}/children`)
        .post(subfolderData);
      subfolders[subfolder.toLowerCase().replace(' ', '_')] = subfolderResponse.id;
    }

    const config: StudentFolderConfig = {
      studentId,
      studentName,
      enrollmentId,
      email,
      academicYear,
      folderId,
      subfolders: subfolders as any,
      permissions: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    return config;
  } catch (error) {
    console.error('Error creating student folder:', error);
    throw new GraphApiError(500, 'Failed to create student folder', error);
  }
}

/**
 * Create accreditation evidence folder
 */
export async function createAccreditationFolder(
  accreditationId: string,
  accreditationType: string,
  criteriaIds: string[],
  parentFolderId?: string
): Promise<AccreditationFolderConfig> {
  try {
    const client = await getGraphClient();

    const accredFolderData = {
      name: `${accreditationType}_Accreditation_${accreditationId}`,
      folder: {},
      description: `${accreditationType} Accreditation folder`,
      '@microsoft.graph.conflictBehavior': 'rename',
    };

    const parentId = parentFolderId || 'root';
    const accredFolderResponse = await client
      .api(`/me/drive/${parentId === 'root' ? 'root/children' : `items/${parentId}/children`}`)
      .post(accredFolderData);

    const folderId = accredFolderResponse.id;

    // Create main subfolders
    const subfolders: any = { criteria: {} };
    const mainFolderNames = ['Evidence', 'Reports', 'Correspondence'];

    for (const folderName of mainFolderNames) {
      const folderData = {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const folderResponse = await client
        .api(`/me/drive/items/${folderId}/children`)
        .post(folderData);
      subfolders[folderName.toLowerCase()] = folderResponse.id;
    }

    // Create criteria subfolders
    for (const criteriaId of criteriaIds) {
      const criteriaFolderData = {
        name: `Criteria_${criteriaId}`,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const criteriaFolderResponse = await client
        .api(`/me/drive/items/${subfolders.criteria}/children`)
        .post(criteriaFolderData);
      subfolders.criteria[criteriaId] = criteriaFolderResponse.id;
    }

    const config: AccreditationFolderConfig = {
      accreditationId,
      accreditationType,
      folderId,
      subfolders,
      permissions: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    return config;
  } catch (error) {
    console.error('Error creating accreditation folder:', error);
    throw new GraphApiError(500, 'Failed to create accreditation folder', error);
  }
}

/**
 * Get folder contents (items)
 */
export async function getFolderContents(folderId: string): Promise<GraphDriveItem[]> {
  try {
    const client = await getGraphClient();
    const response = await client.api(`/me/drive/items/${folderId}/children`).get();
    return response.value || [];
  } catch (error) {
    console.error(`Error getting folder contents for ${folderId}:`, error);
    throw new GraphApiError(500, 'Failed to get folder contents', error);
  }
}

/**
 * Delete folder
 */
export async function deleteFolder(folderId: string): Promise<void> {
  try {
    const client = await getGraphClient();
    await client.api(`/me/drive/items/${folderId}`).delete();
    console.log(`Deleted folder: ${folderId}`);
  } catch (error) {
    console.error(`Error deleting folder ${folderId}:`, error);
    throw new GraphApiError(500, 'Failed to delete folder', error);
  }
}

/**
 * Rename folder
 */
export async function renameFolder(folderId: string, newName: string): Promise<GraphDriveItem> {
  try {
    const client = await getGraphClient();
    const updateData = { name: newName };
    const response = await client.api(`/me/drive/items/${folderId}`).patch(updateData);
    return response;
  } catch (error) {
    console.error(`Error renaming folder ${folderId}:`, error);
    throw new GraphApiError(500, 'Failed to rename folder', error);
  }
}

// ============================================================================
// FILE UPLOAD OPERATIONS
// ============================================================================

/**
 * Upload single file to folder
 */
export async function uploadFile(config: FileUploadConfig): Promise<FileUploadResponse> {
  try {
    const client = await getGraphClient();
    const fileContent = require('fs').readFileSync(config.filePath);

    const response = await client
      .api(`/me/drive/items/${config.parentFolderId}:/${config.fileName}:/content`)
      .put(fileContent);

    return {
      success: true,
      fileId: response.id,
      fileName: response.name,
      filePath: response.parentReference?.path,
      webUrl: response.webUrl,
      size: response.size,
      mimeType: response.file?.mimeType || config.mimeType,
      uploadedAt: new Date(),
      uploadedBy: 'system',
      versionId: response.eTag,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new GraphApiError(500, 'Failed to upload file', error);
  }
}

/**
 * Upload file from stream
 */
export async function uploadFileFromStream(
  fileName: string,
  fileStream: Readable,
  parentFolderId: string,
  fileSize?: number
): Promise<FileUploadResponse> {
  try {
    const client = await getGraphClient();

    const response = await client
      .api(`/me/drive/items/${parentFolderId}:/${fileName}:/content`)
      .put(fileStream);

    return {
      success: true,
      fileId: response.id,
      fileName: response.name,
      filePath: response.parentReference?.path,
      webUrl: response.webUrl,
      size: response.size,
      mimeType: response.file?.mimeType,
      uploadedAt: new Date(),
      uploadedBy: 'system',
      versionId: response.eTag,
    };
  } catch (error) {
    console.error('Error uploading file from stream:', error);
    throw new GraphApiError(500, 'Failed to upload file from stream', error);
  }
}

/**
 * Upload evidence file to accreditation folder
 */
export async function uploadEvidenceFile(
  accreditationFolderId: string,
  criteriaId: string,
  fileName: string,
  filePath: string,
  description: string
): Promise<FileUploadResponse> {
  try {
    const client = await getGraphClient();
    const fileContent = require('fs').readFileSync(filePath);

    // Get criteria folder ID
    const criteriaFolderResponse = await client
      .api(`/me/drive/items/${accreditationFolderId}/children`)
      .filter(`name eq 'Criteria_${criteriaId}'`)
      .get();

    if (!criteriaFolderResponse.value || criteriaFolderResponse.value.length === 0) {
      throw new Error(`Criteria folder not found: ${criteriaId}`);
    }

    const criteriaFolderId = criteriaFolderResponse.value[0].id;

    // Upload file with metadata
    const response = await client
      .api(`/me/drive/items/${criteriaFolderId}:/${fileName}:/content`)
      .put(fileContent);

    // Update file properties with description
    await client
      .api(`/me/drive/items/${response.id}`)
      .patch({ description });

    return {
      success: true,
      fileId: response.id,
      fileName: response.name,
      filePath: response.parentReference?.path,
      webUrl: response.webUrl,
      size: response.size,
      mimeType: response.file?.mimeType,
      uploadedAt: new Date(),
      uploadedBy: 'system',
      versionId: response.eTag,
    };
  } catch (error) {
    console.error('Error uploading evidence file:', error);
    throw new GraphApiError(500, 'Failed to upload evidence file', error);
  }
}

/**
 * Bulk upload multiple files
 */
export async function bulkUploadFiles(
  parentFolderId: string,
  files: FileUploadConfig[],
  onProgress?: (progress: number, fileName: string) => void
): Promise<BulkUploadResponse> {
  const uploadedFiles: FileUploadResponse[] = [];
  const failedFiles: { fileName: string; error: string }[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      try {
        const fileConfig = { ...files[i], parentFolderId };
        const uploadResponse = await uploadFile(fileConfig);
        uploadedFiles.push(uploadResponse);

        if (onProgress) {
          onProgress(((i + 1) / files.length) * 100, files[i].fileName);
        }
      } catch (error) {
        failedFiles.push({
          fileName: files[i].fileName,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      success: failedFiles.length === 0,
      totalFiles: files.length,
      uploadedFiles,
      failedFiles,
      uploadedAt: new Date(),
    };
  } catch (error) {
    console.error('Error in bulk upload:', error);
    throw new GraphApiError(500, 'Bulk upload failed', error);
  }
}

/**
 * Download file
 */
export async function downloadFile(fileId: string): Promise<Buffer> {
  try {
    const client = await getGraphClient();
    const response = await client.api(`/me/drive/items/${fileId}/content`).get();
    return response;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new GraphApiError(500, 'Failed to download file', error);
  }
}

/**
 * Delete file
 */
export async function deleteFile(fileId: string): Promise<void> {
  try {
    const client = await getGraphClient();
    await client.api(`/me/drive/items/${fileId}`).delete();
    console.log(`Deleted file: ${fileId}`);
  } catch (error) {
    console.error(`Error deleting file ${fileId}:`, error);
    throw new GraphApiError(500, 'Failed to delete file', error);
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(fileId: string): Promise<GraphDriveItem> {
  try {
    const client = await getGraphClient();
    const response = await client.api(`/me/drive/items/${fileId}`).get();
    return response;
  } catch (error) {
    console.error(`Error getting file metadata for ${fileId}:`, error);
    throw new GraphApiError(500, 'Failed to get file metadata', error);
  }
}

/**
 * Copy file
 */
export async function copyFile(fileId: string, destinationFolderId: string, newName?: string): Promise<GraphDriveItem> {
  try {
    const client = await getGraphClient();

    const copyData = {
      parentReference: {
        id: destinationFolderId,
      },
      name: newName,
    };

    const response = await client
      .api(`/me/drive/items/${fileId}/copy`)
      .post(copyData);

    return response;
  } catch (error) {
    console.error('Error copying file:', error);
    throw new GraphApiError(500, 'Failed to copy file', error);
  }
}

/**
 * Move file
 */
export async function moveFile(fileId: string, destinationFolderId: string): Promise<GraphDriveItem> {
  try {
    const client = await getGraphClient();

    const moveData = {
      parentReference: {
        id: destinationFolderId,
      },
    };

    const response = await client
      .api(`/me/drive/items/${fileId}`)
      .patch(moveData);

    return response;
  } catch (error) {
    console.error('Error moving file:', error);
    throw new GraphApiError(500, 'Failed to move file', error);
  }
}

// ============================================================================
// DOCUMENT PREVIEW OPERATIONS
// ============================================================================

/**
 * Get document preview
 */
export async function getDocumentPreview(fileId: string): Promise<DocumentPreviewResponse> {
  try {
    const client = await getGraphClient();
    const metadata = await getFileMetadata(fileId);

    if (!isPreviewableFile(metadata.name)) {
      return {
        fileId,
        fileName: metadata.name,
        previewUrl: '',
        mimeType: metadata.file?.mimeType || '',
        canPreview: false,
        canDownload: true,
        canShare: true,
        size: metadata.size || 0,
        createdDateTime: metadata.createdDateTime,
        lastModifiedDateTime: metadata.lastModifiedDateTime,
      };
    }

    // Get preview URL (requires premium preview service)
    const previewResponse = await client
      .api(`/me/drive/items/${fileId}/preview`)
      .post({
        viewer: 'modern',
        allowEdit: false,
      });

    return {
      fileId,
      fileName: metadata.name,
      previewUrl: previewResponse.getUrl,
      thumbnailUrl: metadata.image ? metadata.image.width : undefined,
      mimeType: metadata.file?.mimeType || '',
      canPreview: true,
      canDownload: true,
      canShare: true,
      size: metadata.size || 0,
      createdDateTime: metadata.createdDateTime,
      lastModifiedDateTime: metadata.lastModifiedDateTime,
    };
  } catch (error) {
    console.error('Error getting document preview:', error);
    // Return basic response even if preview fails
    const metadata = await getFileMetadata(fileId);
    return {
      fileId,
      fileName: metadata.name,
      previewUrl: '',
      mimeType: metadata.file?.mimeType || '',
      canPreview: false,
      canDownload: true,
      canShare: true,
      size: metadata.size || 0,
      createdDateTime: metadata.createdDateTime,
      lastModifiedDateTime: metadata.lastModifiedDateTime,
    };
  }
}

/**
 * Get document thumbnail
 */
export async function getDocumentThumbnail(fileId: string, size: 'small' | 'medium' | 'large' = 'medium'): Promise<string> {
  try {
    const client = await getGraphClient();
    const response = await client
      .api(`/me/drive/items/${fileId}/thumbnails/0/${size}`)
      .get();
    return response.url;
  } catch (error) {
    console.error('Error getting thumbnail:', error);
    throw new GraphApiError(500, 'Failed to get thumbnail', error);
  }
}

// ============================================================================
// VERSION CONTROL OPERATIONS
// ============================================================================

/**
 * Get file versions
 */
export async function getFileVersions(fileId: string): Promise<VersionControlResponse> {
  try {
    const client = await getGraphClient();

    const metadata = await getFileMetadata(fileId);
    const versionsResponse = await client
      .api(`/me/drive/items/${fileId}/versions`)
      .get();

    const versions = (versionsResponse.value || []).map((v: any) => ({
      versionId: v.id,
      versionNumber: v.name ? parseInt(v.name.split('.').pop() || '1') : 1,
      name: v.name,
      size: v.size,
      createdDateTime: v.createdDateTime,
      lastModifiedDateTime: v.lastModifiedDateTime,
      lastModifiedBy: v.lastModifiedBy?.user,
      isLatest: v.id === versionsResponse.value[0]?.id,
    }));

    return {
      fileId,
      fileName: metadata.name,
      currentVersion: versions[0],
      previousVersions: versions.slice(1),
      totalVersions: versions.length,
    };
  } catch (error) {
    console.error('Error getting file versions:', error);
    throw new GraphApiError(500, 'Failed to get file versions', error);
  }
}

/**
 * Restore file version
 */
export async function restoreFileVersion(fileId: string, versionId: string): Promise<void> {
  try {
    const client = await getGraphClient();
    await client
      .api(`/me/drive/items/${fileId}/versions/${versionId}/restoreVersion`)
      .post({});
    console.log(`Restored version ${versionId} for file ${fileId}`);
  } catch (error) {
    console.error('Error restoring file version:', error);
    throw new GraphApiError(500, 'Failed to restore file version', error);
  }
}

/**
 * Delete file version
 */
export async function deleteFileVersion(fileId: string, versionId: string): Promise<void> {
  try {
    const client = await getGraphClient();
    await client
      .api(`/me/drive/items/${fileId}/versions/${versionId}`)
      .delete();
    console.log(`Deleted version ${versionId} for file ${fileId}`);
  } catch (error) {
    console.error('Error deleting file version:', error);
    throw new GraphApiError(500, 'Failed to delete file version', error);
  }
}

// ============================================================================
// PERMISSION MANAGEMENT OPERATIONS
// ============================================================================

/**
 * Grant file/folder access
 */
export async function grantAccess(request: PermissionRequest): Promise<PermissionResponse> {
  try {
    const client = await getGraphClient();

    const permissionData = {
      recipients: [{ email: request.grantedToEmail }],
      roles: request.roles,
      requireSignIn: true,
      sendNotification: request.notifyPeople !== false,
    };

    const response = await client
      .api(`/me/drive/items/${request.fileId}/invite`)
      .post(permissionData);

    const permission = response.value?.[0];

    return {
      permissionId: permission?.id || '',
      fileId: request.fileId,
      fileName: '',
      grantedTo: {
        id: '',
        displayName: request.grantedToEmail,
        email: request.grantedToEmail,
      },
      roles: request.roles,
      createdAt: new Date(),
      expirationDate: request.expirationDays ? new Date(Date.now() + request.expirationDays * 24 * 60 * 60 * 1000) : undefined,
      status: 'active',
    };
  } catch (error) {
    console.error('Error granting access:', error);
    throw new GraphApiError(500, 'Failed to grant access', error);
  }
}

/**
 * Get file permissions
 */
export async function getFilePermissions(fileId: string): Promise<PermissionResponse[]> {
  try {
    const client = await getGraphClient();
    const response = await client
      .api(`/me/drive/items/${fileId}/permissions`)
      .get();

    return (response.value || []).map((perm: any) => ({
      permissionId: perm.id,
      fileId,
      fileName: '',
      grantedTo: perm.grantedTo?.user || { id: '', displayName: 'Unknown', email: '' },
      roles: perm.roles,
      createdAt: new Date(perm.createdDateTime),
      expirationDate: perm.expirationDateTime ? new Date(perm.expirationDateTime) : undefined,
      status: new Date(perm.expirationDateTime) < new Date() ? 'expired' : 'active',
    }));
  } catch (error) {
    console.error('Error getting file permissions:', error);
    throw new GraphApiError(500, 'Failed to get file permissions', error);
  }
}

/**
 * Revoke file access
 */
export async function revokeAccess(fileId: string, permissionId: string): Promise<void> {
  try {
    const client = await getGraphClient();
    await client
      .api(`/me/drive/items/${fileId}/permissions/${permissionId}`)
      .delete();
    console.log(`Revoked permission ${permissionId} for file ${fileId}`);
  } catch (error) {
    console.error('Error revoking access:', error);
    throw new GraphApiError(500, 'Failed to revoke access', error);
  }
}

/**
 * Create sharing link
 */
export async function createSharingLink(config: SharingLinkConfig): Promise<SharingLinkResponse> {
  try {
    const client = await getGraphClient();

    const linkData = {
      type: config.type,
      scope: config.scope,
      expirationDateTime: config.expirationDateTime,
      hasPassword: !!config.password,
      password: config.password,
    };

    const response = await client
      .api(`/me/drive/items/${config.fileId}/createLink`)
      .post(linkData);

    return {
      id: response.id,
      fileId: config.fileId,
      link: {
        scope: response.link.scope,
        type: response.link.type,
        webUrl: response.link.webUrl,
      },
      grantedTo: [],
      createdDateTime: new Date().toISOString(),
      expirationDateTime: config.expirationDateTime,
    };
  } catch (error) {
    console.error('Error creating sharing link:', error);
    throw new GraphApiError(500, 'Failed to create sharing link', error);
  }
}

// ============================================================================
// SEARCH & DISCOVERY OPERATIONS
// ============================================================================

/**
 * Search files and folders
 */
export async function searchFiles(query: AdvancedSearchQuery): Promise<SearchResult[]> {
  try {
    const client = await getGraphClient();

    // Build search query
    let searchQuery = query.query;
    if (query.fileType) {
      searchQuery += ` filetype:${query.fileType}`;
    }

    const response = await client
      .api('/me/drive/root/search(q=\'{searchQuery}\')'.replace('{searchQuery}', searchQuery))
      .get();

    return (response.value || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      type: item.folder ? 'folder' : 'file',
      path: item.parentReference?.path || '',
      matchHighlights: [],
      webUrl: item.webUrl,
      size: item.size,
      lastModifiedDateTime: item.lastModifiedDateTime,
      parentReference: item.parentReference,
    }));
  } catch (error) {
    console.error('Error searching files:', error);
    throw new GraphApiError(500, 'Failed to search files', error);
  }
}

/**
 * Get recent files
 */
export async function getRecentFiles(limit: number = 10): Promise<GraphDriveItem[]> {
  try {
    const client = await getGraphClient();
    const response = await client
      .api('/me/drive/recent')
      .top(limit)
      .get();
    return response.value || [];
  } catch (error) {
    console.error('Error getting recent files:', error);
    throw new GraphApiError(500, 'Failed to get recent files', error);
  }
}

/**
 * Get files shared with user
 */
export async function getSharedWithMe(limit: number = 10): Promise<GraphDriveItem[]> {
  try {
    const client = await getGraphClient();
    const response = await client
      .api('/me/drive/sharedWithMe')
      .top(limit)
      .get();
    return response.value || [];
  } catch (error) {
    console.error('Error getting shared files:', error);
    throw new GraphApiError(500, 'Failed to get shared files', error);
  }
}

// ============================================================================
// QUOTA & STORAGE OPERATIONS
// ============================================================================

/**
 * Get OneDrive quota information
 */
export async function getQuotaInfo(): Promise<OneDriveQuota> {
  try {
    const client = await getGraphClient();
    const response = await client.api('/me/drive').select('quota').get();

    const quota = response.quota;
    const used = quota.used || 0;
    const total = quota.total || 0;
    const remaining = total - used;

    return {
      total,
      used,
      remaining,
      state: quota.state || 'normal',
      percentageUsed: total > 0 ? (used / total) * 100 : 0,
      percentageRemaining: total > 0 ? (remaining / total) * 100 : 0,
    };
  } catch (error) {
    console.error('Error getting quota info:', error);
    throw new GraphApiError(500, 'Failed to get quota information', error);
  }
}

// ============================================================================
// ACTIVITY TRACKING OPERATIONS
// ============================================================================

/**
 * Get folder activity
 */
export async function getFolderActivity(folderId: string, limit: number = 50): Promise<FolderActivity[]> {
  try {
    const client = await getGraphClient();

    const response = await client
      .api(`/me/drive/items/${folderId}/activities`)
      .top(limit)
      .get();

    return (response.value || []).map((activity: any) => ({
      id: activity.id,
      itemId: activity.itemReference?.id,
      itemName: activity.itemReference?.name,
      action: activity.action,
      performedBy: activity.actor?.user,
      performedAt: new Date(activity.dateTime),
      details: {},
    }));
  } catch (error) {
    console.error('Error getting folder activity:', error);
    throw new GraphApiError(500, 'Failed to get folder activity', error);
  }
}

// ============================================================================
// EXPORT SERVICE
// ============================================================================

export const GraphIntegrationService = {
  // Folder operations
  createRootFolderStructure,
  createFacultyFolder,
  createStudentFolder,
  createAccreditationFolder,
  getFolderContents,
  deleteFolder,
  renameFolder,

  // File operations
  uploadFile,
  uploadFileFromStream,
  uploadEvidenceFile,
  bulkUploadFiles,
  downloadFile,
  deleteFile,
  getFileMetadata,
  copyFile,
  moveFile,

  // Preview operations
  getDocumentPreview,
  getDocumentThumbnail,

  // Version control
  getFileVersions,
  restoreFileVersion,
  deleteFileVersion,

  // Permissions
  grantAccess,
  getFilePermissions,
  revokeAccess,
  createSharingLink,

  // Search
  searchFiles,
  getRecentFiles,
  getSharedWithMe,

  // Storage
  getQuotaInfo,

  // Activity
  getFolderActivity,
};

export default GraphIntegrationService;
