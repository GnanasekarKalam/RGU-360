// GRAPH-INTEGRATION-QUICK-START.md
# Microsoft Graph API Integration - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install @microsoft/microsoft-graph-client @microsoft/identity-client multer isomorphic-fetch
```

### 2. Configure Environment Variables

Create `.env` file:

```env
GRAPH_CLIENT_ID=your-client-id-from-azure
GRAPH_CLIENT_SECRET=your-client-secret-from-azure
GRAPH_TENANT_ID=your-tenant-id
```

### 3. Register Routes in Your App

**`src/index.ts`**:

```typescript
import graphIntegrationRoutes from './routes/graph-integration.routes';
import { initializeGraphClient } from './config/graph.config';

// Initialize Graph client on startup
initializeGraphClient().then(() => {
  console.log('Graph API client initialized');
}).catch(err => {
  console.error('Failed to initialize Graph client:', err);
});

// Register routes
app.use('/api/graph', graphIntegrationRoutes);
```

### 4. Verify Installation

```bash
npm run dev
# Check logs for "Graph API client initialized"
```

---

## Common Use Cases

### Use Case 1: Create Faculty Folder Structure

```typescript
const response = await fetch('/api/graph/folders/faculty', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    facultyId: 'FAC001',
    facultyName: 'Dr. John Smith',
    email: 'john@university.edu'
  })
});

const result = await response.json();
console.log('Faculty folder created:', result.data.folderId);
```

### Use Case 2: Upload Accreditation Evidence

```typescript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('accreditationFolderId', 'acc-folder-id');
formData.append('criteriaId', 'criteria-1');
formData.append('description', 'NBA Criteria 1 Evidence');

const response = await fetch('/api/graph/files/evidence-upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('Evidence uploaded:', result.data.fileId);
```

### Use Case 3: Grant Access to File

```typescript
const response = await fetch('/api/graph/permissions/grant', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileId: 'file-id',
    grantedToEmail: 'reviewer@university.edu',
    roles: ['read'],
    expirationDays: 30,
    notifyPeople: true
  })
});

const result = await response.json();
console.log('Access granted:', result.data.permissionId);
```

### Use Case 4: Create Sharing Link

```typescript
const response = await fetch('/api/graph/sharing/create-link', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fileId: 'file-id',
    type: 'view',
    scope: 'organization',
    expirationDateTime: new Date(Date.now() + 30*24*60*60*1000).toISOString()
  })
});

