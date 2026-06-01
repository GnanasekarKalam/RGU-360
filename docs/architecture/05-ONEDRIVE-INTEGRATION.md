# OneDrive Integration Architecture - Academic Department360 Dashboard

## 1. Integration Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                 ACADEMIC DASHBOARD                                │
│                  (Node.js Backend)                                │
└────────────┬─────────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────┐
             │                                         │
             ↓                                         ↓
    ┌─────────────────┐                    ┌──────────────────────┐
    │ OneDrive        │                    │ Document Storage     │
    │ Integration     │                    │ Service (Local)      │
    │ Module          │                    │                      │
    └────────┬────────┘                    └──────────────────────┘
             │
      ┌──────┴────────────┐
      │                   │
      ↓                   ↓
┌────────────┐    ┌──────────────┐
│ OAuth 2.0  │    │  Graph API   │
│ Auth Flow  │    │  Integration │
└────────────┘    └──────────────┘
      │                   │
      └──────────┬────────┘
                 ↓
         ┌──────────────────┐
         │ Microsoft Graph  │
         │ API Endpoints    │
         └──────────────────┘
                 │
         ┌───────┴────────────┐
         │                    │
         ↓                    ↓
    ┌─────────┐        ┌──────────┐
    │ Files   │        │ Drives   │
    │ API     │        │ API      │
    └─────────┘        └──────────┘
         │                    │
         └───────────┬────────┘
                     ↓
         ┌──────────────────────────┐
         │ OneDrive / SharePoint    │
         │ File Storage             │
         └──────────────────────────┘
```

---

## 2. OAuth 2.0 Authentication Flow

### 2.1 Initial Authorization

```
┌──────────┐                     ┌─────────────┐
│ Frontend │                     │ Backend API │
└────┬─────┘                     └──────┬──────┘
     │                                  │
     │ 1. User clicks "Connect OneDrive"│
     ├─────────────────────────────────→│
     │                                  │
     │                    2. Redirect to Microsoft
     │←─────────────────────────────────┤
     │     (with redirect_uri)          │
     │                                  │
     │ 3. User grants permission at     │
     │    Microsoft login page          │
     │                                  │
     │    Microsoft redirects to        │
     │    redirect_uri?code=AUTH_CODE   │
     ├─────────────────────────────────→│
     │                                  │
     │ 4. Backend exchanges            │
     │    code for access token        │
     │    (Backend → Microsoft)        │
     │                                  │
     │    5. Access token returned     │
     │←─────────────────────────────────┤
     │                                  │
     │    6. Store refresh token       │
     │        (encrypted)              │
     │                                  │
     │    7. Confirmation to user     │
     │←─────────────────────────────────┤
     │                                  │
```

### 2.2 Token Management

```javascript
// OAuth Configuration
const oauthConfig = {
  clientId: process.env.MICROSOFT_CLIENT_ID,
  clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
  redirectUri: 'https://dashboard.university.edu/api/onedrive/callback',
  authority: 'https://login.microsoftonline.com/common',
  scope: [
    'Files.ReadWrite.All',
    'Sites.Manage.All',
    'user.read'
  ]
};

// Token Storage (Encrypted in Database)
const OneDriveTokens = {
  id: UUID,
  user_id: UUID,
  access_token: STRING (ENCRYPTED),
  refresh_token: STRING (ENCRYPTED),
  token_type: 'Bearer',
  expires_in: 3600,
  expires_at: TIMESTAMP,
  scope: STRING,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
};

