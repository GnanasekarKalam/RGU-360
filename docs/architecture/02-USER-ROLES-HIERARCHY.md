# User Roles & Hierarchy - Academic Department360 Dashboard

## 1. Role Hierarchy Structure

```
                        System Admin
                            │
                ┌───────────┴────────────┐
                │                        │
        Department Head            Academic Coordinator
                │                        │
        ┌───────┼───────┬───────────────┴──────────┐
        │       │       │                          │
      Faculty  Admin  Academic Advisor         Students
               Staff    
```

## 2. Detailed Role Definitions

### 2.1 System Admin
**Purpose**: Overall system management and infrastructure

**Permissions**:
- ✓ Complete system access
- ✓ User account creation/modification/deletion
- ✓ Role and permission assignment
- ✓ Database management and backups
- ✓ Security configuration (MFA, encryption)
- ✓ Audit log review
- ✓ System settings and configuration
- ✓ API integration management
- ✓ Performance monitoring
- ✓ Disaster recovery operations

**Responsibilities**:
- System uptime and performance
- Security and compliance
- User support and administration
- Data integrity and backups
- Integration management

**UI Access**:
- Admin Dashboard
- User Management
- System Settings
- Audit Logs
- Server Status

---

### 2.2 Department Head
**Purpose**: Departmental leadership and decision-making authority

**Permissions**:
- ✓ View all faculty profiles and performance data
- ✓ View all student records (with FERPA compliance)
- ✓ Approve/reject course offerings
- ✓ Approve/reject curriculum changes
- ✓ Approve grade appeals
- ✓ Review faculty leave requests
- ✓ Access workflow approval queue
- ✓ Generate compliance and performance reports
- ✓ View department budget and resource allocation
- ✓ Assign faculty to courses (workflow)
- ✓ Set departmental policies and preferences
- ✓ Access departmental analytics and dashboards

**Workflow Authority**:
- Final approval for all departmental workflows
- Can override lower-level approvals
- Receives workflow escalation notifications

**Responsibilities**:
- Strategic departmental planning
- Faculty oversight and evaluation
- Budget management
- Compliance verification
- Student academic standing decisions

**UI Access**:
- Department Dashboard
- Faculty Management
- Student Management
- Course Management
- Approval Workflows
- Analytics & Reports
- Department Settings

---

### 2.3 Faculty
**Purpose**: Course delivery and student evaluation

**Permissions**:
- ✓ Manage own courses (view/edit details)
- ✓ Input and modify grades for own courses
- ✓ Take attendance for own courses
- ✓ View enrolled students in own courses
- ✓ Upload course materials
- ✓ Access OneDrive course folder
- ✓ View own faculty profile
- ✓ Submit/view leave requests
- ✓ View own salary information (limited view)
- ✓ View own professional development records
- ✓ Communicate with students via messaging
- ✓ Access course analytics for own courses
- ✓ View personal academic performance metrics
- ✗ Cannot view other faculty's courses
- ✗ Cannot view other faculty's financial information

**Workflow Participation**:
- Can submit grade information for approval
- Can respond to grade appeals from students
- Can request leave (requires approval)

**Responsibilities**:
- Course delivery and management
- Fair and timely grading
- Student communication
- Course material organization
- Attendance tracking

**UI Access**:
- Faculty Dashboard
- My Courses
- Grade Book
- Attendance Tracker
- Student Roster
- Course Materials (OneDrive)
- My Profile
- Leave Requests

---

### 2.4 Academic Advisor
**Purpose**: Student academic planning and progress monitoring

**Permissions**:
- ✓ View assigned students' academic records
- ✓ View student degree audit and progress
- ✓ View student course history and grades
- ✓ Track prerequisite completion
- ✓ View course availability and scheduling
- ✓ Access curriculum information
- ✓ Generate student progress reports
- ✓ Communicate with assigned students
- ✓ View student academic standing
- ✓ Make course recommendations
- ✓ Flag students at risk
- ✓ View departmental academic policies
- ✗ Cannot modify grades
- ✗ Cannot unenroll students
- ✗ Cannot view student financial information

**Workflow Participation**:
- Can escalate academic standing changes
- Receives notifications of student at-risk flags

**Responsibilities**:
- Student academic planning
- Degree requirement tracking
- Course sequencing recommendations
- Early intervention for at-risk students
- Progress monitoring and reporting

**UI Access**:
- Advisor Dashboard
- My Students
- Student Academic Records
- Degree Audit
- Course Recommendations
- Progress Reports
- Curriculum Information

---

### 2.5 Admin Staff / Academic Coordinator
**Purpose**: Administrative operations and data management

**Permissions**:
- ✓ User account management (create/modify)
- ✓ Course scheduling and room assignment
- ✓ Enrollment management
- ✓ Data imports/exports
- ✓ Report generation
- ✓ Workflow management and escalation
- ✓ Document management
- ✓ System backup verification
- ✓ Notification management
- ✓ Database cleanup and maintenance
- ✓ Academic calendar management
- ✓ Prerequisite setup and maintenance
- ✓ Student information updates
- ✓ View audit logs (limited)
- ✗ Cannot approve workflows
- ✗ Cannot delete user accounts
- ✗ Cannot modify security settings

**Responsibilities**:
- Daily administrative tasks
- Data accuracy and maintenance
- Workflow processing
- Report generation
- System data integrity

