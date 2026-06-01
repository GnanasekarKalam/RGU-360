// TASK-MANAGEMENT-DOCUMENTATION.md
# Enterprise Task Management Module - Complete Documentation

## Overview

The Task Management module provides a comprehensive enterprise-level system for creating, assigning, tracking, and approving tasks across the organization. It supports multi-level approval workflows, evidence submission, escalation matrices, and real-time notifications.

## Architecture

### Key Components

1. **Database Models** (Prisma)
   - `Task`: Core task entity with status, priority, deadlines
   - `TaskAssignment`: Individual task assignments to users
   - `TaskGroup`: Group-based task assignments
   - `TaskGroupMember`: Members within task groups
   - `TaskGroupAssignment`: Task assignments to groups
   - `TaskApproval`: Multi-level approval workflow tracking
   - `TaskEvidence`: Evidence/proof of work submission
   - `TaskComment`: Task discussions and comments
   - `TaskNotification`: Event notifications
   - `TaskEscalation`: Escalation tracking with matrix configuration
   - `TaskEscalationMatrix`: Configurable escalation rules

2. **Service Layer**
   - `task-management.service.ts`: Core business logic (16+ functions)
   - `task-reports.service.ts`: Analytics and reporting

3. **API Routes**
   - `task-management.routes.ts`: 30+ REST endpoints

4. **Frontend Components**
   - `TaskBoard.tsx`: Kanban-style task board
   - `TaskForm.tsx`: Task creation/editing form
   - `TaskDashboard.tsx`: Analytics dashboard
   - `TaskAssignment.tsx`: Assignment management
   - `TaskApproval.tsx`: Approval workflow UI
   - `EvidenceUpload.tsx`: Evidence submission interface
   - `TaskNotificationCenter.tsx`: Real-time notifications

---

## Database Models

### Task Model

```prisma
model Task {
  id                  String
  title              String
  description        String
  taskType           String       // GENERAL, ACADEMIC, ADMINISTRATIVE, RESEARCH
  priority           String       // LOW, MEDIUM, HIGH, URGENT
  status             String       // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, ON_HOLD, CANCELLED
  dueDate            DateTime
  progressPercentage Int          // 0-100
  requiresApproval   Boolean
  approvalStatus     String       // PENDING, APPROVED, REJECTED
  isEscalated        Boolean
  escalationLevel    Int
  category           String
  tags               String[]
  createdAt          DateTime
  completionDate     DateTime?
  createdById        String
  createdBy          User
  assignments        TaskAssignment[]
  groupAssignments   TaskGroupAssignment[]
  approvals          TaskApproval[]
  evidence           TaskEvidence[]
  comments           TaskComment[]
  notifications      TaskNotification[]
  escalations        TaskEscalation[]
}
```

### TaskAssignment Model

```prisma
model TaskAssignment {
  id                  String
  taskId              String
  task                Task
  assignedToId        String
  assignedTo          User
  assignedToType      String       // FACULTY, STUDENT, GROUP
  individualDueDate   DateTime?
  assignmentStatus    String       // PENDING, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED
  acceptanceStatus    String
  progressPercentage  Int
  progressNotes       String?
  createdAt           DateTime
  updatedAt           DateTime
}
```

### TaskApproval Model

```prisma
model TaskApproval {
  id                 String
  taskId             String
  task               Task
  approverUserId     String
  approver           User
  approvalType       String       // MANUAL, AUTOMATIC
  approvalStatus     String       // PENDING, APPROVED, REJECTED
  approvalComments   String?
  createdAt          DateTime
  approvedAt         DateTime?
}
```

### TaskEvidence Model

```prisma
model TaskEvidence {
  id                    String
  taskId                String
  task                  Task
  submittedById         String
  submittedBy           User
  title                 String
  description           String
  evidenceType          String       // FILE, URL, TEXT, IMAGE, VIDEO, LINK
  fileUrl               String?
  externalLink          String?
  textContent           String?
  isVerified            Boolean
  verifiedById          String?
  verifier              User?
  verificationComments  String?
  uploadedAt            DateTime
  verifiedAt            DateTime?
}
```

