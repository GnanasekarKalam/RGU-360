// DASHBOARD-QUICK-START.md
# Dashboard Module - Quick Start Guide

## Installation & Setup (5 minutes)

### 1. Copy Files to Your Project

```bash
# Copy all files to your project
cp src/components/Dashboards/*.tsx your-project/src/components/Dashboards/
cp src/routes/dashboard.routes.ts your-project/src/routes/
cp src/services/dashboard.service.ts your-project/src/services/
# Type definitions already created at: src/types/dashboard.types.ts
```

### 2. Register Routes in Main App

**File: `src/index.ts`**

```typescript
import dashboardRoutes from './routes/dashboard.routes';

// Add this line where you register other routes
app.use('/api/dashboard', dashboardRoutes);
```

### 3. Verify Dependencies

Ensure you have these packages installed:
```bash
npm install antd recharts react react-dom
```

**Verified Compatibility**:
- antd: ^5.0.0
- recharts: ^2.5.0
- react: ^18.0.0
- typescript: ^4.9.0

---

## Five-Minute Usage

### HOD Dashboard

```typescript
import HODDashboard from './components/Dashboards/HODDashboard';
import { useState, useEffect } from 'react';

export function HODPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/hod', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <HODDashboard 
      data={data} 
      isLoading={loading}
      onRefresh={fetchDashboard}
    />
  );
}
```

### Management Dashboard

```typescript
import ManagementDashboard from './components/Dashboards/ManagementDashboard';

export function ManagementPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard/management', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const json = await res.json();
      setData(json.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ManagementDashboard 
      data={data} 
      isLoading={loading}
    />
  );
}
```

---

## API Endpoints Reference

### For HOD

| Endpoint | Method | Purpose | Query Params |
|----------|--------|---------|--------------|
| `/api/dashboard/hod` | GET | Full dashboard data | `departmentId`, `academicYear` |
| `/api/dashboard/hod/faculty-performance` | GET | Faculty metrics | `departmentId` |
| `/api/dashboard/hod/student-performance` | GET | Student metrics | `departmentId`, `academicYear` |
| `/api/dashboard/hod/risk-students` | GET | At-risk students | `departmentId` |
| `/api/dashboard/hod/research-metrics` | GET | Research stats | `departmentId` |
| `/api/dashboard/hod/publications` | GET | Publication stats | `departmentId` |
| `/api/dashboard/hod/fee-collection` | GET | Fee stats | `departmentId`, `academicYear` |

### For Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/dashboard/management` | GET | Full dashboard data |
| `/api/dashboard/management/kpis` | GET | Department KPIs |
| `/api/dashboard/management/rankings` | GET | Institution rankings |
| `/api/dashboard/management/accreditation` | GET | Accreditation status |
| `/api/dashboard/management/faculty-productivity` | GET | Faculty metrics |
| `/api/dashboard/management/student-progression` | GET | Student outcomes |

---

## Common Tasks

### Task 1: Display Faculty Performance Table

```typescript
// Inside HODPage or similar component
async function getFacultyMetrics() {
  const res = await fetch('/api/dashboard/hod/faculty-performance?departmentId=DEPT001', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await res.json();
  
  // data is array of FacultyPerformance objects
  console.log(data.map(f => ({
    name: f.name,
    performance: f.performanceScore,
    tasks: f.tasksCompleted,
    research: f.researchOutput
  })));
}
```

### Task 2: Identify At-Risk Students

```typescript
async function getAtRiskStudents() {
  const res = await fetch('/api/dashboard/hod/risk-students?departmentId=DEPT001', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await res.json();
  
  const critical = data.riskFactors.filter(s => s.riskLevel === 'CRITICAL');
  console.log(`Found ${critical.length} critical risk students`);
  critical.forEach(student => {
    console.log(`${student.name}: ${student.riskReasons.join(', ')}`);
  });
}
```

### Task 3: Check Fee Collection Status

```typescript
async function getFeeStatus() {
  const res = await fetch('/api/dashboard/hod/fee-collection?departmentId=DEPT001', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await res.json();
  
  console.log(`Collection Rate: ${data.collectionPercentage}%`);
  console.log(`Pending from ${data.feePending} students`);
}
```

### Task 4: Monitor Department Ranking

```typescript
async function checkDepartmentRanking() {
  const res = await fetch('/api/dashboard/management/kpis', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const { data } = await res.json();
  
  // Sort departments by performance
  const ranked = data.sort((a, b) => 
    b.avgFacultyPerformance - a.avgFacultyPerformance
  );
  
  ranked.forEach((dept, idx) => {
    console.log(`${idx + 1}. ${dept.departmentName}: ${dept.avgFacultyPerformance}%`);
  });
}
```

### Task 5: Export Dashboard Data

```typescript
async function exportDashboard(format = 'excel') {
  const endpoint = format === 'excel' 
    ? '/api/dashboard/export/hod-excel'
    : '/api/dashboard/export/management-pdf';
    
  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard_${Date.now()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
  a.click();
}
```

