// TASK-MANAGEMENT-QUICK-START.md
# Task Management Module - Quick Start Guide

## 🚀 Quick Overview

Complete enterprise task management system with:
- Task creation, assignment, approval workflows
- Evidence submission and verification
- Escalation matrix configuration
- Real-time notifications
- Comprehensive analytics and reporting
- Kanban-style task board

---

## 📋 File Locations

```
Backend:
- src/services/task-management.service.ts       (25+ functions)
- src/routes/task-management.routes.ts          (30+ endpoints)
- src/services/task-reports.service.ts          (4 report types)

Frontend:
- src/components/TaskManagement/TaskBoard.tsx            (Kanban board)
- src/components/TaskManagement/TaskForm.tsx            (Create/Edit)
- src/components/TaskManagement/TaskDashboard.tsx       (Analytics)
- src/components/TaskManagement/TaskAssignment.tsx      (Assignments)
- src/components/TaskManagement/TaskApproval.tsx        (Approvals)
- src/components/TaskManagement/EvidenceUpload.tsx      (Evidence)
- src/components/TaskManagement/TaskNotificationCenter.tsx (Notifications)
- src/components/TaskManagement/index.ts                (Exports)

Database:
- prisma/schema.prisma                          (11 models)

Documentation:
- TASK-MANAGEMENT-DOCUMENTATION.md              (Comprehensive)
- TASK-MANAGEMENT-COMPLETE-SUMMARY.md          (Overview)
```

---

## 🔧 Setup Instructions

### 1. Database Setup

```bash
# Add models to prisma/schema.prisma (already done)
# Run migration
npx prisma migrate dev --name add_task_management

# Seed data (if needed)
npx prisma db seed
```

### 2. Backend Routes Registration

Add to your main app file (e.g., `src/index.ts`):

```typescript
import taskRoutes from './routes/task-management.routes';

// Mount routes
app.use('/api/tasks', taskRoutes);
```

### 3. Frontend Component Integration

```typescript
import {
  TaskBoard,
  TaskDashboard,
  TaskForm,
  TaskAssignment,
  TaskApproval,
  EvidenceUpload,
  TaskNotificationCenter,
} from '@/components/TaskManagement';

// Use in your pages
<TaskDashboard stats={stats} recentTasks={tasks} />
<TaskBoard tasks={tasks} onTaskClick={handleClick} />
```

---

## 🎯 Common API Examples

### Create Task
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Quarterly Report",
    "description": "Prepare quarterly performance",
    "taskType": "ACADEMIC",
    "priority": "HIGH",
    "dueDate": "2026-06-30",
    "requiresApproval": true
  }'
```

### Assign Task
```bash
curl -X POST http://localhost:3000/api/tasks/<taskId>/assign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedToId": "<userId>",
    "assignedToType": "FACULTY"
  }'
```

### Get My Tasks
```bash
curl http://localhost:3000/api/my-tasks \
  -H "Authorization: Bearer <token>"
```

### Submit Evidence
```bash
curl -X POST http://localhost:3000/api/tasks/<taskId>/evidence \
  -H "Authorization: Bearer <token>" \
  -F "title=Report" \
  -F "evidenceType=FILE" \
  -F "file=@report.pdf"
```

### Approve Task
```bash
curl -X POST http://localhost:3000/api/approvals/<approvalId>/approve \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "approvalStatus": "APPROVED",
    "approvalComments": "Looks good"
  }'
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/api/tasks/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

### Generate Report
```typescript
import { generateTaskCompletionReport } from '@/services/task-reports.service';

const report = await generateTaskCompletionReport({
  fromDate: new Date('2026-06-01'),
  toDate: new Date('2026-06-30'),
  taskType: 'ACADEMIC'
});
```

---

## 📊 Database Models

### Task Status Flow
```
PENDING → ASSIGNED → IN_PROGRESS → COMPLETED
         ↘          ↙
          ON_HOLD
          
CANCELLED (any time)
```

### Approval Status Flow
```
PENDING → APPROVED
       ↘
        REJECTED
```

### Assignment Status Flow
```
PENDING → ACCEPTED → IN_PROGRESS → COMPLETED
       ↘
        REJECTED
```

---

## 🔐 Permissions Matrix