### TaskEscalationMatrix Model

```prisma
model TaskEscalationMatrix {
  id              String
  taskType        String
  priority        String
  level1UserId    String      // First escalation approver
  level2UserId    String      // Second level approver
  level3UserId    String      // Third level approver
  createdAt       DateTime
  updatedAt       DateTime
}
```

---

## API Endpoints

### Task Management

#### Create Task
```
POST /api/tasks
Content-Type: application/json

{
  "title": "Quarterly Report",
  "description": "Prepare quarterly performance report",
  "taskType": "ACADEMIC",
  "priority": "HIGH",
  "dueDate": "2026-06-30",
  "requiresApproval": true,
  "category": "Reports"
}

Response: 201 Created
{
  "success": true,
  "message": "Task created successfully",
  "task": { /* task object */ }
}
```

#### Get Task Details
```
GET /api/tasks/:taskId
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "task": {
    "id": "task_123",
    "title": "Quarterly Report",
    "status": "ASSIGNED",
    "priority": "HIGH",
    "assignments": [ /* assignments */ ],
    "approvals": [ /* approvals */ ],
    "evidence": [ /* evidence */ ]
  }
}
```

#### Update Task
```
PUT /api/tasks/:taskId
Content-Type: application/json

{
  "title": "Updated Title",
  "status": "IN_PROGRESS",
  "progressPercentage": 50
}

Response: 200 OK
```

#### List Tasks
```
GET /api/tasks?status=IN_PROGRESS&priority=HIGH&limit=20&offset=0
Authorization: Bearer <token>

Query Parameters:
- status: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, ON_HOLD
- priority: LOW, MEDIUM, HIGH, URGENT
- taskType: GENERAL, ACADEMIC, ADMINISTRATIVE, RESEARCH
- fromDate: YYYY-MM-DD
- toDate: YYYY-MM-DD

Response: 200 OK
{
  "success": true,
  "tasks": [ /* array of tasks */ ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

### Task Assignment

#### Assign Task to User
```
POST /api/tasks/:taskId/assign
Content-Type: application/json

{
  "assignedToId": "user_123",
  "assignedToType": "FACULTY",
  "individualDueDate": "2026-06-25"
}

Response: 201 Created
{
  "success": true,
  "message": "Task assigned successfully",
  "assignment": { /* assignment object */ }
}
```

#### Assign Task to Group
```
POST /api/tasks/:taskId/assign-group
Content-Type: application/json

{
  "groupId": "group_456"
}

Response: 201 Created
```

#### Get My Assigned Tasks
```
GET /api/my-tasks?status=IN_PROGRESS&limit=20
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "assignments": [ /* user's assignments */ ],
  "total": 15
}
```

### Approval Workflow

#### Create Approval Request
```
POST /api/tasks/:taskId/approval
Content-Type: application/json

{
  "approverUserId": "hod_123"
}

Response: 201 Created
```

#### Approve/Reject Task
```
POST /api/approvals/:approvalId/approve
Content-Type: application/json

{
  "approvalStatus": "APPROVED",
  "approvalComments": "Looks good, proceeding with implementation"
}

Response: 200 OK
{
  "success": true,
  "message": "Task approved"
}
```

#### Get Pending Approvals
```
GET /api/my-approvals
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "approvals": [ /* pending approvals for current user */ ]
}
```

### Evidence Submission

#### Submit Evidence
```
POST /api/tasks/:taskId/evidence
Content-Type: multipart/form-data

{
  "title": "Final Report",
  "description": "Completed project report",
  "evidenceType": "FILE",
  "file": <binary file content>
}

Response: 201 Created
{
  "success": true,
  "message": "Evidence submitted successfully",
  "evidence": { /* evidence object */ }
}
```

#### Get Task Evidence
```
GET /api/tasks/:taskId/evidence
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "evidence": [ /* array of evidence */ ]
}
```

#### Verify Evidence
```
POST /api/evidence/:evidenceId/verify
Content-Type: application/json

{
  "isVerified": true,
  "comments": "Verified and validated"
}