// Token Refresh Logic
async function refreshAccessToken(user_id) {
  const tokenRecord = await getTokenRecord(user_id);
  
  if (isTokenExpired(tokenRecord.expires_at)) {
    const newToken = await microsoftAuthProvider.refresh(
      tokenRecord.refresh_token
    );
    
    // Update encrypted token in database
    await updateTokenRecord(user_id, {
      access_token: encrypt(newToken.access_token),
      refresh_token: encrypt(newToken.refresh_token),
      expires_at: calculateExpiryTime()
    });
    
    return newToken.access_token;
  }
  
  return decrypt(tokenRecord.access_token);
}
```

---

## 3. Folder Structure & Organization

### 3.1 OneDrive Folder Hierarchy

```
Academic Dashboard (Root)
│
├── Courses
│   ├── [Semester_Code]
│   │   ├── [Department_Code]-[Course_Number] (e.g., MATH-101)
│   │   │   ├── Syllabus
│   │   │   ├── Lecture_Notes
│   │   │   ├── Assignments
│   │   │   │   ├── Assignment_1
│   │   │   │   └── Assignment_2
│   │   │   ├── Exams
│   │   │   ├── Resources
│   │   │   ├── Recordings (if applicable)
│   │   │   └── Student_Submissions
│   │   │       ├── [Student_ID]_[Last_Name]
│   │   │       └── [Student_ID]_[Last_Name]
│   │   │
│   │   └── [Department_Code]-[Course_Number]
│   │
│   └── [Previous_Semester]
│
├── Student_Records
│   ├── [Academic_Year]
│   │   ├── [Student_ID]
│   │   │   ├── Transcripts
│   │   │   ├── Degree_Audit
│   │   │   ├── Academic_Plans
│   │   │   ├── Appeals
│   │   │   └── Correspondence
│   │   │
│   │   └── [Student_ID]
│   │
│   └── [Previous_Year]
│
├── Faculty_Records
│   ├── [Faculty_ID]
│   │   ├── Teaching_Materials
│   │   ├── Research
│   │   ├── Professional_Development
│   │   ├── Evaluations
│   │   └── Contracts
│   │
│   └── [Faculty_ID]
│
├── Department_Administration
│   ├── Policies
│   ├── Procedures
│   ├── Curriculum
│   ├── Accreditation
│   ├── Budget
│   └── Reports
│
├── Compliance
│   ├── FERPA_Agreements
│   ├── Audit_Records
│   ├── Legal_Documents
│   └── Certificates
│
└── Archive
    ├── [Previous_Academic_Years]
    └── Archived_Courses
```

### 3.2 Automatic Folder Creation

```javascript
// Folder creation triggered by events

class OneDriveFolderManager {
  async createCourseFolders(courseId, semester) {
    const course = await getCourse(courseId);
    const basePath = `/Courses/${semester.code}/${course.code}`;
    
    const requiredFolders = [
      `${basePath}/Syllabus`,
      `${basePath}/Lecture_Notes`,
      `${basePath}/Assignments`,
      `${basePath}/Exams`,
      `${basePath}/Resources`,
      `${basePath}/Student_Submissions`
    ];
    
    for (const folder of requiredFolders) {
      await this.createFolder(folder);
    }
    
    // Create per-student submission folders
    const enrollments = await getEnrollments(courseId, semester);
    for (const enrollment of enrollments) {
      const studentFolder = `${basePath}/Student_Submissions/${enrollment.student.id}_${enrollment.student.user.last_name}`;
      await this.createFolder(studentFolder);
      
      // Set permissions for student access
      await this.grantStudentAccess(studentFolder, enrollment.student.user.email);
    }
  }
  
  async createStudentRecordFolders(studentId, academicYear) {
    const student = await getStudent(studentId);
    const basePath = `/Student_Records/${academicYear}/${student.id}`;
    
    const folders = [
      `${basePath}/Transcripts`,
      `${basePath}/Degree_Audit`,
      `${basePath}/Academic_Plans`,
      `${basePath}/Appeals`
    ];
    
    for (const folder of folders) {
      await this.createFolder(folder);
    }
  }
}
```

---

## 4. API Endpoints & Operations

### 4.1 Core OneDrive Operations

```javascript
// List files in a folder
GET /api/onedrive/files?path=/Courses/Fall2026/MATH-101

// Upload file to course
POST /api/onedrive/upload
Body: {
  path: '/Courses/Fall2026/MATH-101/Lecture_Notes',
  file: <binary>,
  fileName: 'Lecture_01.pdf'
}

// Download file
GET /api/onedrive/download?fileId=<file_id>

// Get file metadata
GET /api/onedrive/file-info?fileId=<file_id>

// Share file with user
POST /api/onedrive/share
Body: {
  fileId: '<file_id>',
  email: 'student@university.edu',
  permissions: 'view' | 'edit'
}

