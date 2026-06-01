// REPORTS-QUICK-START.md
# Reports Module - Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install uuid
# Optional: For Excel export
npm install exceljs
# Optional: For PDF export
npm install pdfkit
```

### 2. Register Routes

Add to `src/index.ts`:

```typescript
import reportsRoutes from './routes/reports.routes';

app.use('/api/reports', reportsRoutes);
```

### 3. Verify Installation

```bash
curl http://localhost:3000/api/reports/health
# Expected: {"success": true, "message": "Reports service is running"}
```

---

## Common Use Cases

### 1. Generate Faculty API Score Report

```typescript
const response = await fetch('/api/reports/faculty-api-score', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    facultyId: 'fac-123',
    exportFormat: 'json'
  })
});

const { data } = await response.json();
console.log(`API Score: ${data.overallAPIScore}`);
console.log(`Grade: ${data.apiGrade}`);
```

### 2. Get Student Progress Report

```typescript
const response = await fetch('/api/reports/student-progress/stu-456', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { data } = await response.json();
console.log(`GPA: ${data.academicMetrics.currentSemesterGPA}`);
console.log(`Risk Level: ${data.riskAssessment.riskLevel}`);
```

### 3. Generate Tutor Ward Report

```typescript
const response = await fetch('/api/reports/tutor-ward', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    tutorId: 'fac-789',
    academicYear: '2024-2025'
  })
});

const { data } = await response.json();
console.log(`Wards: ${data.wardCount}`);
console.log(`Needing Intervention: ${data.wardsSummary.needingIntervention}`);
```

### 4. Department Analytics Report

```typescript
const response = await fetch('/api/reports/department', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    departmentId: 'dept-123'
  })
});

const { data } = await response.json();
console.log(`Placement Rate: ${data.metrics.placementRate}%`);
console.log(`Average GPA: ${data.studentAnalysis.averageGPA}`);
```

### 5. NBA Accreditation Report

```typescript
const response = await fetch('/api/reports/nba-sar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    departmentId: 'dept-123',
    exportFormat: 'csv'
  })
});

// Response: CSV file for import into accreditation system
```

---

## API Endpoints Quick Reference

### Faculty Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/faculty-api-score` | POST | Generate Faculty API Score |
| `/faculty-api-score/:id` | GET | Get Faculty API Score (JSON) |

### Student Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/student-progress` | POST | Generate Student Progress |
| `/student-progress/:id` | GET | Get Student Progress (JSON) |

### Tutor Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/tutor-ward` | POST | Generate Tutor Ward Report |
| `/tutor-ward/:id/:year` | GET | Get Tutor Ward Report (JSON) |

### Department Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/department` | POST | Generate Department Report |
| `/department/:id` | GET | Get Department Report (JSON) |

### Accreditation Reports
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/nba-sar` | POST/GET | NBA SAR Report |
| `/naac` | POST/GET | NAAC Report |
| `/aicte` | POST/GET | AICTE Report |

---

## Export Formats

### JSON (Default)
```bash
curl -X POST http://localhost:3000/api/reports/faculty-api-score \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facultyId": "fac-123", "exportFormat": "json"}'
```

### CSV
```bash
curl -X POST http://localhost:3000/api/reports/student-progress \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "stu-456", "exportFormat": "csv"}' \
  -o report.csv
```

---

## React Component Example

### FacultyScoreReport Component

```typescript
import { useState } from 'react';
import { Card, Statistic, Button, message } from 'antd';

