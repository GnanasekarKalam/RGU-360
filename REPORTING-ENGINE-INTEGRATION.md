// REPORTING-ENGINE-INTEGRATION.md
# Reporting Engine - Complete Integration Guide

## Quick Start Checklist

- [ ] Update Prisma schema with new models
- [ ] Run database migration
- [ ] Install required npm packages
- [ ] Copy reporting service files
- [ ] Register reporting routes
- [ ] Add React dashboard component
- [ ] Test report generation
- [ ] Configure environment variables
- [ ] Deploy to production

---

## Step 1: Update Prisma Schema

### 1.1 Update `prisma/schema.prisma`

**Add to the Prisma schema file**:

1. Copy all content from `prisma/schema-reporting-additions.prisma`
2. Paste into the main `prisma/schema.prisma` file
3. Review for any conflicts or duplicate models

**Key additions**:
- ReportHistory model
- DownloadLog model
- ReportTemplate model
- ScheduledReport model
- ReportShareLink model
- FacultyAPIScore model
- 4 new enums (ReportType, FileFormat, GenerationStatus, ScheduleFrequency)

### 1.2 Update relationships in existing models

In your `User` model, add:
```prisma
model User {
  // ... existing fields
  reportHistoriesGenerated ReportHistory[]  @relation("reportGeneratedBy")
  reportHistoriesApproved  ReportHistory[]  @relation("reportApprovedBy")
  downloadLogs             DownloadLog[]
  reportShareLinks         ReportShareLink[]
}
```

In your `Faculty` model, add:
```prisma
model Faculty {
  // ... existing fields
  apiScores               FacultyAPIScore[]  @relation("facultyAPIScore")
}
```

In your `Department` model, add:
```prisma
model Department {
  // ... existing fields
  reportHistories         ReportHistory[]
}
```

### 1.3 Run migration

```bash
cd d:\Maths-Dashboard
npx prisma migrate dev --name add_reporting_engine
```

Verify migration succeeded:
```bash
npx prisma db execute --stdin < "SELECT 1 FROM ReportHistory LIMIT 1"
# Should run without error
```

---

## Step 2: Install Dependencies

### 2.1 Install Node packages

```bash
cd d:\Maths-Dashboard
npm install exceljs pdfkit docx pptxgenjs json2csv
npm install --save-dev @types/pdfkit
```

### 2.2 Verify installations

```bash
npm list exceljs pdfkit docx pptxgenjs json2csv
```

---

## Step 3: Copy Service Files

### 3.1 Create reporting service

Create `src/services/reporting.service.ts` with the complete implementation from the conversation.

**Verify functions exist**:
- generateFacultyMasterReport()
- generateFacultyAPIScoreReport()
- generateStudentMasterReport()
- generateStudentProgressReport()
- generateNBAEvidenceReport()
- maskSensitiveData()
- calculateAPIScore()
- getStudentRiskLevel()

### 3.2 Create export service

Create `src/services/report-export.service.ts` with all 5 export functions:
- exportToExcel()
- exportToCSV()
- exportToPDF()
- exportToWord()
- exportToPPT()

**Verify**:
```bash
# Should compile without errors
npx tsc src/services/reporting.service.ts --noEmit
npx tsc src/services/report-export.service.ts --noEmit
```

---

## Step 4: Register API Routes

### 4.1 Update main application file

In `src/index.ts`:

```typescript
// Add import
import reportingRoutes from './routes/reporting.routes';

// After other route registrations (around line where other routes are imported)
// Register reporting routes with authentication middleware
app.use('/api/reports', reportingRoutes);

// Verify route is registered
console.log('✓ Reporting routes registered');
```

### 4.2 Create routing file

Create `src/routes/reporting.routes.ts` with all endpoints from the conversation.

**Endpoints to include**:
- Faculty reports (6 endpoints)
- Student reports (4 endpoints)
- Accreditation reports (1+ endpoints)
- History management (3 endpoints)
- Download logs (1 endpoint)

### 4.3 Verify routes are registered

```bash
# Start server
npm run dev

# Test endpoint (should require auth)
curl http://localhost:5000/api/reports/faculty/master
# Should return 401 Unauthorized (expected)

# With token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/reports/faculty/master
# Should return 200 OK
```

---

## Step 5: Add React Components

### 5.1 Create component directory

```bash
mkdir -p src/components/ReportingEngine
```

### 5.2 Add ReportDashboard component

Create `src/components/ReportingEngine/ReportDashboard.tsx` with the complete implementation from the conversation.

