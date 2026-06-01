// DASHBOARD-DOCUMENTATION.md
# Premium Dashboards Module - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Service Layer](#service-layer)
5. [API Endpoints](#api-endpoints)
6. [Type Definitions](#type-definitions)
7. [Integration Guide](#integration-guide)
8. [Usage Examples](#usage-examples)
9. [Performance Considerations](#performance-considerations)

---

## Overview

The Dashboard Module provides comprehensive analytics and visualization capabilities for different user roles within the Mathematics Department management system.

### Key Features

- **HOD Dashboard**: Department-level analytics for Heads of Department
- **Management Dashboard**: Institution-level analytics for Directors/Principals
- **Real-time Metrics**: Live data aggregation from Task Management, Accreditation, Faculty, and Student modules
- **Interactive Visualizations**: Charts, tables, and KPI cards using Ant Design and Recharts
- **Export Capabilities**: Export data to Excel (HOD) and PDF (Management)
- **Role-based Access Control**: Different dashboards for different user roles
- **Responsive Design**: Mobile-friendly layout with CSS Grid and Flexbox

### Technology Stack

- **Frontend**: React 18 + TypeScript
- **Charts**: Recharts (line, bar, pie, area charts)
- **UI Components**: Ant Design 5.x
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **API Pattern**: RESTful with standardized response format

---

## Architecture

### Component Hierarchy

```
HODDashboard/ManagementDashboard (Main Container)
├── KPI Cards (Header Section)
├── Tabs Component
│   ├── Overview Tab
│   │   ├── Task Completion Chart
│   │   ├── Research Projects Chart
│   │   ├── FDP Metrics List
│   │   ├── Publication Statistics
│   │   ├── Fee Collection Card
│   │   └── PhD Status List
│   ├── Faculty Performance Tab
│   │   └── Faculty Performance Table
│   ├── Student Performance Tab
│   │   └── Student Performance Table
│   └── Risk Students Tab
│       ├── Risk Summary Cards
│       └── At-Risk Students List
└── Footer (Last Updated)
```

### Service Layer Architecture

```
Dashboard Service
├── HOD Dashboard Functions
│   ├── getHODDashboardData()
│   ├── getFacultyPerformanceMetrics()
│   ├── getStudentPerformanceMetrics()
│   ├── getResearchMetrics()
│   ├── getFDPMetrics()
│   ├── getPublicationMetrics()
│   ├── getPhDMetrics()
│   ├── getFeeCollectionStats()
│   ├── getTaskCompletionStats()
│   ├── getPendingApprovalsStats()
│   └── getRiskStudentsList()
└── Management Dashboard Functions
    ├── getManagementDashboardData()
    ├── getDepartmentKPIs()
    ├── getRankingMetrics()
    ├── getAccreditationReadiness()
    ├── getFacultyProductivityMetrics()
    └── getStudentProgressionMetrics()
```

---

## Components

### HODDashboard Component

**Location**: `src/components/Dashboards/HODDashboard.tsx`

**Purpose**: Main dashboard for Heads of Department with departmental metrics.

**Props**:
```typescript
interface HODDashboardProps {
  data: HODDashboardData;
  isLoading?: boolean;
  onRefresh?: () => void;
}
```

**Sections**:

1. **KPI Cards** (Header)
   - Faculty Performance Score (0-100)
   - Average Student CGPA
   - Task Completion Rate (%)
   - Pending Approvals Count

2. **Overview Tab**
   - Task Completion Pie Chart
   - Research Projects Status
   - FDP Program Metrics
   - Publication Statistics
   - Fee Collection Status
   - PhD Program Status

3. **Faculty Performance Tab**
   - Sortable/Filterable Table
   - Columns: Name, Tasks, Research, Publications, PhD Advisees, Performance Score, Status
   - Performance score displayed as circular progress

4. **Student Performance Tab**
   - Student Academic Data Table
   - Columns: Name, Enrollment ID, CGPA, Attendance, Risk Level
   - Risk level indicated by color-coded tags

5. **At-Risk Students Tab**
   - Risk Summary (Critical, High, Medium count)
   - Detailed list with risk factors
   - Grouped by risk level (worst first)

### ManagementDashboard Component

**Location**: `src/components/Dashboards/ManagementDashboard.tsx`

**Purpose**: Executive dashboard for Directors/Principals with institutional metrics.

**Props**:
```typescript
interface ManagementDashboardProps {
  data: ManagementDashboardData;
  isLoading?: boolean;
  onRefresh?: () => void;
}
```

**Sections**:

1. **Executive KPI Cards**
   - Total Departments
   - Total Faculty
   - Total Students
   - Average Placement Rate

2. **Rankings Card**
   - NIRF Ranking with Category
   - National Ranking
   - World Ranking

3. **Performance Scores Card**
   - Research Score
   - Teaching Score
   - Outreach Score
   - Infrastructure Score
   - Innovation Score

4. **Overview Tab**
   - Department Rankings by Performance
   - Faculty Research & Publication Summary
   - Faculty Productivity Bar Chart
   - Student Progression Area Chart

5. **Department KPIs Tab**
   - Sortable table with all department metrics
   - Faculty, Students, Performance, Placement, Research, Publications

6. **Accreditation Readiness Tab**
   - Accreditation status table
   - Completion percentage, criteria, evidence, risk level
   - Days until submission

7. **Student Progression Tab**
   - Year-wise student flow area chart
   - Placement details and statistics
   - Post-graduation outcomes

---

## Service Layer

### HOD Dashboard Service Functions

#### `getHODDashboardData(hodUserId, departmentId?, academicYear?, filters?)`

Fetches comprehensive HOD dashboard data with all metrics.

**Parameters**:
- `hodUserId` (string): Faculty ID of the HOD
- `departmentId` (string, optional): Department ID. If not provided, extracted from HOD's faculty record
- `academicYear` (string, optional): Academic year filter (e.g., "2023-24")
- `filters` (object, optional): Additional filter options

**Returns**: `HODDashboardData`

**Implementation**:
- Executes all metric fetching functions in parallel using Promise.all()
- Reduces database calls through efficient aggregation queries
- Includes proper error handling and fallback values

**Example**:
```typescript
const dashboardData = await getHODDashboardData('FAC001', 'DEPT001', '2023-24');
console.log(dashboardData.facultyPerformance); // Array of faculty metrics
```

#### `getFacultyPerformanceMetrics(departmentId)`

Gets performance scores for all faculty in a department.

**Metrics Calculated**:
- Tasks Completed / Total Tasks
- Research Projects Count
- Publications Count
- PhD Advisees Count
- Overall Performance Score (weighted formula)
- Status (GOOD/AVERAGE/NEEDS_IMPROVEMENT)

**Performance Score Formula**:
```
performanceScore = MIN(
  ((completionRate * 0.3 + research * 5 + publications * 3 + phdAdvisees * 2) / 10) * 10,
  100
)
```

#### `getStudentPerformanceMetrics(departmentId, academicYear?)`

Fetches student academic performance data.

**Metrics Calculated**:
- CGPA (average of all academic records)
- Attendance Percentage
- Risk Level (based on CGPA and attendance thresholds)

**Risk Level Thresholds**:
- CRITICAL: CGPA < 5.5 OR Attendance < 70%
- HIGH: CGPA < 6.0 OR Attendance < 75%
- MEDIUM: CGPA < 6.5 OR Attendance < 80%
- LOW: Otherwise

#### `getResearchMetrics(departmentId)`

Aggregates research project statistics.

**Metrics**:
- Active Projects (status: ONGOING)
- Completed Projects (status: COMPLETED)
- Total Funding Amount (sum of all project funding)

#### `getFDPMetrics(departmentId, academicYear?)`

Faculty Development Program statistics.

**Metrics**:
- Total FDP Programs
- Completed Programs
- Upcoming Programs
- Average Attendance Rate (%)
- Certificates Issued Count

#### `getPublicationMetrics(departmentId)`

Publication and research output statistics.

**Metrics by Type**:
- National Journals
- International Journals
- Conferences
- Books
- Patents
- Total Citations

#### `getPhDMetrics(departmentId)`

PhD program status per advisor.

**Metrics per Advisor**:
- Registered Students
- Ongoing Research
- Graduated Students
- Total PhD Students

#### `getFeeCollectionStats(departmentId, academicYear?)`

Financial statistics for fee collection.

**Metrics**:
- Collection Percentage
- Total Amount Collected
- Students with Paid Fees
- Students with Pending Fees
- Total Student Count

#### `getTaskCompletionStats(departmentId)`

Task management statistics.

**Metrics**:
- Completed Tasks
- Pending Tasks
- Overdue Tasks
- Total Tasks
- Completion Rate (%)

#### `getPendingApprovalsStats(departmentId)`

Approval workflow statistics.

**Metrics**:
- Total Pending Approvals
- Average Waiting Days (calculated from creation date)

#### `getRiskStudentsList(departmentId)`

Identifies and retrieves at-risk students.

**Risk Calculation**:
- Analyzes CGPA, Attendance, and other factors
- Provides risk reasons (Low CGPA, Low Attendance, etc.)
- Groups by severity level

---

### Management Dashboard Service Functions

#### `getManagementDashboardData(filters?)`

Executive-level comprehensive dashboard data.

**Returns**: `ManagementDashboardData`

#### `getDepartmentKPIs()`

Institution-wide department performance metrics.

**Metrics per Department**:
- Faculty Count
- Student Count
- Average Faculty Performance Score
- Average Student CGPA
- Placement Rate (%)
- Research Projects Count
- Publications Count

#### `getRankingMetrics()`

Institution ranking and scoring metrics.

**Metrics**:
- NIRF Ranking (with category)
- National Ranking
- World Ranking
- Component Scores:
  - Research Score
  - Teaching Score
  - Outreach Score
  - Infrastructure Score
  - Innovation Score

**Note**: Currently returns mock data. Should be connected to actual ranking database.

#### `getAccreditationReadiness()`

Accreditation compliance tracking.

**Metrics per Accreditation**:
- Type (NBA, NAAC, UGC, AICTE, IQAC)
- Status (REGISTERED, IN_PROGRESS, COMPLETED)
- Completion Percentage
- Criteria Completed / Total
- Evidence Submitted / Verified
- Days Until Submission
- Risk Level (LOW/MEDIUM/HIGH/CRITICAL)

#### `getFacultyProductivityMetrics()`

Institution-wide faculty productivity.

**Metrics**:
- Total Faculty Count
- Average Publications per Year
- Average Research Projects per Faculty
- PhD Advisors Count
- Average PhD Students per Advisor
- Total Consultancy Revenue
- Industry Collaborations Count

#### `getStudentProgressionMetrics()`

Student progression and placement data.

**Metrics**:
- Total Students
- Average CGPA (across all students)
- Placement Rate (%)
- Average Placement Package (LPA)
- Highest Package (LPA)
- Companies Visited Count
- Students Pursuing Higher Studies
- Student Entrepreneurs
- Topper CGPA
- Year-wise progression data

---

## API Endpoints

### Base URL
```
/api/dashboard
```

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### HOD Dashboard Endpoints

#### 1. Get Complete HOD Dashboard
```http
GET /api/dashboard/hod
Query Parameters:
  - departmentId (optional): Department ID
  - academicYear (optional): Academic year (e.g., "2023-24")

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "HOD Dashboard data retrieved successfully",
  "data": {
    "facultyPerformance": [...],
    "studentPerformance": [...],
    "researchMetrics": {...},
    "fdpMetrics": {...},
    "publicationMetrics": {...},
    "phdStatus": [...],
    "feeCollection": {...},
    "taskCompletion": {...},
    "pendingApprovals": {...},
    "riskStudents": {...},
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get Faculty Performance Metrics
```http
GET /api/dashboard/hod/faculty-performance
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Faculty performance metrics retrieved successfully",
  "data": [
    {
      "facultyId": "FAC001",
      "name": "Dr. John Smith",
      "email": "john@university.edu",
      "designation": "Associate Professor",
      "tasksCompleted": 25,
      "completionRate": 92,
      "researchOutput": 3,
      "publications": 5,
      "phdAdvisees": 2,
      "performanceScore": 85.5,
      "status": "GOOD"
    }
  ]
}
```

#### 3. Get Student Performance Metrics
```http
GET /api/dashboard/hod/student-performance
Query Parameters:
  - departmentId (optional): Department ID
  - academicYear (optional): Academic year

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Student performance metrics retrieved successfully",
  "data": [
    {
      "studentId": "STU001",
      "name": "Arjun Kumar",
      "enrollmentId": "2021001",
      "academicYear": 3,
      "cgpa": 7.8,
      "attendancePercentage": 92,
      "riskLevel": "LOW"
    }
  ]
}
```

#### 4. Get Research Metrics
```http
GET /api/dashboard/hod/research-metrics
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Research metrics retrieved successfully",
  "data": {
    "activeProjects": 8,
    "completedProjects": 12,
    "totalProjects": 20,
    "totalFunding": 5000000
  }
}
```

#### 5. Get Publication Statistics
```http
GET /api/dashboard/hod/publications
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Publication metrics retrieved successfully",
  "data": {
    "nationalJournals": 8,
    "internationalJournals": 12,
    "conferences": 15,
    "books": 2,
    "patents": 1,
    "totalPublications": 38,
    "totalCitations": 245
  }
}
```

#### 6. Get FDP Metrics
```http
GET /api/dashboard/hod/fdp-metrics
Query Parameters:
  - departmentId (optional): Department ID
  - academicYear (optional): Academic year

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "FDP metrics retrieved successfully",
  "data": {
    "totalFDP": 6,
    "completedFDP": 4,
    "upcomingFDP": 2,
    "attendanceRate": 88,
    "certificateIssuedCount": 24
  }
}
```

#### 7. Get PhD Status
```http
GET /api/dashboard/hod/phd-status
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "PhD status retrieved successfully",
  "data": [
    {
      "advisorId": "FAC001",
      "advisorName": "Dr. John Smith",
      "registered": 2,
      "ongoingResearch": 1,
      "graduated": 1,
      "totalPhDStudents": 4
    }
  ]
}
```

#### 8. Get Fee Collection Stats
```http
GET /api/dashboard/hod/fee-collection
Query Parameters:
  - departmentId (optional): Department ID
  - academicYear (optional): Academic year

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Fee collection stats retrieved successfully",
  "data": {
    "collectionPercentage": 92,
    "totalCollected": 1850000,
    "feePaid": 92,
    "feePending": 8,
    "totalStudents": 100
  }
}
```

#### 9. Get Task Completion Stats
```http
GET /api/dashboard/hod/task-completion
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Task completion stats retrieved successfully",
  "data": {
    "completedTasks": 125,
    "pendingTasks": 18,
    "overdueTasks": 5,
    "totalTasks": 148,
    "completionRate": 84
  }
}
```

#### 10. Get Pending Approvals
```http
GET /api/dashboard/hod/pending-approvals
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Pending approvals retrieved successfully",
  "data": {
    "totalPending": 12,
    "averageWaitingDays": 5
  }
}
```

#### 11. Get At-Risk Students
```http
GET /api/dashboard/hod/risk-students
Query Parameters:
  - departmentId (optional): Department ID