| Action | Super Admin | Admin | HOD | Faculty | Student |
|--------|-------------|-------|-----|---------|---------|
| Create Task | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Task | ✓ | ✓ | ✓ | ✗ | ✗ |
| Approve Task | ✓ | ✓ | ✓ | ✗ | ✗ |
| Submit Evidence | ✓ | ✓ | ✓ | ✓ | ✓ |
| Escalate | ✓ | ✓ | ✓ | ✓ | ✗ |
| View All Tasks | ✓ | ✓ | ✓ | ✗ | ✗ |
| View My Tasks | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## 💡 Component Usage Examples

### TaskBoard
```typescript
import { TaskBoard } from '@/components/TaskManagement';

<TaskBoard
  tasks={tasks}
  onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
  onStatusChange={(taskId, newStatus) => updateTaskStatus(taskId, newStatus)}
/>
```

### TaskForm
```typescript
import { TaskForm } from '@/components/TaskManagement';

<TaskForm
  onSubmit={async (data) => {
    const response = await apiClient.post('/tasks', data);
    message.success('Task created');
  }}
  onCancel={() => setModalVisible(false)}
/>
```

### TaskDashboard
```typescript
import { TaskDashboard } from '@/components/TaskManagement';

const [stats, setStats] = useState(null);

useEffect(() => {
  apiClient.get('/tasks/dashboard/stats')
    .then(res => setStats(res.data.stats));
}, []);

<TaskDashboard
  stats={stats}
  recentTasks={tasks}
  onTaskClick={(taskId) => navigate(`/tasks/${taskId}`)}
/>
```

### TaskNotificationCenter
```typescript
import { TaskNotificationCenter } from '@/components/TaskManagement';

<TaskNotificationCenter
  notifications={notifications}
  onMarkRead={(notificationId) => markAsRead(notificationId)}
  onNotificationClick={(notification) => handleNotification(notification)}
/>
```

---

## 🔄 Workflow Examples

### Complete Task Assignment Flow

1. **Create Task** (HOD)
   ```typescript
   POST /api/tasks
   { title, description, priority, dueDate, requiresApproval: true }
   ```

2. **Assign to Faculty** (HOD)
   ```typescript
   POST /api/tasks/{taskId}/assign
   { assignedToId: facultyId, assignedToType: 'FACULTY' }
   ```

3. **Faculty Accepts & Works**
   ```typescript
   PUT /api/tasks/assignments/{assignmentId}
   { assignmentStatus: 'IN_PROGRESS', progressPercentage: 50 }
   ```

4. **Submit Evidence** (Faculty)
   ```typescript
   POST /api/tasks/{taskId}/evidence
   { title, evidenceType: 'FILE', file: blob }
   ```

5. **Verify Evidence** (HOD)
   ```typescript
   POST /api/evidence/{evidenceId}/verify
   { isVerified: true, comments: 'Verified' }
   ```

6. **Create Approval Request** (System)
   ```typescript
   POST /api/tasks/{taskId}/approval
   { approverUserId: adminId }
   ```

7. **Approve Task** (Admin)
   ```typescript
   POST /api/approvals/{approvalId}/approve
   { approvalStatus: 'APPROVED', approvalComments: 'OK' }
   ```

---

## 📈 Reporting

### Generate Reports
```typescript
import {
  generateTaskCompletionReport,
  generateEscalationReport,
  generateApprovalReport,
  generatePerformanceReport,
  exportReportToCSV
} from '@/services/task-reports.service';

// Get completion report
const report = await generateTaskCompletionReport({
  fromDate: new Date('2026-06-01'),
  toDate: new Date('2026-06-30')
});

// Export to CSV
const csv = exportReportToCSV(report, 'completion');
```

### Available Reports
- **Task Completion**: Overall metrics, status breakdown, creator performance
- **Escalation**: Escalation analysis, top escalators, bottlenecks
- **Approval**: Approval workflow analysis, average approval time
- **Performance**: User performance, top performers, needs support

---

## 🎨 Frontend Pages Template