**Features**:
- Report generation dialog
- Recent reports table
- Download functionality
- Report deletion
- Format selection

### 5.3 Register in routing

In your main routing file (e.g., `src/pages/Dashboard.tsx` or routing configuration):

```jsx
import { ReportDashboard } from '../components/ReportingEngine/ReportDashboard';

export function DashboardRoutes() {
  return (
    <Routes>
      {/* ... other routes */}
      <Route path="/reports" element={<ReportDashboard />} />
    </Routes>
  );
}
```

### 5.4 Add to navigation menu

In your navigation component:

```jsx
<Link to="/reports">
  <FileDownloadIcon /> Reports
</Link>
```

---

## Step 6: Environment Configuration

### 6.1 Update `.env` file

Add these variables:

```env
# Reporting Engine Configuration
REPORT_STORAGE_TYPE=local
REPORT_STORAGE_PATH=./uploads/reports
REPORT_RETENTION_DAYS=90
MAX_REPORT_SIZE=104857600

# For OneDrive storage (future)
# REPORT_STORAGE_TYPE=onedrive
# MICROSOFT_GRAPH_ENDPOINT=https://graph.microsoft.com/v1.0

# Report generation
REPORT_GENERATION_TIMEOUT=60000
REPORT_MAX_RECORDS=10000
```

### 6.2 Create report storage directory

```bash
mkdir -p uploads/reports
```

---

## Step 7: Database Seeding (Optional)

### 7.1 Create seed file

Create `prisma/seed-reports.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create report templates
  await prisma.reportTemplate.create({
    data: {
      name: 'Faculty API Score Template',
      reportType: 'FACULTY_API_SCORE',
      includeCharts: true,
      includeSignatures: false,
      visibleColumns: ['name', 'email', 'totalAPIScore', 'apiCategory'],
      requiredRole: 'ROLE_ADMIN',
    },
  }).catch(() => console.log('Template already exists'));

  // Create sample scheduled report
  await prisma.scheduledReport.create({
    data: {
      name: 'Weekly Faculty Report',
      reportType: 'FACULTY_MASTER',
      frequency: 'WEEKLY',
      nextRunAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      createdById: 'admin_id', // Replace with actual admin ID
    },
  }).catch(() => console.log('Scheduled report already exists'));

  console.log('✓ Seed data created');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
```

### 7.2 Run seed

```bash
npx prisma db seed
```

---

## Step 8: Testing

### 8.1 Unit tests

Create `src/__tests__/reporting.service.test.ts`:

```typescript
import { generateFacultyMasterReport } from '../services/reporting.service';
import { prisma } from '../db';

describe('Reporting Service', () => {
  test('generateFacultyMasterReport returns valid data', async () => {
    const result = await generateFacultyMasterReport();
    
    expect(result).toHaveProperty('metadata');
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('Data masking works correctly', async () => {
    const result = await generateFacultyMasterReport();
    // Verify Aadhaar is masked
    result.data.forEach(faculty => {
      if (faculty.aadhaar) {
        expect(faculty.aadhaar).toMatch(/XXXX-XXXX-\d{4}/);
      }
    });
  });
});
```

### 8.2 Integration tests

Create `src/__tests__/reporting.routes.test.ts`:

```typescript
import request from 'supertest';
import app from '../index';

describe('Reporting API', () => {
  const token = 'valid_jwt_token'; // Get from auth system

  test('GET /api/reports/faculty/master returns PDF', async () => {
    const response = await request(app)
      .get('/api/reports/faculty/master?format=pdf')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('content-type', /application\/pdf/);

    expect(response.body).toBeDefined();
  });

  test('Unauthorized request returns 401', async () => {
    await request(app)
      .get('/api/reports/faculty/master')
      .expect(401);
  });

  test('Invalid format returns 400', async () => {
    await request(app)
      .get('/api/reports/faculty/master?format=invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });
});
```

### 8.3 Manual testing checklist

```
Frontend Tests:
[ ] Report Dashboard loads without errors
[ ] Generate Report button opens dialog
[ ] Report type dropdown shows all options
[ ] Format selection works (PDF, Excel, CSV, Word, PPT)
[ ] Generate & Download button works
[ ] Report history table displays recent reports
[ ] Download button downloads file correctly
[ ] Delete button removes report from history
[ ] Success/error messages display properly

Backend Tests:
[ ] Faculty Master Report endpoint works
[ ] Student Progress Report endpoint works
[ ] NBA Evidence Report endpoint works
[ ] Report history endpoint returns correct data
[ ] Download logs endpoint returns audit trail
[ ] Permission checks work (403 for unauthorized)
[ ] Sensitive data is masked correctly
[ ] Files are downloadable

Format Tests:
[ ] PDF file opens correctly
[ ] Excel file opens in Excel/Sheets
[ ] CSV file imports correctly
[ ] Word document opens properly
[ ] PowerPoint presentation displays correctly
```