Permissions: ROLE_HOD, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Risk students list retrieved successfully",
  "data": {
    "riskFactors": [
      {
        "studentId": "STU045",
        "name": "Raj Patel",
        "enrollmentId": "2021045",
        "cgpa": 5.2,
        "attendance": 65,
        "riskLevel": "CRITICAL",
        "riskReasons": ["Low CGPA", "Low Attendance"]
      }
    ],
    "totalRiskStudents": 8,
    "criticalRisk": 2,
    "highRisk": 3,
    "mediumRisk": 3
  }
}
```

### Management Dashboard Endpoints

#### 1. Get Complete Management Dashboard
```http
GET /api/dashboard/management

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Management Dashboard data retrieved successfully",
  "data": {
    "departmentKPIs": [...],
    "rankingMetrics": {...},
    "accreditations": [...],
    "facultyProductivity": {...},
    "studentProgression": {...},
    "lastUpdated": "2024-01-15T10:30:00Z"
  }
}
```

#### 2. Get Department KPIs
```http
GET /api/dashboard/management/kpis

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Department KPIs retrieved successfully",
  "data": [
    {
      "departmentId": "DEPT001",
      "departmentName": "Mathematics",
      "facultyCount": 25,
      "studentCount": 150,
      "avgFacultyPerformance": 78,
      "avgStudentCGPA": 7.2,
      "placementRate": 92,
      "researchProjectsCount": 12,
      "publicationsCount": 28
    }
  ]
}
```

#### 3. Get Institution Rankings
```http
GET /api/dashboard/management/rankings

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Ranking metrics retrieved successfully",
  "data": {
    "nirf_ranking": "Tier 1",
    "nirf_category": "Overall",
    "nationalRanking": "42",
    "worldRanking": "3850",
    "researchScore": 78,
    "teachingScore": 82,
    "outreachScore": 76,
    "infrastructureScore": 81,
    "innovationScore": 79
  }
}
```

#### 4. Get Accreditation Readiness
```http
GET /api/dashboard/management/accreditation

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Accreditation readiness retrieved successfully",
  "data": [
    {
      "accreditationId": "ACC001",
      "accreditationType": "NBA",
      "currentStatus": "IN_PROGRESS",
      "completionPercentage": 75,
      "criteriaCompleted": 45,
      "criteriaTotal": 60,
      "evidenceSubmitted": 120,
      "evidenceVerified": 95,
      "daysUntilSubmission": 60,
      "riskLevel": "LOW"
    }
  ]
}
```

#### 5. Get Faculty Productivity Metrics
```http
GET /api/dashboard/management/faculty-productivity

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Faculty productivity metrics retrieved successfully",
  "data": {
    "totalFaculty": 180,
    "averagePublicationsPerYear": 2,
    "averageResearchProjectsPerFaculty": 1,
    "phdAdvisorsCount": 65,
    "totalPhDStudentsAdvisedPerFaculty": 3,
    "totalConsultancyRevenue": 12500000,
    "industryCollaborations": 45
  }
}
```

#### 6. Get Student Progression Metrics
```http
GET /api/dashboard/management/student-progression

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Student progression metrics retrieved successfully",
  "data": {
    "totalStudents": 1250,
    "avgCGPA": 7.1,
    "placementRate": 89,
    "avgPlacementPackage": 8.5,
    "highestPackage": 22.0,
    "companiesVisited": 85,
    "graduateStudies": 145,
    "entrepreneurship": 32,
    "topperCGPA": 9.8,
    "byYear": [
      {
        "year": 1,
        "totalEnrolled": 320,
        "passed": 310,
        "failed": 10,
        "passPercentage": 97
      }
    ]
  }
}
```

### Export Endpoints

#### 1. Export HOD Dashboard to Excel
```http
GET /api/dashboard/export/hod-excel

