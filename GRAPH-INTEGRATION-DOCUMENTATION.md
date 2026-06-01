// GRAPH-INTEGRATION-DOCUMENTATION.md
# Microsoft Graph API Integration - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Architecture](#architecture)
4. [Service Functions](#service-functions)
5. [API Endpoints](#api-endpoints)
6. [Folder Structure](#folder-structure)
7. [File Management](#file-management)
8. [Document Preview](#document-preview)
9. [Version Control](#version-control)
10. [Permission Management](#permission-management)
11. [Search & Discovery](#search--discovery)
12. [Storage Management](#storage-management)
13. [Integration Examples](#integration-examples)
14. [Error Handling](#error-handling)
15. [Security Considerations](#security-considerations)

---

## Overview

The Microsoft Graph API Integration module provides seamless integration with Microsoft OneDrive/SharePoint for document management within the Mathematics Dashboard system. This module enables:

- **Folder Organization**: Automatic creation and management of folders for Faculty, Students, and Accreditation
- **Evidence Management**: Centralized evidence upload and tracking for accreditation processes
- **Version Control**: Full version history and restoration capabilities
- **Access Control**: Fine-grained permission management
- **Document Preview**: In-app document preview and thumbnail generation
- **Storage Monitoring**: Quota tracking and storage management
- **Activity Logging**: Complete audit trail of all document operations
- **Search Capability**: Full-text search across all documents

---

## Setup & Configuration

### 1. Prerequisites

```bash
npm install @microsoft/microsoft-graph-client
npm install @microsoft/identity-client
npm install multer
npm install isomorphic-fetch
```

### 2. Environment Variables

Create `.env` file with:

```env
# Microsoft Graph API Configuration
GRAPH_CLIENT_ID=your-client-id
GRAPH_CLIENT_SECRET=your-client-secret
GRAPH_TENANT_ID=your-tenant-id

# Optional
GRAPH_AUTHORITY=https://login.microsoftonline.com/{tenant-id}/v2.0
```

### 3. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure AD > App registrations > New registration
3. Configure:
   - **Name**: Mathematics Dashboard
   - **Redirect URI**: (Leave empty for daemon app)
4. Create Client Secret
5. Grant API permissions:
   - Microsoft Graph
   - Files.ReadWrite.All
   - Sites.ReadWrite.All
   - Sites.Manage.All
   - User.Read.All
   - Group.Read.All

### 4. Application Integration

In `src/index.ts`:

```typescript
import graphIntegrationRoutes from './routes/graph-integration.routes';

// Add middleware
app.use('/api/graph', graphIntegrationRoutes);

// Initialize Graph client on startup
import { initializeGraphClient } from './config/graph.config';
initializeGraphClient().then(() => {
  console.log('Graph API client initialized');
});
```

---

## Architecture

### Folder Hierarchy

```
OneDrive Root
├── Faculty/
│   ├── Dr. John Smith_FAC001/
│   │   ├── Research/
│   │   ├── Publications/
│   │   ├── FDP/
│   │   ├── PhD Supervision/
│   │   ├── Consulting/
│   │   └── Personal/
├── Students/
│   ├── Raj Kumar_2021001/
│   │   ├── Assignments/
│   │   ├── Projects/
│   │   ├── Exams/
│   │   ├── Certificates/
│   │   └── Research/
├── Accreditation/
│   ├── NBA_Accreditation_ACC001/
│   │   ├── Criteria/
│   │   │   ├── Criteria_1/
│   │   │   ├── Criteria_2/
│   │   │   └── ... (auto-created per criteria)
│   │   ├── Evidence/
│   │   ├── Reports/
│   │   └── Correspondence/
├── Evidence/
├── Documents/
└── Archives/
```

### Class Diagram

```
GraphIntegrationService
├── Folder Operations (7 functions)
├── File Operations (8 functions)
├── Preview Operations (2 functions)
├── Version Control (3 functions)
├── Permission Management (4 functions)
├── Search Operations (3 functions)
├── Storage Operations (1 function)
└── Activity Operations (1 function)
```

---

## Service Functions

### Folder Management (7 Functions)

#### 1. `createRootFolderStructure()`

Creates the main folder structure at OneDrive root.

```typescript
const folders = await GraphIntegrationService.createRootFolderStructure();
// Returns: { FACULTY: 'folder-id', STUDENTS: 'folder-id', ... }
```

**Response**:
```json
{
  "FACULTY": "item-id-123",
  "STUDENTS": "item-id-456",
  "ACCREDITATION": "item-id-789",
  "EVIDENCE": "item-id-101",
  "DOCUMENTS": "item-id-102",
  "ARCHIVES": "item-id-103"
}
```

#### 2. `createFacultyFolder(facultyId, facultyName, email, parentFolderId?)`

Creates a faculty folder with subfolders for Research, Publications, etc.

```typescript
const config = await GraphIntegrationService.createFacultyFolder(
  'FAC001',
  'Dr. John Smith',
  'john@university.edu',
  'parent-folder-id'
);
```

**Response**:
```json
{
  "facultyId": "FAC001",
  "facultyName": "Dr. John Smith",
  "email": "john@university.edu",
  "folderId": "item-id-999",
  "subfolders": {
    "research": "item-id-1",
    "publications": "item-id-2",
    "fdp": "item-id-3",
    "phd": "item-id-4",
    "consulting": "item-id-5",
    "personal": "item-id-6"
  },
  "permissions": [],
  "createdAt": "2024-01-15T10:30:00Z",
  "lastUpdated": "2024-01-15T10:30:00Z"
}
```

#### 3. `createStudentFolder(studentId, studentName, enrollmentId, email, academicYear, parentFolderId?)`

Creates a student folder with subfolders for Assignments, Projects, etc.

```typescript
const config = await GraphIntegrationService.createStudentFolder(
  'STU001',
  'Raj Kumar',
  '2021001',
  'raj@university.edu',
  3,
  'parent-folder-id'
);
```

#### 4. `createAccreditationFolder(accreditationId, accreditationType, criteriaIds, parentFolderId?)`

Creates accreditation folder with criteria-based subfolders.

```typescript
const config = await GraphIntegrationService.createAccreditationFolder(
  'ACC001',
  'NBA',
  ['1', '2', '3', '4', '5'],
  'parent-folder-id'
);
```

#### 5. `getFolderContents(folderId)`

Lists all items in a folder.

```typescript
const items = await GraphIntegrationService.getFolderContents('folder-id');
```

#### 6. `deleteFolder(folderId)`

Deletes a folder and all its contents.

```typescript
await GraphIntegrationService.deleteFolder('folder-id');
```

#### 7. `renameFolder(folderId, newName)`

Renames a folder.

```typescript
const updated = await GraphIntegrationService.renameFolder('folder-id', 'New Name');
```

---

### File Management (8 Functions)

#### 1. `uploadFile(config: FileUploadConfig)`

Uploads a single file to a folder.

```typescript
const response = await GraphIntegrationService.uploadFile({
  fileName: 'document.pdf',
  filePath: '/path/to/local/file',
  fileSize: 1024000,
  mimeType: 'application/pdf',
  parentFolderId: 'folder-id',
  description: 'Accreditation evidence document',
  tags: ['accreditation', 'NBA', 'criteria-1']
});
```

**Response**:
```json
{
  "success": true,
  "fileId": "file-id-123",
  "fileName": "document.pdf",
  "filePath": "/Accreditation/Criteria_1",
  "webUrl": "https://onedrive.com/files/document.pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "uploadedAt": "2024-01-15T10:30:00Z",
  "uploadedBy": "system",
  "versionId": "etag-value"
}
```

#### 2. `uploadEvidenceFile(accreditationFolderId, criteriaId, fileName, filePath, description)`

Uploads evidence file to specific criteria folder.

```typescript
const response = await GraphIntegrationService.uploadEvidenceFile(
  'acc-folder-id',
  'criteria-1',
  'evidence.pdf',
  '/path/to/file',
  'Accreditation criteria evidence'
);
```

#### 3. `bulkUploadFiles(parentFolderId, files[], onProgress?)`

Uploads multiple files with progress tracking.

```typescript
const response = await GraphIntegrationService.bulkUploadFiles(
  'folder-id',
  [
    { fileName: 'doc1.pdf', filePath: '/path/1', ... },
    { fileName: 'doc2.pdf', filePath: '/path/2', ... }
  ],
  (progress, fileName) => {
    console.log(`${fileName}: ${progress}% complete`);
  }
);
```

#### 4. `downloadFile(fileId)`

Downloads file content as Buffer.

```typescript
const buffer = await GraphIntegrationService.downloadFile('file-id');
// Send to client or save to disk
```

#### 5. `deleteFile(fileId)`

Deletes a file.

```typescript
await GraphIntegrationService.deleteFile('file-id');
```

#### 6. `getFileMetadata(fileId)`

Retrieves file metadata including timestamps, size, etc.

```typescript
const metadata = await GraphIntegrationService.getFileMetadata('file-id');
```

#### 7. `copyFile(fileId, destinationFolderId, newName?)`

Copies file to another location.

```typescript
const copiedFile = await GraphIntegrationService.copyFile(
  'file-id',
  'dest-folder-id',
  'Copy of document.pdf'
);
```

#### 8. `moveFile(fileId, destinationFolderId)`

Moves file to another location.

```typescript
const movedFile = await GraphIntegrationService.moveFile('file-id', 'dest-folder-id');
```

---

### Document Preview (2 Functions)

#### 1. `getDocumentPreview(fileId)`

Generates preview URL for document.

```typescript
const preview = await GraphIntegrationService.getDocumentPreview('file-id');
```

**Response**:
```json
{
  "fileId": "file-id",
  "fileName": "document.pdf",
  "previewUrl": "https://graph.microsoft.com/v1.0/drives/me/items/file-id/preview",
  "mimeType": "application/pdf",
  "canPreview": true,
  "canDownload": true,
  "canShare": true,
  "size": 1024000,
  "createdDateTime": "2024-01-15T10:00:00Z",
  "lastModifiedDateTime": "2024-01-15T10:30:00Z"
}
```

#### 2. `getDocumentThumbnail(fileId, size?)`

Generates thumbnail URL for document.

```typescript
const url = await GraphIntegrationService.getDocumentThumbnail('file-id', 'medium');
// Returns: thumbnail URL string
```

---

### Version Control (3 Functions)

#### 1. `getFileVersions(fileId)`

Retrieves all versions of a file.

```typescript
const versions = await GraphIntegrationService.getFileVersions('file-id');
```

**Response**:
```json
{
  "fileId": "file-id",
  "fileName": "document.pdf",
  "currentVersion": {
    "versionId": "v-123",
    "versionNumber": 5,
    "name": "document-5.pdf",
    "size": 1024000,
    "createdDateTime": "2024-01-15T10:30:00Z",
    "lastModifiedDateTime": "2024-01-15T10:30:00Z",
    "lastModifiedBy": { "displayName": "Dr. Smith", "email": "john@example.com" },
    "isLatest": true
  },
  "previousVersions": [...],
  "totalVersions": 5
}
```

#### 2. `restoreFileVersion(fileId, versionId)`

Restores a previous version of the file.

```typescript
await GraphIntegrationService.restoreFileVersion('file-id', 'v-123');
```

#### 3. `deleteFileVersion(fileId, versionId)`

Deletes a specific version.

```typescript
await GraphIntegrationService.deleteFileVersion('file-id', 'v-123');
```

---

### Permission Management (4 Functions)

#### 1. `grantAccess(request: PermissionRequest)`

Grants access to a file/folder.

```typescript
const permission = await GraphIntegrationService.grantAccess({
  fileId: 'file-id',
  grantedToEmail: 'user@university.edu',
  roles: ['read', 'edit'],
  type: 'user',
  expirationDays: 30,
  notifyPeople: true
});
```

#### 2. `getFilePermissions(fileId)`

Lists all permissions for a file.

```typescript
const permissions = await GraphIntegrationService.getFilePermissions('file-id');
```

#### 3. `revokeAccess(fileId, permissionId)`

Revokes access for a user.

```typescript
await GraphIntegrationService.revokeAccess('file-id', 'perm-id');
```

#### 4. `createSharingLink(config: SharingLinkConfig)`

Creates a shareable link for a document.

```typescript
const link = await GraphIntegrationService.createSharingLink({
  fileId: 'file-id',
  type: 'view', // 'view', 'edit', 'embed'
  scope: 'organization', // 'anonymous', 'organization', 'users'
  password: 'optional-password',
  expirationDateTime: '2024-12-31T23:59:59Z'
});
```

---

### Search & Discovery (3 Functions)

#### 1. `searchFiles(query: AdvancedSearchQuery)`

Searches files and folders.

```typescript
const results = await GraphIntegrationService.searchFiles({
  query: 'accreditation',
  fileType: 'pdf',
  createdAfter: new Date('2024-01-01'),
  createdBefore: new Date('2024-12-31'),
  minSize: 1000,
  maxSize: 10000000,
  tags: ['accreditation', 'NBA']
});
```

#### 2. `getRecentFiles(limit?)`

Gets recently modified files.

```typescript
const recent = await GraphIntegrationService.getRecentFiles(20);
```

#### 3. `getSharedWithMe(limit?)`

Gets files shared with the current user.

```typescript
const shared = await GraphIntegrationService.getSharedWithMe(10);
```

---

### Storage Management (1 Function)

#### 1. `getQuotaInfo()`

Retrieves OneDrive quota information.

```typescript
const quota = await GraphIntegrationService.getQuotaInfo();
```

**Response**:
```json
{
  "total": 1099511627776,
  "used": 274877906944,
  "remaining": 824633720832,
  "state": "normal",
  "percentageUsed": 25.0,
  "percentageRemaining": 75.0
}
```

---

### Activity Tracking (1 Function)

#### 1. `getFolderActivity(folderId, limit?)`

Gets activity log for a folder.

```typescript
const activities = await GraphIntegrationService.getFolderActivity('folder-id', 50);
```

**Response**:
```json
[
  {
    "id": "activity-123",
    "itemId": "file-id",
    "itemName": "document.pdf",
    "action": "modified",
    "performedBy": { "displayName": "Dr. Smith", "email": "john@example.com" },
    "performedAt": "2024-01-15T10:30:00Z",
    "details": {}
  }
]
```

---

## API Endpoints

### Base URL
```
/api/graph
```

### Folder Management Endpoints

#### POST /folders/root-structure
Creates root folder structure.

**Permission**: ROLE_ADMIN

**Request**: `{}`

**Response**: `{ success, message, data: { FACULTY, STUDENTS, ... } }`

#### POST /folders/faculty
Creates faculty folder.

**Permission**: ROLE_ADMIN, ROLE_HOD

**Request**:
```json
{
  "facultyId": "FAC001",
  "facultyName": "Dr. John Smith",
  "email": "john@university.edu",
  "parentFolderId": "folder-id" // optional
}
```

#### POST /folders/student
Creates student folder.

**Permission**: ROLE_ADMIN, ROLE_HOD

**Request**:
```json
{
  "studentId": "STU001",
  "studentName": "Raj Kumar",
  "enrollmentId": "2021001",
  "email": "raj@university.edu",
  "academicYear": 3,
  "parentFolderId": "folder-id" // optional
}
```

#### POST /folders/accreditation
Creates accreditation folder.

**Permission**: ROLE_ADMIN, ROLE_DIRECTOR

**Request**:
```json
{
  "accreditationId": "ACC001",
  "accreditationType": "NBA",
  "criteriaIds": ["1", "2", "3", "4", "5"],
  "parentFolderId": "folder-id" // optional
}
```

#### GET /folders/:folderId/contents
Lists folder contents.

**Permission**: Authenticated

#### DELETE /folders/:folderId
Deletes folder.

**Permission**: ROLE_ADMIN

#### PATCH /folders/:folderId/rename
Renames folder.

**Permission**: ROLE_ADMIN

**Request**: `{ "newName": "New Folder Name" }`

---

### File Management Endpoints

#### POST /files/upload
Uploads single file.

**Permission**: Authenticated

**Content-Type**: multipart/form-data

**Form Data**:
- `file`: File to upload
- `parentFolderId`: Target folder ID
- `description`: Optional file description

#### POST /files/evidence-upload
Uploads evidence file to accreditation folder.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Form Data**:
- `file`: Evidence file
- `accreditationFolderId`: Accreditation folder ID
- `criteriaId`: Criteria ID
- `description`: Evidence description

#### POST /files/bulk-upload
Uploads multiple files.

**Permission**: ROLE_ADMIN, ROLE_HOD

**Form Data**:
- `files`: Multiple files
- `parentFolderId`: Target folder ID

#### GET /files/:fileId/download
Downloads file.

**Permission**: Authenticated

#### DELETE /files/:fileId
Deletes file.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

#### GET /files/:fileId/metadata
Gets file metadata.

**Permission**: Authenticated

#### POST /files/:fileId/copy
Copies file.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Request**:
```json
{
  "destinationFolderId": "folder-id",
  "newName": "Copy of document.pdf" // optional
}
```

#### POST /files/:fileId/move
Moves file.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Request**: `{ "destinationFolderId": "folder-id" }`

---

### Document Preview Endpoints

#### GET /documents/:fileId/preview
Gets document preview.

**Permission**: Authenticated

**Response**:
```json
{
  "success": true,
  "data": {
    "fileId": "file-id",
    "previewUrl": "https://...",
    "canPreview": true,
    ...
  }
}
```

#### GET /documents/:fileId/thumbnail
Gets document thumbnail.

**Permission**: Authenticated

**Query Parameters**:
- `size`: 'small' | 'medium' | 'large' (default: 'medium')

---

### Version Control Endpoints

#### GET /versions/:fileId
Gets file versions.

**Permission**: Authenticated

#### POST /versions/:fileId/restore
Restores previous version.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Request**: `{ "versionId": "v-123" }`

#### DELETE /versions/:fileId/:versionId
Deletes version.

**Permission**: ROLE_ADMIN

---

### Permission & Sharing Endpoints

#### POST /permissions/grant
Grants access to file.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Request**:
```json
{
  "fileId": "file-id",
  "grantedToEmail": "user@university.edu",
  "roles": ["read"] // or ["read", "edit"]
  "type": "user",
  "expirationDays": 30, // optional
  "notifyPeople": true // optional
}
```

#### GET /permissions/:fileId
Gets file permissions.

**Permission**: Authenticated

#### DELETE /permissions/:fileId/:permissionId
Revokes access.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

#### POST /sharing/create-link
Creates sharing link.

**Permission**: ROLE_ADMIN, ROLE_FACULTY

**Request**:
```json
{
  "fileId": "file-id",
  "type": "view", // 'view', 'edit', 'embed'
  "scope": "organization", // 'anonymous', 'organization', 'users'
  "password": "optional",
  "expirationDateTime": "2024-12-31T23:59:59Z"
}
```

---

### Search Endpoints

#### POST /search
Searches files and folders.

**Permission**: Authenticated

**Request**:
```json
{
  "query": "accreditation",
  "fileType": "pdf", // optional
  "createdAfter": "2024-01-01", // optional
  "createdBefore": "2024-12-31", // optional
  "minSize": 1000, // optional
  "maxSize": 10000000, // optional
  "tags": ["accreditation"] // optional
}
```

#### GET /recent
Gets recent files.

**Permission**: Authenticated

**Query Parameters**: `limit` (default: 10)

#### GET /shared-with-me
Gets files shared with user.

**Permission**: Authenticated

**Query Parameters**: `limit` (default: 10)

---

### Storage Endpoints

#### GET /quota
Gets OneDrive quota information.

**Permission**: Authenticated

---

### Activity Endpoints

#### GET /folders/:folderId/activity
Gets folder activity log.

**Permission**: Authenticated

**Query Parameters**: `limit` (default: 50)

---

## Integration Examples

### Example 1: Create Complete Accreditation Structure

```typescript
// 1. Create accreditation folder
const accConfig = await GraphIntegrationService.createAccreditationFolder(
  'ACC001',
  'NBA',
  ['1', '2', '3', '4', '5']
);

// 2. Upload evidence for criteria
for (const criteriaId of ['1', '2', '3']) {
  await GraphIntegrationService.uploadEvidenceFile(
    accConfig.folderId,
    criteriaId,
    `evidence_${criteriaId}.pdf`,
    `/path/to/evidence/file`,
    `Evidence for criteria ${criteriaId}`
  );
}

// 3. Grant access to accreditation committee
await GraphIntegrationService.grantAccess({
  fileId: accConfig.folderId,
  grantedToEmail: 'committee@university.edu',
  roles: ['read'],
  expirationDays: 60
});
```

### Example 2: Faculty Research Documentation

```typescript
// 1. Create faculty folder
const facultyFolder = await GraphIntegrationService.createFacultyFolder(
  'FAC001',
  'Dr. John Smith',
  'john@university.edu'
);

// 2. Upload research documents to research subfolder
const researchFolderId = facultyFolder.subfolders.research;

const uploadResult = await GraphIntegrationService.uploadFile({
  fileName: 'research_proposal.pdf',
  filePath: '/uploads/proposal.pdf',
  fileSize: 2048000,
  mimeType: 'application/pdf',
  parentFolderId: researchFolderId,
  description: 'Research project proposal for AI in Education'
});

// 3. Create sharing link for supervisor
const shareLink = await GraphIntegrationService.createSharingLink({
  fileId: uploadResult.fileId,
  type: 'edit',
  scope: 'users',
  expirationDateTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
});

// 4. Get versions and activity
const versions = await GraphIntegrationService.getFileVersions(uploadResult.fileId);
const activity = await GraphIntegrationService.getFolderActivity(researchFolderId);
```

### Example 3: Student Assignment Submission

```typescript
const studentFolder = await GraphIntegrationService.createStudentFolder(
  'STU001',
  'Raj Kumar',
  '2021001',
  'raj@university.edu',
  3
);

// Upload assignment to assignments folder
const assignmentResult = await GraphIntegrationService.uploadFile({
  fileName: 'assignment_01.pdf',
  filePath: '/uploads/assignment.pdf',
  fileSize: 1024000,
  mimeType: 'application/pdf',
  parentFolderId: studentFolder.subfolders.assignments,
  description: 'Assignment 1 submission'
});

// Grant teacher read access
await GraphIntegrationService.grantAccess({
  fileId: assignmentResult.fileId,
  grantedToEmail: 'teacher@university.edu',
  roles: ['read', 'edit'] // Teacher can add comments/feedback
});

// Get preview for teacher
const preview = await GraphIntegrationService.getDocumentPreview(assignmentResult.fileId);
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    // Details in development mode only
  }
}
```

### Common Errors

1. **401 Unauthorized**
   - Missing or invalid JWT token
   - Solution: Ensure valid authentication header

2. **403 Forbidden**
   - User lacks required permissions
   - Solution: Check user role requirements

3. **404 Not Found**
   - Folder or file doesn't exist
   - Solution: Verify IDs and folder structure

4. **413 Payload Too Large**
   - File exceeds size limit (100MB)
   - Solution: Split into smaller files

5. **429 Too Many Requests**
   - Graph API rate limit exceeded
   - Solution: Implement exponential backoff

---

## Security Considerations

### 1. Authentication
- All endpoints require JWT authentication
- Validate tokens before Graph API calls
- Implement token refresh mechanism

### 2. Authorization
- Role-based access control for all operations
- Only HOD can manage faculty folders
- Only students can write to their own folders
- Only directors/admins can manage accreditation

### 3. Data Protection
- All files encrypted in transit (HTTPS)
- OneDrive provides at-rest encryption
- Version history is maintained for audit trail
- Access logs tracked via activity API

### 4. File Upload Safety
- Validate file types before upload
- Scan uploaded files for malware (optional)
- Implement file size limits
- Use virus scanning service

### 5. Sharing Security
- Expiration dates for sharing links
- Password protection for sensitive links
- Email notifications when access granted
- Ability to revoke access anytime

---

## Best Practices

### 1. Folder Organization
- Use consistent naming conventions
- Create folder structure before bulk operations
- Archive old documents regularly

### 2. Permission Management
- Grant minimum necessary permissions
- Set expiration dates for external access
- Regularly audit and review permissions

### 3. File Management
- Use meaningful file names
- Add descriptions to files
- Leverage tagging for categorization
- Monitor storage quota

### 4. Error Handling
- Implement retry logic with exponential backoff
- Log all errors for debugging
- Provide meaningful error messages to users

### 5. Performance
- Use bulk operations for multiple files
- Implement progress tracking for uploads
- Cache folder structures
- Use pagination for large result sets

---

Last Updated: January 2024