Response: 200 OK
```

### Escalation

#### Escalate Task
```
POST /api/tasks/:taskId/escalate
Content-Type: application/json

{
  "escalationReason": "Task delayed due to resource constraints",
  "targetUserId": "admin_123"  // Optional, uses matrix if not provided
}

Response: 201 Created
```

#### Get Escalations
```
GET /api/tasks/:taskId/escalations
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "escalations": [ /* escalation history */ ]
}
```

### Notifications

#### Get Notifications
```
GET /api/notifications?unreadOnly=true
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "notifications": [
    {
      "id": "notif_123",
      "title": "Task Assigned",
      "message": "You have been assigned a new task",
      "isRead": false,
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ]
}
```

#### Mark Notification as Read
```
POST /api/notifications/:notificationId/read
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

### Analytics & Reporting

#### Get Dashboard Statistics
```
GET /api/tasks/dashboard/stats?userId=user_123
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "stats": {
    "totalTasks": 25,
    "pendingTasks": 5,
    "inProgressTasks": 12,
    "completedTasks": 8,
    "overdueTasks": 3,
    "escalatedTasks": 2,
    "taskCompletionRate": 32,
    "approvalPendingCount": 1
  }
}
```

#### Get User Task Statistics
```
GET /api/users/:userId/stats
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "stats": {
    "tasksAssigned": 20,
    "tasksCompleted": 15,
    "tasksInProgress": 4,
    "overdueTasks": 1,
    "acceptanceRate": 95
  }
}
```

#### Get Task Metrics
```
GET /api/tasks/metrics?priority=HIGH&taskType=ACADEMIC
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "metrics": {
    "totalAssigned": 50,
    "totalCompleted": 35,
    "onTimeCompletionRate": 80,
    "escalationRate": 10,
    "tasksByPriority": { "LOW": 10, "MEDIUM": 20, "HIGH": 20 },
    "tasksByStatus": { "COMPLETED": 35, "IN_PROGRESS": 15 }
  }
}
```

---

## Frontend Components

### TaskBoard Component
Kanban-style task board with drag-and-drop functionality.

**Usage:**
```typescript
import { TaskBoard } from '@/components/TaskManagement';

<TaskBoard
  tasks={tasks}
  onTaskClick={(taskId) => { /* handle click */ }}
  onStatusChange={(taskId, newStatus) => { /* handle status change */ }}
/>
```

### TaskDashboard Component
Analytics dashboard with key metrics and recent tasks.

**Usage:**
```typescript
import { TaskDashboard } from '@/components/TaskManagement';

<TaskDashboard
  stats={dashboardStats}
  recentTasks={tasks}
  metrics={metricsData}
  onTaskClick={(taskId) => { /* handle click */ }}
/>
```

### TaskForm Component
Form for creating and editing tasks.

**Usage:**
```typescript
import { TaskForm } from '@/components/TaskManagement';

<TaskForm
  initialTask={task}
  onSubmit={(data) => { /* handle submit */ }}
  onCancel={() => { /* handle cancel */ }}
  isLoading={false}
/>
```

### TaskAssignment Component
Manage task assignments to users and groups.

**Usage:**
```typescript
import { TaskAssignment } from '@/components/TaskManagement';

<TaskAssignment
  taskId={taskId}
  existingAssignments={assignments}
  faculties={facultyList}
  students={studentList}
  groups={groupList}
  onAssign={(data) => { /* handle assignment */ }}
  onRemove={(assignmentId) => { /* handle removal */ }}
/>
```

### TaskApproval Component
Multi-level approval workflow interface.

**Usage:**
```typescript
import { TaskApproval } from '@/components/TaskManagement';

<TaskApproval
  taskId={taskId}
  approvals={approvalChain}
  requiresApproval={true}
  currentApprovalStatus="PENDING"
  evidence={evidenceList}
  onApprove={(id, comments) => { /* handle approval */ }}
  onReject={(id, comments) => { /* handle rejection */ }}
/>
```

### EvidenceUpload Component
Submit and verify task evidence/proof of work.