---

## Customization

### Change Dashboard Colors

**File: `src/components/Dashboards/DashboardStyles.css`**

```css
/* Change primary color */
.dashboard-container .ant-card-head {
  background: linear-gradient(135deg, #YOUR_COLOR 0%, #YOUR_COLOR2 100%);
}

/* Change KPI card style */
.kpi-card {
  background: YOUR_BACKGROUND_COLOR;
  border: YOUR_BORDER_STYLE;
}
```

### Customize Metrics Calculation

**File: `src/services/dashboard.service.ts`**

Example: Change performance score formula

```typescript
// Find this function: getFacultyPerformanceMetrics()
// Modify the scoring formula

const performanceScore = Math.min(
  // Your custom formula here
  ((completionRate * 0.4 + research * 6 + publications * 4) / 10) * 10,
  100
);
```

### Add Custom Chart

1. Create new component in `src/components/Dashboards/`
2. Import Recharts components needed
3. Pass data from dashboard service
4. Add to appropriate tab in dashboard

```typescript
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export function CustomChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Line type="monotone" dataKey="value" stroke="#1890ff" />
    </LineChart>
  );
}
```

---

## Troubleshooting

### Dashboard shows "No data"

**Step 1**: Check if data is being fetched
```typescript
// In browser console
fetch('/api/dashboard/hod', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log)
```

**Step 2**: Check database has required tables
```bash
npx prisma studio
# Verify tables: Faculty, Student, Task, etc. have data
```

**Step 3**: Check authentication token
```typescript
// Verify token is present and valid
console.log(localStorage.getItem('token'));
```

### Charts not rendering

**Solution**: Ensure data format is correct
```typescript
// Charts expect array of objects with numeric values
const validData = [
  { name: 'Jan', value: 100, category: 'A' },
  { name: 'Feb', value: 120, category: 'B' }
];
```

### Permission denied (403)

**Solution**: Check user role
```typescript
// User must have:
// - ROLE_HOD or ROLE_ADMIN for HOD dashboard
// - ROLE_DIRECTOR or ROLE_PRINCIPAL or ROLE_ADMIN for Management dashboard
```

---

## Performance Tips

### Tip 1: Implement Caching

```typescript
const cache = new Map();

async function getCachedDashboard() {
  const key = 'dashboard_hod';
  
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    // Use cache if less than 5 minutes old
    if (Date.now() - timestamp < 5 * 60 * 1000) {
      return data;
    }
  }
  
  const response = await fetch('/api/dashboard/hod', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const json = await response.json();
  cache.set(key, { data: json.data, timestamp: Date.now() });
  return json.data;
}
```

### Tip 2: Lazy Load Tabs

```typescript
const [activeTab, setActiveTab] = useState('overview');
const [loadedTabs, setLoadedTabs] = useState(['overview']);

useEffect(() => {
  if (!loadedTabs.includes(activeTab)) {
    // Load data for newly active tab
    fetchTabData(activeTab);
    setLoadedTabs([...loadedTabs, activeTab]);
  }
}, [activeTab]);
```

### Tip 3: Optimize Re-renders

```typescript
import { memo } from 'react';

const FacultyPerformanceTable = memo(({ data }) => {
  // Only re-renders if data changes
  return <Table columns={columns} dataSource={data} />;
});
```

---

## Database Schema Additions

If your Prisma schema doesn't have all required tables, add:

```prisma
model Task {
  taskId String @id @default(cuid())
  status String
  assignedToId String
  dueDate DateTime
  createdAt DateTime @default(now())
  @@index([assignedToId, status])
}

model Research {
  researchId String @id @default(cuid())
  facultyId String
  status String
  fundingAmount Int @default(0)
  @@index([facultyId, status])
}

model Publication {
  publicationId String @id @default(cuid())
  facultyId String
  publicationType String
  citations Int @default(0)
  @@index([facultyId])
}

// Add other models similarly
```

Run migration:
```bash
npx prisma migrate dev --name add_dashboard_tables
```

---

## Next Steps

1. **Integrate into Main App**: Add dashboard routes to your main Express app
2. **Add Navigation**: Create menu items to access HOD and Management dashboards
3. **Set Permissions**: Configure role-based access control
4. **Test with Data**: Add test data to database and verify dashboards display correctly
5. **Customize**: Adjust colors, metrics, and visualizations to match your requirements
6. **Deploy**: Push to production with proper environment variables

---

## Support Resources

- **Full Documentation**: See `DASHBOARD-DOCUMENTATION.md`
- **Type Definitions**: `src/types/dashboard.types.ts`
- **Component Code**: `src/components/Dashboards/`
- **Service Code**: `src/services/dashboard.service.ts`
- **API Routes**: `src/routes/dashboard.routes.ts`

---

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review `DASHBOARD-DOCUMENTATION.md` for detailed information
3. Check browser console for error messages
4. Verify database has required data
5. Confirm authentication token is valid

Last Updated: January 2024