Permissions: ROLE_HOD, ROLE_ADMIN

Response: Excel file download (.xlsx)
```

#### 2. Export Management Dashboard to PDF
```http
GET /api/dashboard/export/management-pdf

Permissions: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response: PDF file download (.pdf)
```

### Notification Endpoints

#### 1. Subscribe to Dashboard Notifications
```http
POST /api/dashboard/subscribe-notifications
Content-Type: application/json

Body:
{
  "metrics": ["facultyPerformance", "studentPerformance", "riskStudents"],
  "frequency": "DAILY",
  "threshold": {
    "riskLevel": "HIGH",
    "performanceBelow": 60
  }
}

Permissions: ROLE_HOD, ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN

Response:
{
  "success": true,
  "message": "Notification subscription created",
  "data": {
    "subscriptionId": "sub_1705319400000",
    "metrics": ["facultyPerformance", "studentPerformance", "riskStudents"],
    "frequency": "DAILY",
    "threshold": {...}
  }
}
```

---

## Type Definitions

### HODDashboardData
```typescript
interface HODDashboardData {
  facultyPerformance: FacultyPerformance[];
  studentPerformance: StudentPerformance[];
  researchMetrics: ResearchMetrics;
  fdpMetrics: FDPMetrics;
  publicationMetrics: PublicationMetrics;
  phdStatus: PhDStatus[];
  feeCollection: FeeCollectionStats;
  taskCompletion: TaskCompletionStats;
  pendingApprovals: PendingApprovals;
  riskStudents: any;
  lastUpdated: Date;
}
```

### ManagementDashboardData
```typescript
interface ManagementDashboardData {
  departmentKPIs: DepartmentKPIs[];
  rankingMetrics: RankingMetrics;
  accreditations: AccreditationReadiness[];
  facultyProductivity: FacultyProductivity;
  studentProgression: StudentProgression;
  lastUpdated: Date;
}
```

See `src/types/dashboard.types.ts` for all type definitions.

---

## Integration Guide

### 1. Adding Dashboard Routes to Main Application

In `src/index.ts` or your main Express app file:

```typescript
import dashboardRoutes from './routes/dashboard.routes';