**Usage:**
```typescript
import { EvidenceUpload } from '@/components/TaskManagement';

<EvidenceUpload
  taskId={taskId}
  existingEvidence={evidence}
  canVerify={userCanVerify}
  onSubmit={(data) => { /* handle submission */ }}
  onVerify={(id, isVerified, comments) => { /* handle verification */ }}
/>
```

### TaskNotificationCenter Component
Real-time notification center with unread count badge.

**Usage:**
```typescript
import { TaskNotificationCenter } from '@/components/TaskManagement';

<TaskNotificationCenter
  notifications={notificationList}
  onMarkRead={(id) => { /* mark as read */ }}
  onDelete={(id) => { /* delete notification */ }}
  onNotificationClick={(notification) => { /* handle click */ }}
/>
```

---

## Service Functions

### Task Management Service

#### Core Functions

1. **createTask(createdById, createdByRole, data)** - Create new task
2. **getTask(taskId)** - Retrieve full task details with relations
3. **updateTask(taskId, data)** - Update task information
4. **getTasks(filters, limit, offset)** - List tasks with filtering and pagination

#### Assignment Functions

5. **assignTask(taskId, data)** - Assign task to individual user
6. **assignTaskToGroup(taskId, groupId)** - Assign task to group
7. **updateAssignment(assignmentId, data)** - Update assignment progress
8. **getAssignmentsForUser(userId, status, limit, offset)** - Get user's assignments

#### Group Functions

9. **createTaskGroup(data)** - Create task group
10. **getTaskGroup(groupId)** - Retrieve group details
11. **addMembersToGroup(groupId, memberIds)** - Add members to group

#### Evidence Functions

12. **submitEvidence(taskId, submittedById, data)** - Submit evidence
13. **getTaskEvidence(taskId)** - Retrieve all evidence for task
14. **verifyEvidence(evidenceId, verifiedBy, isVerified, comments)** - Verify evidence

#### Approval Functions

15. **createApprovalRequest(taskId, approverUserId)** - Create approval request
16. **approveTask(approvalId, approverUserId, data)** - Approve/reject task
17. **getPendingApprovals(userId)** - Get pending approvals for user

#### Escalation Functions

18. **escalateTask(taskId, escalatedById, data)** - Escalate task
19. **getTaskEscalations(taskId)** - Get escalation history

#### Notification Functions

20. **createNotification(taskId, recipientId, title, message, type)** - Create notification
21. **getNotifications(userId, unreadOnly)** - Get user notifications
22. **markNotificationAsRead(notificationId)** - Mark notification as read

#### Analytics Functions

23. **getTaskDashboardStats(userId)** - Get dashboard statistics
24. **getUserTaskStats(userId)** - Get user performance stats
25. **getTaskMetrics(filters)** - Get aggregated metrics

---

## Reporting Service

### Report Types

1. **Task Completion Report** - Overall completion metrics
2. **Escalation Report** - Escalation analysis and bottlenecks
3. **Approval Report** - Approval workflow analysis
4. **Performance Report** - User/department performance metrics

### Report Functions

```typescript
// Generate task completion report
generateTaskCompletionReport(filters?: { departmentId?, fromDate?, toDate?, taskType? })

// Generate escalation analysis
generateEscalationReport(filters?: { fromDate?, toDate? })

// Generate approval bottleneck report
generateApprovalReport(filters?: { fromDate?, toDate? })

// Generate performance metrics
generatePerformanceReport(filters?: { departmentId?, userId?, fromDate?, toDate? })

// Export report to CSV
exportReportToCSV(report, reportType)
```

---

## Permissions & Access Control

### Task Permissions

- **CREATE**: HOD, FACULTY, ADMIN
- **READ**: All roles (filtered by visibility)
- **UPDATE**: Creator, HOD, ADMIN
- **DELETE**: Creator (soft delete), ADMIN
- **ASSIGN**: HOD, ADMIN, Task Creator
- **APPROVE**: Designated approvers, ADMIN
- **ESCALATE**: HOD, FACULTY, ADMIN
- **VERIFY**: HOD, ADMIN, Designated verifiers

---

## Workflow Examples

### Complete Task Assignment and Approval Workflow