**UI Access**:
- Admin Dashboard
- User Management (create/modify only)
- Course Scheduling
- Enrollment Management
- Data Import/Export
- Report Builder
- Workflow Processing
- Document Management

---

### 2.6 Students
**Purpose**: Access personal academic information

**Permissions**:
- ✓ View own student profile
- ✓ View own grades and transcripts
- ✓ View own degree progress/audit
- ✓ View enrolled courses and schedule
- ✓ Access course materials (if faculty share)
- ✓ View course descriptions and requirements
- ✓ Update own profile information (limited)
- ✓ Download own transcript
- ✓ View own academic standing
- ✓ Submit assignment work (via LMS integration)
- ✗ Cannot view other students' information
- ✗ Cannot modify grades
- ✗ Cannot access faculty records
- ✗ Cannot access approval workflows

**Responsibilities**:
- Monitoring own academic progress
- Keeping profile information current
- Reviewing course requirements

**UI Access**:
- Student Dashboard
- My Profile
- My Grades
- My Transcripts
- Degree Progress
- Course Materials
- Academic Standing

---

## 3. Permission Matrix

| Feature | System Admin | Dept Head | Faculty | Advisor | Admin Staff | Student |
|---------|:--:|:--:|:--:|:--:|:--:|:--:|
| View Faculty Profiles | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Edit Faculty Profiles | ✓ | ✓ | ✓* | ✗ | ✓ | ✗ |
| View Student Records | ✓ | ✓ | ✓† | ✓† | ✓ | ✓‡ |
| View Grades (all) | ✓ | ✓ | ✗ | ✓† | ✓ | ✗ |
| Input Grades | ✓ | ✗ | ✓§ | ✗ | ✗ | ✗ |
| Approve Grades | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| View Courses (all) | ✓ | ✓ | ✓¶ | ✓ | ✓ | ✓ |
| Create/Edit Courses | ✓ | ✓ | ✓¶ | ✗ | ✓ | ✗ |
| Manage Enrollments | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| View Analytics (all) | ✓ | ✓ | ✓¶ | ✓† | ✓ | ✗ |
| Generate Reports | ✓ | ✓ | ✗ | ✓ | ✓ | ✗ |
| Approve Workflows | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Users | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Audit Logs | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| OneDrive Access | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| System Settings | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Legend**:
- ✓ = Full access
- ✗ = No access
- † = Only assigned students
- ‡ = Only own records
- § = Only own courses
- ¶ = Only own courses
- * = Own profile only

---

## 4. Role-Based Navigation

### System Admin
- Dashboard → User Management → System Settings → Audit Logs → Server Status

### Department Head
- Dashboard → Faculty → Students → Courses → Academic Planning → Workflows → Reports → Settings

### Faculty
- Dashboard → My Courses → Grade Book → Attendance → Course Materials → My Profile

### Academic Advisor
- Dashboard → My Students → Degree Audit → Course Recommendations → Reports

### Admin Staff
- Dashboard → User Management → Course Scheduling → Enrollments → Reports → Document Management

### Students
- Dashboard → My Grades → My Profile → Degree Progress → Course Materials

---

## 5. Default Role Assignment Rules

| User Type | Default Role | Elevation Path |
|-----------|-------------|-----------------|
| New Employee | Admin Staff | System Admin approval → Faculty approval |
| New Faculty Hire | Faculty | N/A (Manual Department Head assignment) |
| New Student | Student | N/A (Automatic via SIS) |
| Department Admin | Admin Staff | Can be elevated by System Admin |
| Senior Faculty | Faculty + Advisor (dual role) | Department Head assignment |

---

## 6. Delegation & Temporary Role Assignment

### Delegation Rules
- Department Head can temporarily delegate approval authority to Academic Coordinator
- Faculty can designate teaching assistant with limited grade input permissions
- Advisor can request backup during leave period
- Delegation requires: reason, duration, acknowledgment

### Multi-Role Support
- Users can have multiple roles (e.g., Faculty + Academic Advisor)
- Dashboard adjusts based on active role
- Users can switch roles if multiple are assigned

---

## 7. Access Audit & Security

### Logging
- All permission checks logged
- Failed access attempts tracked
- Role changes logged with timestamp and reason
- Bulk operations logged with user and timestamp

### Compliance
- Annual permission review
- Termination removes all access within 1 hour
- Leave of absence restricts data access
- MFA required for system admin functions

---

## 8. Role Transition Procedures

### Role Removal
1. Notification to user
2. Grace period (24 hours for non-critical roles)
3. Access revocation
4. Audit log entry
5. Notification to department head

### Role Addition
1. Department head or system admin approval
2. User confirmation (if automatic)
3. Training materials assigned (if applicable)
4. Audit log entry
5. Welcome notification with role permissions

---

## 9. Special Scenarios

### Student Teaching Assistant
- Role: Faculty (limited)
- Permissions:
  - View enrolled students
  - Cannot modify grades
  - Can take attendance
  - Can upload materials

### Department Chair (Extension of Department Head)
- Additional permissions for:
  - Budget approval
  - Hiring recommendations
  - Promotion decisions
  - Tenure reviews

### Anonymous/Guest Access
- Limited to:
  - Public course descriptions
  - Academic calendar
  - Department contact information
- No personal data access
- No credential required