// Add to your app
app.use('/api/dashboard', dashboardRoutes);
```

### 2. Using HOD Dashboard Component

```typescript
import HODDashboard from './components/Dashboards/HODDashboard';
import { DashboardService } from './services/dashboard.service';

function HODPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/hod', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        setData(result.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchData();
  };

  return (
    <HODDashboard 
      data={data} 
      isLoading={loading} 
      onRefresh={handleRefresh} 
    />
  );
}
```

### 3. Using Management Dashboard Component

```typescript
import ManagementDashboard from './components/Dashboards/ManagementDashboard';

function ManagementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/management', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();
        setData(result.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ManagementDashboard 
      data={data} 
      isLoading={loading}
    />
  );
}
```

### 4. Database Requirements

Ensure the following tables exist in your database:
- Faculty
- Student
- Task
- Research
- Publication
- FDPProgram
- PhdStudent
- FeeTransaction
- Approval
- Accreditation
- PlacementRecord
- AcademicRecord

Run migrations if not already present:
```bash
npx prisma migrate dev
```

---

## Usage Examples

### Example 1: Fetching HOD Dashboard Data

```typescript
const axios = require('axios');

async function getHODDashboard() {
  try {
    const response = await axios.get('/api/dashboard/hod', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        departmentId: 'DEPT001',
        academicYear: '2023-24'
      }
    });

    console.log('Dashboard Data:', response.data.data);
    console.log('Faculty Count:', response.data.data.facultyPerformance.length);
    console.log('Risk Students:', response.data.data.riskStudents.totalRiskStudents);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
  }
}
```

### Example 2: Real-time Dashboard Updates

```typescript
function HODDashboardWithAutoRefresh() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    const response = await fetch('/api/dashboard/hod', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();
    setData(result.data);
  }

  return <HODDashboard data={data} onRefresh={fetchData} />;
}
```

### Example 3: Filtering Data

```typescript
// Get at-risk students with critical status only
const riskStudents = dashboardData.riskStudents.riskFactors.filter(
  student => student.riskLevel === 'CRITICAL'
);