export function FacultyScoreReport({ facultyId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/reports/faculty-api-score', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ facultyId })
      });

      const result = await response.json();
      if (result.success) {
        setReport(result.data);
        message.success('Report generated successfully');
      }
    } catch (error) {
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button onClick={generateReport} loading={loading}>
        Generate Report
      </Button>

      {report && (
        <Card>
          <Statistic
            title="API Score"
            value={report.overallAPIScore}
            suffix="/100"
          />
          <Statistic
            title="Grade"
            value={report.apiGrade}
          />
          
          <h3>Metrics Breakdown</h3>
          <ul>
            <li>Publications: {report.metrics.publications.score}</li>
            <li>PhD Students: {report.metrics.phdStudents.score}</li>
            <li>FDP Hours: {report.metrics.fdhours.score}</li>
          </ul>
        </Card>
      )}
    </div>
  );
}
```

### StudentProgressReport Component

```typescript
import { useState, useEffect } from 'react';
import { Card, Progress, Alert, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export function StudentProgressReport({ studentId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [studentId]);

  const fetchReport = async () => {
    try {
      const response = await fetch(`/api/reports/student-progress/${studentId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();
      setReport(result.data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const { academicMetrics, riskAssessment } = report;

  return (
    <Card title="Student Progress Report">
      {riskAssessment.riskLevel !== 'LOW' && (
        <Alert
          type={
            riskAssessment.riskLevel === 'CRITICAL'
              ? 'error'
              : riskAssessment.riskLevel === 'HIGH'
              ? 'warning'
              : 'info'
          }
          message={`Risk Level: ${riskAssessment.riskLevel}`}
          description={riskAssessment.riskFactors.join(', ')}
          style={{ marginBottom: 20 }}
        />
      )}

      <div>
        <strong>Current GPA:</strong> {academicMetrics.currentSemesterGPA}
        <Progress
          percent={academicMetrics.completionPercentage}
          status={academicMetrics.completionPercentage === 100 ? 'success' : 'active'}
        />
      </div>

      <Button icon={<DownloadOutlined />}>Export as CSV</Button>
    </Card>
  );
}
```

---

## Permission Requirements

### Faculty API Score Report
- **Generate**: ROLE_ADMIN, ROLE_HOD, ROLE_DIRECTOR
- **View**: Self (Faculty), HOD, Director, Admin

### Student Progress Report
- **Generate**: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY, ROLE_STUDENT
- **View**: Self (Student), Advisor, Tutor, HOD, Admin

### Tutor Ward Report
- **Generate**: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY
- **View**: Self (Faculty), HOD, Admin

### Department Report
- **Generate**: ROLE_ADMIN, ROLE_DIRECTOR, ROLE_HOD
- **View**: Department Head, Director, Admin

### Accreditation Reports
- **Generate**: ROLE_ADMIN, ROLE_DIRECTOR
- **View**: Director, Admin

---

## Troubleshooting

### Issue: "401 Unauthorized"
**Solution**: Ensure JWT token is valid
```bash
# Check token
echo $TOKEN
# Regenerate if needed
```

### Issue: "403 Forbidden"
**Solution**: Verify user role has required permission
```bash
# Check user role in database
SELECT role_name FROM user_roles WHERE user_id = 'your-id';
```

### Issue: "404 Not Found"
**Solution**: Verify ID exists in database
```bash
# Check faculty exists
SELECT * FROM faculties WHERE id = 'fac-123';
```

### Issue: "Reports service not running"
**Solution**: Verify routes are registered
```bash
# Check if endpoint responds
curl http://localhost:3000/api/reports/health
```

---

## Performance Optimization

### 1. Cache Reports (24-hour TTL)
```typescript
const cache = new Map();

async function getCachedReport(key) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return data;
    }
  }
  // Generate and cache
}
```

### 2. Batch Report Generation
```typescript
async function generateBatchReports(reportIds) {
  return Promise.all(
    reportIds.map(id => generateReport(id))
  );
}
```

### 3. Async Report Processing
```typescript
// Generate in background job
queue.add('generateReport', { facultyId }, { delay: 1000 });
```

---

## Next Steps

1. **Test Each Report Type**: Generate sample reports for validation
2. **Set Up Caching**: Implement report caching for performance
3. **Configure Email**: Add automatic report delivery
4. **Create Dashboards**: Visualize report data
5. **Schedule Reports**: Implement recurring report generation
6. **Add Analytics**: Track report usage and metrics
7. **Implement Signing**: Add digital signatures for compliance
8. **Backup Strategy**: Ensure reports are backed up

---

## Files Reference

- **Service**: `src/services/reports.service.ts` (700+ lines)
- **Routes**: `src/routes/reports.routes.ts` (400+ lines)
- **Types**: `src/types/reports.types.ts` (600+ lines)
- **Documentation**: `REPORTS-DOCUMENTATION.md` (1000+ lines)
- **Quick Start**: `REPORTS-QUICK-START.md` (This file)

---

## Support

For issues or questions, refer to:
1. Full documentation: `REPORTS-DOCUMENTATION.md`
2. API reference: Endpoint descriptions in routes
3. Type definitions: `src/types/reports.types.ts`
4. Service functions: `src/services/reports.service.ts`

---

Last Updated: January 2024