const result = await response.json();
console.log('Sharing link:', result.data.link.webUrl);
```

### Use Case 5: Get Document Preview

```typescript
const response = await fetch('/api/graph/documents/file-id/preview', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
const { previewUrl, canPreview } = result.data;

if (canPreview) {
  // Embed preview in iframe or viewer
  document.getElementById('preview').src = previewUrl;
}
```

---

## API Endpoints Quick Reference

### Folder Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/graph/folders/root-structure` | Create root folders |
| POST | `/api/graph/folders/faculty` | Create faculty folder |
| POST | `/api/graph/folders/student` | Create student folder |
| POST | `/api/graph/folders/accreditation` | Create accreditation folder |
| GET | `/api/graph/folders/:id/contents` | List folder contents |
| PATCH | `/api/graph/folders/:id/rename` | Rename folder |
| DELETE | `/api/graph/folders/:id` | Delete folder |

### File Operations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/graph/files/upload` | Upload file |
| POST | `/api/graph/files/evidence-upload` | Upload evidence |
| POST | `/api/graph/files/bulk-upload` | Upload multiple files |
| GET | `/api/graph/files/:id/metadata` | Get file metadata |
| GET | `/api/graph/files/:id/download` | Download file |
| POST | `/api/graph/files/:id/copy` | Copy file |
| POST | `/api/graph/files/:id/move` | Move file |
| DELETE | `/api/graph/files/:id` | Delete file |

### Document Preview
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/graph/documents/:id/preview` | Get preview |
| GET | `/api/graph/documents/:id/thumbnail` | Get thumbnail |

### Version Control
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/graph/versions/:id` | Get versions |
| POST | `/api/graph/versions/:id/restore` | Restore version |
| DELETE | `/api/graph/versions/:id/:vid` | Delete version |

### Permissions & Sharing
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/graph/permissions/grant` | Grant access |
| GET | `/api/graph/permissions/:id` | Get permissions |
| DELETE | `/api/graph/permissions/:id/:pid` | Revoke access |
| POST | `/api/graph/sharing/create-link` | Create share link |

### Search & Discovery
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/graph/search` | Search files |
| GET | `/api/graph/recent` | Get recent files |
| GET | `/api/graph/shared-with-me` | Get shared files |

### Storage & Activity
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/graph/quota` | Get storage quota |
| GET | `/api/graph/folders/:id/activity` | Get activity log |

---

## Troubleshooting

### Issue: "Graph API client not initialized"

**Solution**: Ensure environment variables are set:
```bash
echo $GRAPH_CLIENT_ID
echo $GRAPH_CLIENT_SECRET
echo $GRAPH_TENANT_ID
```

### Issue: "401 Unauthorized"

**Solution**: Check token validity:
```typescript
// Verify token is in Authorization header
console.log('Authorization:', request.headers.authorization);
```

### Issue: "403 Forbidden"

**Solution**: Verify user role:
```typescript
// Check user has required role
console.log('User role:', request.user.role);
// Faculty operations require ROLE_ADMIN or ROLE_FACULTY
```

### Issue: "File upload failed with 413"

**Solution**: File exceeds 100MB limit. Split into smaller files:
```typescript
// Max file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;
if (file.size > MAX_FILE_SIZE) {
  // Use chunked upload or compress file
}
```

### Issue: "Resource not found (404)"

**Solution**: Verify folder/file IDs:
```typescript
// Test with valid folder ID
const contents = await fetch('/api/graph/folders/valid-id/contents', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## Testing the Integration

### Test 1: Create Folder Structure

```bash
curl -X POST http://localhost:3000/api/graph/folders/root-structure \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Test 2: Create Faculty Folder

```bash
curl -X POST http://localhost:3000/api/graph/folders/faculty \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "facultyId": "FAC001",
    "facultyName": "Dr. Smith",
    "email": "john@university.edu"
  }'
```

### Test 3: Upload File

```bash
curl -X POST http://localhost:3000/api/graph/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "parentFolderId=folder-id"
```

### Test 4: Get Quota

```bash
curl -X GET http://localhost:3000/api/graph/quota \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## React Integration Example

### Component: FileUploader

```typescript
import { useState } from 'react';

export function FileUploader({ parentFolderId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentFolderId', parentFolderId);

    try {
      const response = await fetch('/api/graph/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setProgress(100);
        onUploadComplete(result.data);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <progress value={progress} max={100} />}
    </div>
  );
}
```

### Component: DocumentPreview

```typescript
import { useEffect, useState } from 'react';

export function DocumentPreview({ fileId }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const response = await fetch(`/api/graph/documents/${fileId}/preview`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const result = await response.json();
        setPreview(result.data);
      } catch (error) {
        console.error('Failed to load preview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [fileId]);

  if (loading) return <div>Loading preview...</div>;
  if (!preview?.canPreview) return <div>Preview not available</div>;

  return (
    <iframe 
      src={preview.previewUrl} 
      style={{ width: '100%', height: '600px' }}
    />
  );
}
```

### Component: PermissionsManager

```typescript
import { useState } from 'react';

export function PermissionsManager({ fileId }) {
  const [email, setEmail] = useState('');
  const [granting, setGranting] = useState(false);

  const handleGrantAccess = async () => {
    setGranting(true);
    try {
      const response = await fetch('/api/graph/permissions/grant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId,
          grantedToEmail: email,
          roles: ['read'],
          expirationDays: 30
        })
      });

      const result = await response.json();
      if (result.success) {
        alert('Access granted successfully');
        setEmail('');
      }
    } catch (error) {
      console.error('Failed to grant access:', error);
    } finally {
      setGranting(false);
    }
  };

  return (
    <div>
      <input
        type="email"
        placeholder="user@university.edu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button 
        onClick={handleGrantAccess}
        disabled={granting || !email}
      >
        {granting ? 'Granting...' : 'Grant Access'}
      </button>
    </div>
  );
}
```

---

## Performance Tips

### 1. Use Bulk Upload for Multiple Files

```typescript
// Instead of uploading one by one
const response = await fetch('/api/graph/files/bulk-upload', {
  method: 'POST',
  body: formData // Multiple files
});
```

### 2. Cache Folder Structure

```typescript
// Store folder IDs locally to avoid repeated lookups
const folderCache = {
  faculty: 'folder-id-1',
  students: 'folder-id-2',
  accreditation: 'folder-id-3'
};
```

### 3. Implement Pagination for Search Results

```typescript
// Fetch results in batches
const results = await fetch(
  '/api/graph/search?limit=20&offset=0',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

### 4. Use Thumbnails Instead of Full Preview

```typescript
// For file listings, use thumbnails
const thumbnail = await fetch(
  `/api/graph/documents/${fileId}/thumbnail?size=small`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

## Database Integration

### Store Folder IDs in Database

```typescript
// When faculty folder is created
const folderConfig = await createFacultyFolder(...);

// Save to database
await prisma.faculty.update({
  where: { facultyId },
  data: {
    onedriveFolderId: folderConfig.folderId,
    onedriveSubfolders: folderConfig.subfolders
  }
});
```

### Track Evidence Submissions

```typescript
// After uploading evidence
await prisma.accreditationEvidence.create({
  data: {
    accreditationId,
    criteriaId,
    fileName: response.fileName,
    fileId: response.fileId,
    webUrl: response.webUrl,
    uploadedAt: new Date(),
    uploadedBy: userId
  }
});
```

---

## Next Steps

1. **Create root folder structure** on first app startup
2. **Create faculty folders** when new faculty is added
3. **Create student folders** when new student is added
4. **Create accreditation folders** for each accreditation process
5. **Implement evidence upload** in accreditation module
6. **Set up permission management** for collaborative access
7. **Add document preview** to file listings
8. **Monitor storage quota** and alert when usage high

---

## Support Resources

- **Full Documentation**: See `GRAPH-INTEGRATION-DOCUMENTATION.md`
- **Configuration**: See `src/config/graph.config.ts`
- **Service Layer**: See `src/services/graph-integration.service.ts`
- **API Routes**: See `src/routes/graph-integration.routes.ts`
- **Type Definitions**: See `src/types/graph-integration.types.ts`

---

## Security Checklist

- [ ] Environment variables set correctly
- [ ] Client secret stored securely (not in code)
- [ ] All endpoints require authentication
- [ ] Role-based access control implemented
- [ ] File upload size limits enforced
- [ ] Sharing links have expiration dates
- [ ] Activity logs are maintained
- [ ] Regular permission audits scheduled
- [ ] Malware scanning configured (optional)
- [ ] Backup and recovery plan in place

---

Last Updated: January 2024