1. **HOD Creates Task**
   ```
   POST /api/tasks (by HOD)
   → Task created with status: PENDING
   ```

2. **HOD Assigns to Faculty**
   ```
   POST /api/tasks/:taskId/assign (by HOD)
   → Assignment created, Faculty notified
   ```

3. **Faculty Accepts and Works on Task**
   ```
   PUT /api/tasks/assignments/:id (Faculty updates progress)
   → Assignment status: IN_PROGRESS
   ```

4. **Faculty Submits Evidence**
   ```
   POST /api/tasks/:taskId/evidence (by Faculty)
   → Evidence submitted for verification
   ```

5. **HOD Verifies Evidence**
   ```
   POST /api/evidence/:id/verify (by HOD)
   → Evidence marked as verified
   ```

6. **System Creates Approval Request**
   ```
   POST /api/tasks/:taskId/approval
   → Approval request sent to ADMIN
   ```

7. **Admin Reviews and Approves**
   ```
   POST /api/approvals/:id/approve (by ADMIN)
   → Task status: COMPLETED
   ```

---

## Integration Points

### Master Data Integration
- Task assignments linked to Faculty and Student master data
- Department-level task tracking and reporting

### Notification System
- Automatic notifications on task events
- Real-time updates via WebSocket (when implemented)

### Authentication
- Role-based access control
- Permission-based action validation

### File Storage
- Evidence file uploads to cloud storage
- Configurable file size limits

---

## Performance Optimization

1. **Database Indexing**
   - Indexes on status, priority, dueDate, createdById
   - Composite indexes on (taskType, priority) for escalation matrix lookup

2. **Caching Strategy**
   - Cache user notifications (short TTL)
   - Cache escalation matrices (longer TTL)
   - Cache dashboard statistics

3. **Query Optimization**
   - Selective field inclusion in queries
   - Pagination for large result sets
   - Database query batching

---

## Error Handling

All API endpoints return standardized response format:

```json
{
  "success": true/false,
  "message": "Error or success message",
  "data": { /* response data */ },
  "code": "ERROR_CODE"  // Optional error code
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request / Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

---

## Configuration

### Environment Variables

```env
# Task Management
TASK_MAX_FILE_SIZE=10485760  # 10MB
TASK_EVIDENCE_RETENTION_DAYS=365
TASK_NOTIFICATION_RETENTION_DAYS=90
TASK_ESCALATION_AUTO_LEVEL=3
```

### Default Settings

```typescript
const DEFAULT_ESCALATION_LEVELS = 3;
const DEFAULT_APPROVAL_TIMEOUT_DAYS = 7;
const TASK_STATUSES = [
  'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD', 'CANCELLED'
];
const TASK_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const EVIDENCE_TYPES = ['FILE', 'URL', 'TEXT', 'IMAGE', 'VIDEO', 'LINK'];
```

---

## Future Enhancements

1. **Real-time Collaboration**
   - WebSocket integration for live updates
   - Real-time task board sync

2. **Advanced Analytics**
   - Predictive analytics for task completion
   - ML-based workload balancing

3. **Mobile Application**
   - Native mobile app for task management
   - Offline capability with sync

4. **Integration Connectors**
   - OneNote integration for evidence
   - Email notifications with reply-to-action

5. **Workflow Automation**
   - Automated escalation rules
   - Conditional task chains

---

## Support & Troubleshooting

### Common Issues

**Issue**: Notifications not appearing
- **Solution**: Check notification service is running, verify WebSocket connection

**Issue**: Escalation not using matrix
- **Solution**: Ensure TaskEscalationMatrix is configured for task type and priority

**Issue**: Evidence file upload failing
- **Solution**: Check file size limits, verify storage service connection

### Debug Mode

Enable debug logging:
```typescript
process.env.DEBUG_TASK_MANAGEMENT = 'true';
```

---

## Version History

- **v1.0** (June 2026): Initial release
  - Core task management features
  - Multi-level approval workflow
  - Evidence submission system
  - Escalation matrix configuration
  - Dashboard analytics
  - Reporting module

---

**Last Updated**: June 2026
**Maintained By**: Development Team
**Status**: Production Ready ✓