---

## Step 9: Deployment

### 9.1 Pre-deployment checklist

```bash
# Run tests
npm test

# Build TypeScript
npm run build

# Check for errors
npm run lint

# Verify database migrations applied
npx prisma migrate deploy

# Check environment variables are set
echo $REPORT_STORAGE_PATH
echo $MAX_REPORT_SIZE
```

### 9.2 Deployment steps

1. **Backup database**:
```bash
pg_dump -U postgres maths_dashboard > backup.sql
```

2. **Apply migrations**:
```bash
npx prisma migrate deploy
```

3. **Start server**:
```bash
npm start  # or PM2/Docker depending on setup
```

4. **Verify endpoints**:
```bash
curl -H "Authorization: Bearer $TOKEN" http://your-domain/api/reports/history
```

### 9.3 Monitor deployment

- Check server logs for errors
- Monitor report generation performance
- Verify database connections are working
- Test report downloads from production

---

## Step 10: Performance Tuning

### 10.1 Optimize database queries

```typescript
// Add indexes to schema
model ReportHistory {
  // ...
  @@index([reportType])
  @@index([generatedAt])
  @@index([userId])
  @@index([departmentId])
}

model DownloadLog {
  // ...
  @@index([userId])
  @@index([reportType])
  @@index([downloadedAt])
}
```

### 10.2 Enable query caching

```typescript
// In reporting.service.ts
const cache = new Map<string, CachedReport>();

async function generateFacultyMasterReport(params) {
  const cacheKey = JSON.stringify(params);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  // Generate report...
  cache.set(cacheKey, result);
  return result;
}
```

### 10.3 Implement pagination for large reports

```typescript
// Limit initial query
const data = await prisma.faculty.findMany({
  take: 1000,
  skip: (page - 1) * 1000,
});
```

---

## Common Issues & Solutions

### Issue: "Cannot find module 'exceljs'"

**Solution**:
```bash
npm install exceljs --save
npm install @types/exceljs --save-dev
```

### Issue: "JWT verification failed"

**Solution**:
- Check token is included in Authorization header
- Verify JWT secret matches in .env
- Check token hasn't expired

### Issue: "Report generation timeout"

**Solution**:
- Increase REPORT_GENERATION_TIMEOUT in .env
- Optimize database queries (add indexes)
- Paginate large datasets

### Issue: "Files not downloading"

**Solution**:
- Check Content-Disposition header is set
- Verify MIME type is correct
- Check file exists in storage path

### Issue: "Permission denied on report"

**Solution**:
- Verify user role in database
- Check middleware is applying permissions
- Ensure token is valid

---

## Rollback Plan

If deployment fails:

```bash
# Rollback database migration
npx prisma migrate resolve --rolled-back add_reporting_engine

# Or manually restore from backup
psql -U postgres maths_dashboard < backup.sql

# Redeploy previous version
git checkout previous_commit
npm install
npm start
```

---

## Verification Checklist

After deployment, verify:

- [ ] All endpoints return 200 OK with valid token
- [ ] Report generation completes in < 5 seconds
- [ ] Files download without corruption
- [ ] All 5 formats (PDF, Excel, CSV, Word, PPT) work
- [ ] Sensitive data is masked
- [ ] Download logs are recorded
- [ ] Report history persists in database
- [ ] Permission checks work correctly
- [ ] Error messages are informative
- [ ] Performance is acceptable (< 100ms response time)

---

## Support Contacts

- Backend Issues: Check `logs/reporting-engine.log`
- Database Issues: Check Prisma logs with `DEBUG=prisma:* npm run dev`
- Frontend Issues: Check browser console and React DevTools

---

## Next Steps

1. **Implement remaining reports**: NAAC, UGC, AICTE, IQAC, Task reports
2. **Add report preview**: Modal with first 20 rows before generation
3. **Enable OneDrive storage**: Integrate with Microsoft Graph API
4. **Implement scheduled reports**: Cron jobs for automatic generation
5. **Add report sharing**: Public share links with expiration
6. **Create admin dashboard**: Download logs visualization

---

Last Updated: June 2024
Version: 1.0.0