// Get top-performing faculty
const topFaculty = dashboardData.facultyPerformance
  .filter(f => f.performanceScore >= 80)
  .sort((a, b) => b.performanceScore - a.performanceScore)
  .slice(0, 5);
```

### Example 4: Export Dashboard Data

```typescript
async function exportHODDashboard() {
  const response = await fetch('/api/dashboard/export/hod-excel', {
    headers: { 'Authorization': `Bearer ${token}` },
    method: 'GET'
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'hod_dashboard.xlsx';
  a.click();
}
```

---

## Performance Considerations

### 1. Database Query Optimization

- **Use Indexes**: Create indexes on frequently queried columns:
  ```prisma
  model Faculty {
    @@index([departmentId])
    @@index([status])
  }

  model Student {
    @@index([departmentId])
    @@index([academicYear])
  }
  ```

- **Caching**: Consider implementing Redis caching for dashboard data
  ```typescript
  const cacheKey = `dashboard:hod:${hodUserId}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const data = await getHODDashboardData(...);
  await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1 hour TTL
  ```

### 2. Frontend Optimization

- **Lazy Loading**: Load tab content on demand
- **Virtual Scrolling**: For large tables (use react-window)
- **Code Splitting**: Load dashboard components separately

### 3. API Response Optimization

- **Pagination**: For large lists, implement cursor-based pagination
- **Selective Fields**: Allow clients to request only needed fields
- **Compression**: Enable gzip compression for API responses

### 4. Data Refresh Strategy

- **Configurable Intervals**: Allow users to set refresh frequency
- **Incremental Updates**: Only fetch changed data
- **Background Refresh**: Update data in the background without blocking UI

---

## Troubleshooting

### Issue: Dashboard showing no data
**Solution**: Ensure all prerequisite database tables are created and populated with data.

### Issue: Slow dashboard loading
**Solution**: 
1. Add database indexes on frequently queried columns
2. Implement caching for dashboard data
3. Optimize query performance using Prisma query analysis

### Issue: Permission denied errors
**Solution**: Verify user roles and permissions in auth middleware.

### Issue: Chart rendering issues
**Solution**: Ensure data is in correct format (e.g., numeric values for charts).

---

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live metric updates
2. **Custom Dashboards**: Allow users to customize dashboard widgets
3. **Advanced Analytics**: Machine learning for predictive analytics
4. **Mobile App**: Native mobile dashboard application
5. **Report Scheduling**: Automated report generation and distribution
6. **Data Visualization**: More interactive and advanced charts
7. **Audit Logging**: Track all dashboard access and modifications

---

## Support

For questions or issues, contact the development team or refer to the main project documentation.

Last Updated: January 2024