### Tasks Page
```typescript
import { TaskBoard, TaskForm, TaskDashboard } from '@/components/TaskManagement';

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedTab, setSelectedTab] = useState('board');

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Task Management</h1>
      <Tabs activeKey={selectedTab} onChange={setSelectedTab}>
        <TabPane tab="Dashboard" key="dashboard">
          <TaskDashboard stats={stats} recentTasks={tasks} />
        </TabPane>
        <TabPane tab="Board" key="board">
          <TaskBoard tasks={tasks} onTaskClick={handleTaskClick} />
        </TabPane>
        <TabPane tab="Create" key="create">
          <TaskForm onSubmit={handleCreateTask} />
        </TabPane>
      </Tabs>
    </div>
  );
}
```

### Task Detail Page
```typescript
import {
  TaskApproval,
  EvidenceUpload,
  TaskAssignment
} from '@/components/TaskManagement';

export function TaskDetailPage({ taskId }) {
  const [task, setTask] = useState(null);

  useEffect(() => {
    fetchTask(taskId);
  }, [taskId]);

  return (
    <div>
      <h2>{task?.title}</h2>
      
      <Tabs>
        <TabPane tab="Details" key="details">
          {/* Task details */}
        </TabPane>
        
        <TabPane tab="Assignments" key="assignments">
          <TaskAssignment
            taskId={taskId}
            existingAssignments={task?.assignments}
            onAssign={handleAssign}
          />
        </TabPane>
        
        <TabPane tab="Evidence" key="evidence">
          <EvidenceUpload
            taskId={taskId}
            existingEvidence={task?.evidence}
            onSubmit={handleSubmitEvidence}
          />
        </TabPane>
        
        <TabPane tab="Approval" key="approval">
          <TaskApproval
            taskId={taskId}
            approvals={task?.approvals}
            onApprove={handleApprove}
          />
        </TabPane>
      </Tabs>
    </div>
  );
}
```

---

## 🚨 Error Handling

All API responses follow this format:

```json
{
  "success": true/false,
  "message": "Success or error message",
  "data": { /* response data */ },
  "code": "ERROR_CODE"
}
```

Handle errors:
```typescript
try {
  const response = await apiClient.post('/tasks', data);
  if (!response.data.success) {
    message.error(response.data.message);
  }
} catch (error) {
  message.error('Network error');
}
```

---

## 🔍 Debugging

Enable debug mode:
```typescript
// In .env
DEBUG_TASK_MANAGEMENT=true

// In code
if (process.env.DEBUG_TASK_MANAGEMENT) {
  console.log('Task Debug:', data);
}
```

Check logs:
```bash
# View API logs
tail -f logs/api.log

# View database queries
# Enable Prisma logging in .env
DATABASE_URL="postgresql://...?log=query"
```

---

## 📚 Additional Resources

- **Full Documentation**: See `TASK-MANAGEMENT-DOCUMENTATION.md`
- **Implementation Summary**: See `TASK-MANAGEMENT-COMPLETE-SUMMARY.md`
- **Database Schema**: See `prisma/schema.prisma`
- **Service Functions**: See `src/services/task-management.service.ts`
- **API Endpoints**: See `src/routes/task-management.routes.ts`

---

## ✅ Pre-deployment Checklist

- [ ] Database migrations run
- [ ] Routes mounted in main app
- [ ] Components imported correctly
- [ ] Authentication middleware active
- [ ] Permissions configured
- [ ] Environment variables set
- [ ] Error handling tested
- [ ] API endpoints verified
- [ ] Frontend components rendering
- [ ] Notifications working
- [ ] Reports generating

---

## 🆘 Common Issues & Solutions

**Issue**: Notifications not appearing
- Check notification service is running
- Verify WebSocket connection
- Check database notifications table

**Issue**: Escalation not using matrix
- Verify TaskEscalationMatrix records exist
- Check task type and priority match
- Review escalation level configuration

**Issue**: File uploads failing
- Check file size limits
- Verify storage service connection
- Check file type restrictions

**Issue**: Approval not appearing
- Verify approver role/permissions
- Check task requiresApproval flag
- Verify approver user exists

---

## 📞 Support

For issues or questions:
1. Check documentation: `TASK-MANAGEMENT-DOCUMENTATION.md`
2. Review service implementation: `src/services/task-management.service.ts`
3. Check API routes: `src/routes/task-management.routes.ts`
4. Review component code: `src/components/TaskManagement/`

---

**Last Updated**: June 1, 2026  
**Version**: 1.0  
**Status**: Production Ready ✅