// Delete file
DELETE /api/onedrive/file?fileId=<file_id>

// Search files
GET /api/onedrive/search?query=<search_term>&path=/Courses
```

### 4.2 OneDrive Service Implementation

```javascript
class OneDriveService {
  constructor(graphClient) {
    this.graphClient = graphClient;
  }

  // Upload file to OneDrive
  async uploadFile(userId, filePath, file, fileName) {
    const token = await this.getAccessToken(userId);
    
    const uploadUrl = 
      `https://graph.microsoft.com/v1.0/me/drive/root:${filePath}/${fileName}:/content`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream'
      },
      body: file
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const fileData = await response.json();
    
    // Log file upload
    await this.logFileOperation(userId, 'upload', filePath, fileName, fileData.id);
    
    return fileData;
  }

  // Share file with specific permissions
  async shareFileWithUser(userId, fileId, shareWithEmail, permissionType = 'view') {
    const token = await this.getAccessToken(userId);
    
    const shareUrl = 
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/invite`;
    
    const response = await fetch(shareUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        recipients: [{ email: shareWithEmail }],
        message: 'Access to course materials',
        requireSignIn: true,
        sendInvitation: true,
        roles: [permissionType === 'view' ? 'read' : 'write']
      })
    });
    
    if (!response.ok) {
      throw new Error(`Share failed: ${response.statusText}`);
    }
    
    const shareData = await response.json();
    
    // Log sharing action
    await this.logFileOperation(
      userId, 
      'share', 
      fileId, 
      shareWithEmail, 
      shareData.value[0].id
    );
    
    return shareData;
  }

  // Get file metadata
  async getFileMetadata(userId, fileId) {
    const token = await this.getAccessToken(userId);
    
    const metadataUrl = 
      `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}`;
    
    const response = await fetch(metadataUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Get metadata failed: ${response.statusText}`);
    }
    
    return await response.json();
  }
}
```

---

## 5. File Synchronization & Webhooks

### 5.1 Webhook Integration

```javascript
// Register webhook for file changes
class OneDriveWebhookManager {
  async registerWebhook(userId, folderPath) {
    const token = await this.getAccessToken(userId);
    
    const subscriptionUrl = 
      'https://graph.microsoft.com/v1.0/subscriptions';
    
    const response = await fetch(subscriptionUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        changeType: 'updated,created,deleted',
        notificationUrl: 'https://dashboard.university.edu/api/onedrive/webhook',
        resource: `/me/drive/root:${folderPath}`,
        expirationDateTime: new Date(Date.now() + 4320 * 60000).toISOString(),
        clientState: `webhook-${userId}-${Date.now()}`
      })
    });
    
    return await response.json();
  }

  // Handle webhook notifications
  async handleWebhookNotification(notification) {
    const { resourceData, clientState, changeType, resource } = notification;
    
    // Validate client state
    if (!this.validateClientState(clientState)) {
      throw new Error('Invalid webhook notification');
    }
    
    // Log the change
    await this.logFileChange({
      userId: this.extractUserFromClientState(clientState),
      resourcePath: resource,
      changeType,
      timestamp: new Date()
    });
    
    // Trigger corresponding actions
    if (changeType === 'deleted') {
      await this.handleFileDeleted(resource);
    } else if (changeType === 'created') {
      await this.handleFileCreated(resourceData, resource);
    } else if (changeType === 'updated') {
      await this.handleFileUpdated(resourceData, resource);
    }
  }
}
```

### 5.2 Sync Events

| Event | Trigger | Action |
|-------|---------|--------|
| `file.created` | Faculty uploads new material | Log event, index file, notify students |
| `file.updated` | Course material revised | Update modification date, notify subscribers |
| `file.deleted` | Outdated material removed | Archive reference, audit log |
| `folder.created` | New course/semester created | Auto-create structure, set permissions |
| `sharing.granted` | File shared with user | Log access grant, track permissions |

---

## 6. Access Control & Permissions

### 6.1 Permission Mapping

```
Dashboard Role → OneDrive Permissions

