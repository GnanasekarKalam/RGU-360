// REPORTS-DOCUMENTATION.md
# Reports Module - Complete Documentation

## Overview

The Reports Module provides comprehensive report generation and export functionality for the Mathematics Dashboard system. It supports 9 different report types with multiple export formats (JSON, CSV, Excel, PDF).

---

## Table of Contents

1. [Setup](#setup)
2. [Report Types](#report-types)
3. [API Endpoints](#api-endpoints)
4. [Export Formats](#export-formats)
5. [Service Functions](#service-functions)
6. [Integration Examples](#integration-examples)
7. [Access Control](#access-control)
8. [Performance Tips](#performance-tips)
9. [Error Handling](#error-handling)

---

## Setup

### Installation

```bash
npm install uuid
# For Excel export (optional)
npm install exceljs
# For PDF export (optional)
npm install pdfkit
```

### Integration

Add to `src/index.ts`:

```typescript
import reportsRoutes from './routes/reports.routes';

app.use('/api/reports', reportsRoutes);
```

---

## Report Types

### 1. Faculty API Score Report

**Purpose**: Comprehensive faculty performance evaluation based on multiple metrics.

**Metrics Calculated**:
- Publications (20% weight)
- Research Projects (20% weight)
- FDP Hours (15% weight)
- PhD Students Supervised (15% weight)
- Consulting Work (10% weight)
- Teaching Load (10% weight)
- Accreditation Contributions (10% weight)

**Output**: API Score (0-100) and Grade (A-E)

**Example Response**:
```json
{
  "reportId": "RPT-1704067200000-ABC123",
  "reportType": "faculty_api_score",
  "faculty": {
    "id": "fac-123",
    "name": "Dr. John Smith",
    "employeeId": "FAC001",
    "department": "Mathematics",
    "specialization": "Algebra",
    "designation": "Associate Professor"
  },
  "metrics": {
    "publications": {
      "metricName": "Publications",
      "score": 8,
      "maxScore": 50,
      "weight": 0.2,
      "percentageScore": 16.0
    },
    ...
  },
  "overallAPIScore": 78,
  "apiGrade": "B",
  "trends": {
    "previousYear": 73,
    "currentYear": 78,
    "growthPercentage": 5
  }
}
```

---

### 2. Student Progress Report

**Purpose**: Track individual student's academic progress and performance.

**Includes**:
- Current semester and cumulative GPA
- Academic standing (GOOD, WARNING, PROBATION, SUSPENSION)
- Course performance
- Project status and progress
- Placement status
- Certifications and research work
- Assignment submission tracking
- Risk assessment with recommendations

**Risk Levels**:
- `CRITICAL`: GPA < 5.5 AND Attendance < 70%
- `HIGH`: GPA < 6.0 OR Attendance < 75%
- `MEDIUM`: GPA < 6.5 OR Attendance < 80%
- `LOW`: Good standing

**Example Response**:
```json
{
  "reportId": "RPT-1704067200000-XYZ789",
  "reportType": "student_progress",
  "student": {
    "id": "stu-456",
    "name": "Raj Kumar",
    "studentId": "2021001",
    "email": "raj@university.edu",
    "enrollmentStatus": "ENROLLED",
    "expectedGraduationDate": "2025-05-31"
  },
  "academicMetrics": {
    "currentSemesterGPA": 7.5,
    "cumulativeGPA": 7.2,
    "academicStanding": "GOOD",
    "creditsEarned": 90,
    "creditsRequired": 120,
    "creditsRemaining": 30,
    "completionPercentage": 75.0
  },
  "currentCourses": [
    {
      "subject": "Advanced Calculus",
      "courseCode": "MATH301",
      "credits": 4,
      "grade": "A",
      "score": 90
    }
  ],
  "riskAssessment": {
    "riskLevel": "LOW",
    "riskFactors": [],
    "interventions": [],
    "recommendedActions": ["Regular consultation with advisor"]
  }
}
```

---

### 3. Tutor Ward Report

**Purpose**: Provides tutors with overview of their assigned students' progress.

**Includes**:
- List of all wards (assigned students)
- Individual student status (name, GPA, academic standing)
- Students needing intervention
- Summary statistics by academic standing
- Intervention recommendations

**Example Response**:
```json
{
  "reportId": "RPT-1704067200000-TUT456",
  "reportType": "tutor_ward",
  "tutor": {
    "id": "fac-789",
    "name": "Dr. Jane Doe",
    "employeeId": "FAC002",
    "email": "jane@university.edu",
    "department": "Mathematics"
  },
  "academicYear": "2024-2025",
  "wardCount": 15,
  "wards": [
    {
      "studentId": "stu-001",
      "name": "Student Name",
      "email": "student@university.edu",
      "currentGPA": 7.5,
      "academicStanding": "GOOD",
      "lastCheckDate": "2024-01-15",
      "needsIntervention": false
    }
  ],
  "wardsSummary": {
    "excellentStanding": 5,
    "goodStanding": 8,
    "warningStanding": 2,
    "probationStanding": 0,
    "needingIntervention": 2
  },
  "interventionSummary": {
    "academicSupport": ["Additional coaching sessions"],
    "mentoring": ["Career guidance"],
    "counseling": ["Stress management"]
  }
}
```

---

### 4. Department Report

**Purpose**: Comprehensive departmental overview and analytics.

**Includes**:
- Department metrics (faculty, students, courses)
- Faculty performance analysis
- Student academic distribution
- Research and publications statistics
- Placement metrics
- Financial metrics
- Performance trends over time

**Example Response**:
```json
{
  "reportId": "RPT-1704067200000-DEPT001",
  "reportType": "department",
  "department": {
    "id": "dept-123",
    "name": "Mathematics",
    "code": "MATH",
    "headOfDepartment": "Dr. Head Name",
    "totalBudget": 500000
  },
  "metrics": {
    "totalFaculty": 25,
    "activeFaculty": 23,
    "totalStudents": 450,
    "enrolledStudents": 440,
    "totalCourses": 35,
    "averageFacultyScore": 75,
    "averageStudentGPA": 7.2,
    "placementRate": 85
  },
  "studentAnalysis": {
    "totalStudents": 440,
    "byAcademicStanding": {
      "GOOD": 380,
      "WARNING": 45,
      "PROBATION": 15
    },
    "averageGPA": 7.2,
    "studentsAtRisk": 20
  },
  "performanceMetrics": {
    "researchPublications": 45,
    "phdsProduced": 12,
    "studentPlacements": 374,
    "accreditationCompliance": 90
  },
  "trends": {
    "enrollmentTrend": [100, 105, 110, 115, 120],
    "placementTrend": [80, 82, 85, 87, 85],
    "academicPerformanceTrend": [6.5, 6.6, 6.7, 6.8, 6.75]
  }
}
```

---

### 5. NBA SAR Report

**Purpose**: Self-Assessment Report for NBA (National Board of Accreditation) compliance.

**Includes**:
- Program information and accreditation cycle
- Criterion-wise compliance status
- Evidence submission tracking
- Critical gaps identification
- Action plan with timelines
- Evidence summary

**Compliance Statuses**:
- `COMPLIANT`: All requirements met
- `PARTIALLY_COMPLIANT`: Some requirements met
- `NON_COMPLIANT`: Requirements not met
- `PENDING`: Under review

**Example Response**:
```json
{
  "reportId": "RPT-1704067200000-NBA001",
  "reportType": "nba_sar",
  "accreditationType": "NBA",
  "program": {
    "name": "Mathematics",
    "courseCode": "MATH",
    "level": "UG"
  },
  "criteria": [
    {
      "criteriaId": "1",
      "criteriaName": "Program Outcomes and Competencies",
      "complianceStatus": "COMPLIANT",
      "evidenceSubmitted": 8,
      "requiredEvidence": 8,
      "completionPercentage": 100,
      "documents": [
        {
          "fileName": "CO_Mapping.pdf",
          "uploadDate": "2024-01-15",
          "verificationStatus": "VERIFIED"
        }
      ]
    }
  ],
  "overallCompliance": 87,
  "criticalGaps": ["Advanced research facilities"],
  "actionPlan": [
    {
      "action": "Upgrade laboratory equipment",
      "targetDate": "2024-12-31",
      "responsibility": "Department Head"
    }
  ],
  "evidenceSummary": {
    "totalDocumentsSubmitted": 45,
    "documentsVerified": 42,
    "documentsRejected": 2,
    "pendingDocuments": 1
  }
}
```

---

### 6. NAAC Report

**Purpose**: Quality Assessment Report for NAAC (National Assessment and Accreditation Council).

**Includes**:
- Criterion-wise analysis and scoring
- Institutional strengths
- Areas for improvement
- Cumulative score and grade
- Implementation recommendations

**Grades**:
- `A++`: Excellence
- `A+`: Very Good
- `A`: Good
- `B++`: Satisfactory
- `B+`: Adequate
- `B`: Acceptable
- `C`: Below Average

---

### 7. AICTE Report

**Purpose**: Compliance report for AICTE (All India Council for Technical Education).

**Includes**:
- Faculty qualification compliance
- Infrastructure adequacy
- Academic curriculum compliance
- Laboratory and equipment status
- Action items for compliance
- Certification status and next audit date

---

## API Endpoints

### Faculty API Score Report

#### POST /api/reports/faculty-api-score
Generate Faculty API Score report.

**Permission**: ROLE_ADMIN, ROLE_HOD, ROLE_DIRECTOR

**Request Body**:
```json
{
  "facultyId": "fac-123",
  "exportFormat": "json" // Optional: json, csv, excel, pdf
}
```

**Response**:
```json
{
  "success": true,
  "message": "Faculty API Score report generated successfully",
  "data": { ... }
}
```

#### GET /api/reports/faculty-api-score/:facultyId
Get Faculty API Score report (JSON).

---

### Student Progress Report

#### POST /api/reports/student-progress
Generate Student Progress report.

**Permission**: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY, ROLE_STUDENT

**Request Body**:
```json
{
  "studentId": "stu-456",
  "exportFormat": "json"
}
```

#### GET /api/reports/student-progress/:studentId
Get Student Progress report (JSON).

---

### Tutor Ward Report

#### POST /api/reports/tutor-ward
Generate Tutor Ward report.

**Permission**: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY

**Request Body**:
```json
{
  "tutorId": "fac-789",
  "academicYear": "2024-2025",
  "exportFormat": "json"
}
```

#### GET /api/reports/tutor-ward/:tutorId/:academicYear
Get Tutor Ward report (JSON).

---

### Department Report

#### POST /api/reports/department
Generate Department report.

**Permission**: ROLE_ADMIN, ROLE_DIRECTOR, ROLE_HOD

**Request Body**:
```json
{
  "departmentId": "dept-123",
  "exportFormat": "json"
}
```

#### GET /api/reports/department/:departmentId
Get Department report (JSON).

---

### Accreditation Reports

#### NBA SAR Report
- **POST**: `/api/reports/nba-sar`
- **GET**: `/api/reports/nba-sar/:departmentId`
- **Permission**: ROLE_ADMIN, ROLE_DIRECTOR

#### NAAC Report
- **POST**: `/api/reports/naac`
- **GET**: `/api/reports/naac/:departmentId`
- **Permission**: ROLE_ADMIN, ROLE_DIRECTOR

#### AICTE Report
- **POST**: `/api/reports/aicte`
- **GET**: `/api/reports/aicte/:departmentId`
- **Permission**: ROLE_ADMIN, ROLE_DIRECTOR

---

## Export Formats

### JSON
Native JavaScript object format. Includes all data fields.

```bash
curl -X POST http://localhost:3000/api/reports/faculty-api-score \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"facultyId": "fac-123", "exportFormat": "json"}'
```

### CSV
Comma-separated values. Good for spreadsheet import.

```bash
curl -X POST http://localhost:3000/api/reports/student-progress \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentId": "stu-456", "exportFormat": "csv"}'
```

### Excel
Use `exceljs` library (optional). Formatted with styling and charts.

```typescript
// Future: With exceljs integration
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Report');
```

### PDF
Use `pdfkit` library (optional). Professional formatted reports.

```typescript
// Future: With pdfkit integration
const doc = new PDFDocument();
```

---

## Service Functions

All service functions are in `src/services/reports.service.ts`:

```typescript
// Faculty API Score
await ReportsService.generateFacultyAPIScoreReport(facultyId);

// Student Progress
await ReportsService.generateStudentProgressReport(studentId);

// Tutor Ward
await ReportsService.generateTutorWardReport(tutorId, academicYear);

// Department
await ReportsService.generateDepartmentReport(departmentId);

// Accreditation Reports
await ReportsService.generateNBASARReport(departmentId);
await ReportsService.generateNAACReport(departmentId);
await ReportsService.generateAICTEReport(departmentId);

// Export Functions
ReportsService.exportAsJSON(data);
ReportsService.exportAsCSV(data);

// History
await ReportsService.getReportHistory(userId, limit);
```

---

## Integration Examples

### Example 1: Faculty Performance Review

```typescript
// Generate and export faculty API score
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

const report = await response.json();
console.log(`Faculty Score: ${report.data.overallAPIScore}/${100}`);
```

### Example 2: Student Progress Monitoring

```typescript
// Get student progress report
const response = await fetch('/api/reports/student-progress/stu-456', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const report = await response.json();
if (report.data.riskAssessment.riskLevel === 'HIGH') {
  // Send intervention notification
  await sendNotification(studentId, 'Academic support needed');
}
```

### Example 3: Department Analytics

```typescript
// Generate comprehensive department report
const response = await fetch('/api/reports/department', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    departmentId: 'dept-123',
    exportFormat: 'json'
  })
});

const report = await response.json();
// Use data for dashboard visualization
```

---

## Access Control

### Faculty API Score Report
- **Can Generate**: HOD (for their faculty), Director, Admin
- **Can Access**: Own data (Faculty), HOD (their faculty), Director, Admin

### Student Progress Report
- **Can Generate**: Student (own), Advisor, HOD, Faculty, Admin
- **Can Access**: Own data (Student), Advisor, Tutors, HOD, Admin

### Tutor Ward Report
- **Can Generate**: Faculty (own wards), HOD, Admin
- **Can Access**: Own wards (Faculty), HOD, Admin

### Department Report
- **Can Generate**: HOD (own dept), Director, Admin
- **Can Access**: HOD (own dept), Director, Admin

### Accreditation Reports
- **Can Generate**: Director, Admin
- **Can Access**: Director, Admin

---

## Performance Tips

1. **Cache Generated Reports**: Store frequently generated reports for 24 hours
2. **Batch Generation**: Generate reports during off-peak hours
3. **Pagination**: For large exports, implement pagination
4. **Async Processing**: Generate large reports asynchronously
5. **Data Indexing**: Index commonly filtered fields in database

---

## Error Handling

### Common Errors

**400 Bad Request**
```json
{
  "success": false,
  "message": "Missing required field: facultyId"
}
```

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Faculty not found: fac-123"
}
```

**500 Server Error**
```json
{
  "success": false,
  "message": "Failed to generate Faculty API Score report"
}
```

---

## Future Enhancements

1. **Scheduled Reports**: Automatic report generation and email delivery
2. **Report Customization**: User-defined report templates
3. **Advanced Filtering**: More granular filtering options
4. **Excel/PDF Export**: Full formatting and styling
5. **Report Caching**: Store and retrieve previously generated reports
6. **Batch Operations**: Generate multiple reports simultaneously
7. **Report Signing**: Digital signatures for compliance
8. **Audit Trail**: Track who generated which reports and when
9. **Notifications**: Alert users when reports are ready
10. **Analytics Dashboard**: Visualize report data in dashboards

---

Last Updated: January 2024