Faculty:
├── /Courses/[Semester]/[Own_Course]/ → Full Edit (read, write, delete)
├── /Student_Records/[Students_in_Course]/ → Read Only
└── /Faculty_Records/[Self]/ → Full Edit

Students:
├── /Courses/[Enrolled_Courses]/ → Read Only
├── /Courses/[Course]/Student_Submissions/[Self]/ → Read, Write
└── /Student_Records/[Self]/ → Read Only

Department Head:
├── /Courses/[Department]/ → Read, Write (approve)
├── /Student_Records/[Department_Students]/ → Read Only
└── /Department_Administration/ → Full Edit

Admin Staff:
├── /Courses/ → Read, Write
├── /Student_Records/ → Read, Write
└── /Department_Administration/ → Read, Write
```

### 6.2 Permission Sync

```javascript
class PermissionSyncService {
  // Sync permissions when enrollment changes
  async syncEnrollmentPermissions(enrollmentId, action) {
    const enrollment = await getEnrollment(enrollmentId);
    const studentEmail = enrollment.student.user.email;
    const courseId = enrollment.class.course.id;
    
    if (action === 'enroll') {
      // Grant access to course materials
      await this.grantFolderAccess(
        `/Courses/[Semester]/${courseId}`,
        studentEmail,
        'read'
      );
      
      // Grant access to student submission folder
      await this.grantFolderAccess(
        `/Courses/[Semester]/${courseId}/Student_Submissions/[StudentId]`,
        studentEmail,
        'read'
      );
    } else if (action === 'drop') {
      // Revoke access
      await this.revokeFolderAccess(
        `/Courses/[Semester]/${courseId}`,
        studentEmail
      );
    }
  }

  // Sync permissions when role changes
  async syncRolePermissions(userId, newRole, departmentId) {
    const user = await getUser(userId);
    
    if (newRole === 'department_head') {
      // Grant department-wide access
      await this.grantFolderAccess(
        `/Department_Administration/${departmentId}`,
        user.email,
        'write'
      );
      
      await this.grantFolderAccess(
        `/Courses/[AllSemesters]/${departmentId}`,
        user.email,
        'write'
      );
    }
  }
}
```

---

## 7. Data Consistency & Backup

### 7.1 Sync Verification

```javascript
class OneDriveSyncVerifier {
  async verifyFolderStructure(courseId, semester) {
    const expectedStructure = this.getExpectedFolderStructure(courseId, semester);
    const actualStructure = await this.getActualFolderStructure(courseId, semester);
    
    const differences = this.compareStructures(expectedStructure, actualStructure);
    
    if (differences.missing.length > 0) {
      // Recreate missing folders
      for (const folder of differences.missing) {
        await this.createFolder(folder);
      }
    }
    
    if (differences.extra.length > 0) {
      // Log anomalies
      await this.logAnomalies(differences.extra);
    }
  }

  // Verification triggers
  // - Daily scheduled sync verification
  // - On-demand verification (admin)
  // - Verification after major operations
}
```

### 7.2 Backup Strategy

```
OneDrive Backup Plan:

1. Automatic Backup
   ├── Frequency: Daily at 2:00 AM UTC
   ├── Scope: All course materials and official documents
   ├── Retention: 30 days rolling backup
   └── Location: Separate OneDrive backup drive

2. Manual Backup (Faculty)
   ├── Available: One-click backup of course materials
   ├── Frequency: Anytime (manual)
   └── Location: Local or personal OneDrive

3. Compliance/Archive Backup
   ├── Frequency: End of semester and annual
   ├── Scope: All academic records
   ├── Retention: 7+ years (per FERPA)
   └── Location: Encrypted secure storage

4. Disaster Recovery
   ├── RTO: 4 hours
   ├── RPO: 1 hour
   ├── Testing: Quarterly disaster recovery drills
   └── Failover: Geographic redundancy
```

---

## 8. Logging & Audit Trail

### 8.1 OneDrive Operations Logging

```sql
CREATE TABLE onedrive_operations (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  operation_type ENUM('upload', 'download', 'share', 'delete', 'create') NOT NULL,
  file_id VARCHAR(255),
  file_name VARCHAR(500),
  file_path VARCHAR(1000),
  shared_with_email VARCHAR(255),
  permission_type VARCHAR(50),
  file_size_bytes BIGINT,
  status ENUM('success', 'failed') DEFAULT 'success',
  error_message TEXT,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_operation_type (operation_type),
  INDEX idx_file_id (file_id)
);
```

### 8.2 Access Audit

```
Access Audit Queries:

1. Who accessed a file?
   SELECT user_id, file_name, created_at 
   FROM onedrive_operations 
   WHERE file_id = ? ORDER BY created_at

2. What did a user access?
   SELECT file_path, operation_type, created_at 
   FROM onedrive_operations 
   WHERE user_id = ? ORDER BY created_at

3. When was a file shared?
   SELECT shared_with_email, permission_type, created_at 
   FROM onedrive_operations 
   WHERE operation_type = 'share' 
   AND file_id = ? ORDER BY created_at

4. Sensitive access (FERPA protected)
   SELECT * FROM onedrive_operations o
   JOIN student_records sr ON o.file_path LIKE CONCAT('%', sr.id, '%')
   WHERE o.created_at > NOW() - INTERVAL 30 DAY
```

---

## 9. Error Handling & Resilience

### 9.1 Retry Logic

```javascript
class OneDriveRetryPolicy {
  async executeWithRetry(operation, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (error.status === 429) {
          // Rate limited: exponential backoff
          const backoffMs = Math.pow(2, attempt) * 1000;
          await this.sleep(backoffMs);
        } else if (error.status >= 500) {
          // Server error: retry after delay
          await this.sleep(2000 * attempt);
        } else if (error.status === 401) {
          // Token expired: refresh and retry
          await this.refreshToken();
        } else {
          // Not retryable
          throw error;
        }
      }
    }
    
    throw lastError;
  }
}
```

### 9.2 Fallback Strategy

```
Fallback Behavior:

1. OneDrive Unavailable
   ├── Cache local files temporarily
   ├── Queue operations for retry
   ├── Display cached version to users
   └── Notify users of service status

2. Authentication Failure
   ├── Return 401 to frontend
   ├── Prompt user to re-authenticate
   ├── Store failed operation context
   └── Retry after successful authentication

3. Permission Denied
   ├── Log security alert
   ├── Return 403 to frontend
   ├── Notify admin if suspicious
   └── Audit trail for compliance
```

---

## 10. Performance Optimization

### 10.1 Caching Strategy

```javascript
class OneDriveCache {
  constructor() {
    this.cache = new Map();
    this.ttl = {
      folderMetadata: 3600000,      // 1 hour
      fileList: 1800000,             // 30 minutes
      permissions: 86400000,         // 24 hours
      search: 300000                 // 5 minutes
    };
  }

  async getFolderContents(folderPath) {
    const cacheKey = `folder:${folderPath}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.ttl.fileList) {
      return cached.data;
    }
    
    const data = await this.fetchFolderContents(folderPath);
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }
}
```

### 10.2 Batch Operations

```javascript
// Batch file operations for efficiency
class OneDriveBatchOperations {
  async batchShareFiles(fileIds, email, permission) {
    const batchRequests = fileIds.map((fileId, index) => ({
      id: index + 1,
      method: 'POST',
      url: `/me/drive/items/${fileId}/invite`,
      body: {
        recipients: [{ email }],
        roles: [permission]
      }
    }));
    
    return await this.executeBatch(batchRequests);
  }
}
```

---

## 11. Migration Plan (Existing Institutions)

### Phase 1: Preparation
- Audit existing OneDrive usage
- Map current folder structure
- Identify file access patterns
- Plan folder reorganization

### Phase 2: Initial Setup
- Create standardized folder structure
- Migrate existing course materials
- Set up automated folder creation
- Establish permission templates

### Phase 3: User Training
- Documentation on new structure
- Video tutorials
- Training sessions for faculty
- Support desk resources

### Phase 4: Gradual Migration
- Migrate by semester/department
- Parallel systems during transition
- Data validation at each stage
- Rollback plan if needed

### Phase 5: Optimization
- Monitor usage patterns
- Optimize folder structure if needed
- Fine-tune permissions
- Gather feedback

