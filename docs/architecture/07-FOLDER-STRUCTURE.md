# Project Folder Structure - Academic Department360 Dashboard

## 1. Root Project Structure

```
maths-dashboard/
├── .github/
│   ├── workflows/
│   │   ├── ci-cd.yml
│   │   ├── test.yml
│   │   └── deploy.yml
│   └── ISSUE_TEMPLATE/
│
├── docs/
│   ├── 00-REQUIREMENTS.md (CREATED)
│   ├── 01-TECHNICAL-SETUP.md
│   ├── 02-DEVELOPMENT-GUIDE.md
│   ├── 03-DEPLOYMENT-GUIDE.md
│   ├── 04-API-DOCUMENTATION.md
│   ├── 05-USER-GUIDE.md
│   │
│   ├── architecture/
│   │   ├── 01-SOFTWARE-ARCHITECTURE.md (CREATED)
│   │   ├── 02-USER-ROLES-HIERARCHY.md (CREATED)
│   │   ├── 03-APPROVAL-WORKFLOWS.md (CREATED)
│   │   ├── 04-SECURITY-ARCHITECTURE.md (CREATED)
│   │   ├── 05-ONEDRIVE-INTEGRATION.md (CREATED)
│   │   └── 06-API-ARCHITECTURE.md (CREATED)
│   │
│   ├── database/
│   │   ├── 01-DATABASE-SCHEMA.md (CREATED)
│   │   ├── 02-MIGRATIONS/
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_audit_tables.sql
│   │   │   └── 003_add_indexes.sql
│   │   │
│   │   └── SEED_DATA/
│   │       ├── roles.sql
│   │       ├── permissions.sql
│   │       └── sample_data.sql
│   │
│   ├── diagrams/
│   │   ├── ER_DIAGRAM.md (Mermaid)
│   │   ├── SYSTEM_ARCHITECTURE.md (Mermaid)
│   │   ├── WORKFLOW_DIAGRAM.md (Mermaid)
│   │   └── DEPLOYMENT_DIAGRAM.md (Mermaid)
│   │
│   └── CHANGELOG.md

├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   ├── onedrive.ts
│   │   │   └── env.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── authorization.middleware.ts
│   │   │   ├── validation.middleware.ts
│   │   │   ├── errorHandler.middleware.ts
│   │   │   ├── logging.middleware.ts
│   │   │   └── cors.middleware.ts
│   │   │
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── UserService.ts
│   │   │   ├── FacultyService.ts
│   │   │   ├── StudentService.ts
│   │   │   ├── CourseService.ts
│   │   │   ├── EnrollmentService.ts
│   │   │   ├── GradeService.ts
│   │   │   ├── AcademicPlanningService.ts
│   │   │   ├── AnalyticsService.ts
│   │   │   ├── WorkflowService.ts
│   │   │   ├── DocumentService.ts
│   │   │   ├── NotificationService.ts
│   │   │   ├── AuditService.ts
│   │   │   └── OneDriveService.ts
│   │   │
│   │   ├── repositories/
│   │   │   ├── UserRepository.ts
│   │   │   ├── FacultyRepository.ts
│   │   │   ├── StudentRepository.ts
│   │   │   ├── CourseRepository.ts
│   │   │   ├── EnrollmentRepository.ts
│   │   │   ├── GradeRepository.ts
│   │   │   ├── WorkflowRepository.ts
│   │   │   └── AuditLogRepository.ts
│   │   │
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Faculty.ts
│   │   │   ├── Student.ts
│   │   │   ├── Course.ts
│   │   │   ├── Class.ts
│   │   │   ├── Enrollment.ts
│   │   │   ├── Grade.ts
│   │   │   ├── Workflow.ts
│   │   │   ├── WorkflowApproval.ts
│   │   │   └── AuditLog.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── UserController.ts
│   │   │   ├── FacultyController.ts
│   │   │   ├── StudentController.ts
│   │   │   ├── CourseController.ts
│   │   │   ├── EnrollmentController.ts
│   │   │   ├── GradeController.ts
│   │   │   ├── AcademicPlanningController.ts
│   │   │   ├── AnalyticsController.ts
│   │   │   ├── WorkflowController.ts
│   │   │   ├── DocumentController.ts
│   │   │   └── AdminController.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── faculty.routes.ts
│   │   │   ├── student.routes.ts
│   │   │   ├── courses.routes.ts
│   │   │   ├── enrollment.routes.ts
│   │   │   ├── grades.routes.ts
│   │   │   ├── academic-planning.routes.ts
│   │   │   ├── analytics.routes.ts
│   │   │   ├── workflows.routes.ts
│   │   │   ├── documents.routes.ts
│   │   │   └── admin.routes.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── jwt.utils.ts
│   │   │   ├── encryption.utils.ts
│   │   │   ├── email.utils.ts
│   │   │   ├── pagination.utils.ts
│   │   │   ├── error.utils.ts
│   │   │   ├── logger.ts
│   │   │   └── constants.ts
│   │   │
│   │   ├── types/
│   │   │   ├── User.ts
│   │   │   ├── Faculty.ts
│   │   │   ├── Student.ts
│   │   │   ├── Course.ts
│   │   │   ├── Grade.ts
│   │   │   ├── Workflow.ts
│   │   │   ├── API.ts
│   │   │   └── Error.ts
│   │   │
│   │   ├── queue/
│   │   │   ├── WorkflowQueue.ts
│   │   │   ├── NotificationQueue.ts
│   │   │   ├── SyncQueue.ts
│   │   │   └── ReportQueue.ts
│   │   │
│   │   ├── jobs/
│   │   │   ├── GradePublishJob.ts
│   │   │   ├── NotificationJob.ts
│   │   │   ├── SyncOneDriveJob.ts
│   │   │   ├── AnalyticsJob.ts
│   │   │   ├── BackupJob.ts
│   │   │   └── CleanupJob.ts
│   │   │
│   │   └── app.ts (Express app entry)
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── utils/
│   │   │
│   │   ├── integration/
│   │   │   ├── auth.test.ts
│   │   │   ├── faculty.test.ts
│   │   │   ├── grades.test.ts
│   │   │   └── workflows.test.ts
│   │   │
│   │   ├── e2e/
│   │   │   ├── authentication.test.ts
│   │   │   ├── grade-submission.test.ts
│   │   │   ├── course-creation.test.ts
│   │   │   └── enrollment.test.ts
│   │   │
│   │   └── fixtures/
│   │       ├── user-data.json
│   │       ├── course-data.json
│   │       └── enrollment-data.json
│   │
│   ├── migrations/ (Database migrations)
│   │   ├── 001_create_users_table.ts
│   │   ├── 002_create_faculty_table.ts
│   │   ├── 003_create_students_table.ts
│   │   ├── 004_create_courses_table.ts
│   │   ├── 005_create_enrollments_table.ts
│   │   ├── 006_create_grades_table.ts
│   │   ├── 007_create_workflows_table.ts
│   │   ├── 008_create_audit_logs_table.ts
│   │   └── 009_add_indexes.ts
│   │
│   ├── seeds/ (Database seeds)
│   │   ├── roles.seed.ts
│   │   ├── permissions.seed.ts
│   │   ├── departments.seed.ts
│   │   └── sample-data.seed.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── jest.config.js
│   └── server.ts (Server entry point)

├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── Button.tsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   └── AdminLayout.tsx
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardMain.tsx
│   │   │   │   ├── WidgetGPA.tsx
│   │   │   │   ├── WidgetCourses.tsx
│   │   │   │   ├── WidgetAnalytics.tsx
│   │   │   │   └── RoleBasedDashboard.tsx
│   │   │   │
│   │   │   ├── faculty/
│   │   │   │   ├── FacultyList.tsx
│   │   │   │   ├── FacultyDetail.tsx
│   │   │   │   ├── FacultyForm.tsx
│   │   │   │   └── FacultyProfile.tsx
│   │   │   │
│   │   │   ├── students/
│   │   │   │   ├── StudentList.tsx
│   │   │   │   ├── StudentDetail.tsx
│   │   │   │   ├── StudentForm.tsx
│   │   │   │   ├── GradeBook.tsx
│   │   │   │   ├── DegreeAudit.tsx
│   │   │   │   └── AcademicProgress.tsx
│   │   │   │
│   │   │   ├── courses/
│   │   │   │   ├── CourseList.tsx
│   │   │   │   ├── CourseDetail.tsx
│   │   │   │   ├── CourseForm.tsx
│   │   │   │   ├── ClassSchedule.tsx
│   │   │   │   ├── CourseEnrollment.tsx
│   │   │   │   └── Syllabus.tsx
│   │   │   │
│   │   │   ├── academic-planning/
│   │   │   │   ├── DegreeRequirements.tsx
│   │   │   │   ├── CurriculumMap.tsx
│   │   │   │   ├── Prerequisites.tsx
│   │   │   │   └── AcademicPlan.tsx
│   │   │   │
│   │   │   ├── grades/
│   │   │   │   ├── GradeSubmission.tsx
│   │   │   │   ├── GradeApproval.tsx
│   │   │   │   ├── GradeAppeal.tsx
│   │   │   │   └── TranscriptView.tsx
│   │   │   │
│   │   │   ├── analytics/
│   │   │   │   ├── PerformanceAnalytics.tsx
│   │   │   │   ├── EnrollmentTrends.tsx
│   │   │   │   ├── RetentionAnalytics.tsx
│   │   │   │   ├── GradeDistribution.tsx
│   │   │   │   └── CustomReports.tsx
│   │   │   │
│   │   │   ├── workflows/
│   │   │   │   ├── ApprovalQueue.tsx
│   │   │   │   ├── WorkflowDetail.tsx
│   │   │   │   ├── WorkflowHistory.tsx
│   │   │   │   └── ApprovalForm.tsx
│   │   │   │
│   │   │   ├── documents/
│   │   │   │   ├── OneDriveExplorer.tsx
│   │   │   │   ├── FileUploader.tsx
│   │   │   │   ├── DocumentLibrary.tsx
│   │   │   │   └── FileBrowser.tsx
│   │   │   │
│   │   │   ├── admin/
│   │   │   │   ├── UserManagement.tsx
│   │   │   │   ├── RoleManagement.tsx
│   │   │   │   ├── SystemSettings.tsx
│   │   │   │   ├── AuditLogs.tsx
│   │   │   │   └── BackupManagement.tsx
│   │   │   │
│   │   │   └── auth/
│   │   │       ├── Login.tsx
│   │   │       ├── Register.tsx
│   │   │       ├── MFASetup.tsx
│   │   │       ├── PasswordReset.tsx
│   │   │       └── MFAVerify.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Faculty.tsx
│   │   │   ├── Students.tsx
│   │   │   ├── Courses.tsx
│   │   │   ├── Grades.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Workflows.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Administration.tsx
│   │   │   ├── NotFound.tsx
│   │   │   ├── Unauthorized.tsx
│   │   │   └── Error.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useFetch.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useNotification.ts
│   │   │   ├── useRole.ts
│   │   │   └── useModal.ts
│   │   │
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── faculty.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── course.service.ts
│   │   │   ├── grade.service.ts
│   │   │   ├── analytics.service.ts
│   │   │   ├── workflow.service.ts
│   │   │   ├── document.service.ts
│   │   │   ├── notification.service.ts
│   │   │   └── storage.service.ts
│   │   │
│   │   ├── store/ (Redux/Context)
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── userSlice.ts
│   │   │   │   ├── notificationSlice.ts
│   │   │   │   ├── studentSlice.ts
│   │   │   │   ├── courseSlice.ts
│   │   │   │   └── gradeSlice.ts
│   │   │   │
│   │   │   ├── index.ts
│   │   │   └── store.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── date.utils.ts
│   │   │   ├── string.utils.ts
│   │   │   ├── api-error.handler.ts
│   │   │   ├── constants.ts
│   │   │   └── permissions.ts
│   │   │
│   │   ├── types/
│   │   │   ├── User.ts
│   │   │   ├── Faculty.ts
│   │   │   ├── Student.ts
│   │   │   ├── Course.ts
│   │   │   ├── Grade.ts
│   │   │   ├── Workflow.ts
│   │   │   ├── API.ts
│   │   │   └── Error.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   ├── theme.css
│   │   │   ├── components/
│   │   │   │   ├── dashboard.css
│   │   │   │   ├── forms.css
│   │   │   │   └── tables.css
│   │   │   │
│   │   │   └── utilities/
│   │   │       ├── spacing.css
│   │   │       ├── typography.css
│   │   │       └── responsive.css
│   │   │
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── Router.tsx
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   │
│   │   ├── integration/
│   │   │   ├── Dashboard.test.tsx
│   │   │   ├── Authentication.test.tsx
│   │   │   └── Workflows.test.tsx
│   │   │
│   │   └── fixtures/
│   │       └── mock-data.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── .env.development
│   ├── .env.production
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── jest.config.js
│   └── vite.config.ts

├── mobile/ (Optional - React Native)
│   └── (Similar structure to frontend)

├── .docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml

├── .env.example
├── .env.development
├── .env.production
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── .dockerignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
├── package.json (Root)
├── Makefile
└── docker-compose.yml
```

---

## 2. Backend File Organization Details

### 2.1 Service Layer Responsibilities

```
AuthService
├── Register user
├── Login with MFA
├── Token generation/refresh
├── Password reset
└── MFA management

UserService
├── Create/read/update user
├── Role assignment
├── Permission check
└── User profile management

FacultyService
├── Faculty CRUD operations
├── Course assignment
├── Performance tracking
├── Leave request management
└── Salary information (encrypted)

StudentService
├── Student enrollment
├── Academic standing tracking
├── Transcript generation
├── Degree audit
└── Course recommendations

GradeService
├── Grade submission
├── Grade approval workflow
├── Grade appeals
├── Transcript generation
└── GPA calculations

WorkflowService
├── Workflow creation/management
├── State transitions
├── Approval task management
├── Escalation logic
└── Notification triggers
```

### 2.2 Repository Pattern

```
Each Repository handles:
├── Database queries (SELECT)
├── Create operations (INSERT)
├── Update operations (UPDATE)
├── Delete operations (DELETE/soft-delete)
├── Caching layer interaction
├── Query optimization
└── Error handling

Example: UserRepository
├── findById(id)
├── findByEmail(email)
├── findAll(filters)
├── create(data)
├── update(id, data)
├── delete(id)
└── softDelete(id)
```

---

## 3. Frontend File Organization Details

### 3.1 Component Structure

```
components/
├── common/          - Reusable UI components
├── layout/          - Layout containers
├── dashboard/       - Dashboard widgets
├── forms/           - Form components
├── tables/          - Data table components
├── modals/          - Modal dialogs
└── error/           - Error boundaries

Naming Convention:
├── Component file: PascalCase (.tsx)
├── Styles: kebab-case.css
├── Tests: ComponentName.test.tsx
└── Index files: Export components from folder
```

### 3.2 State Management

```
Redux Structure:
├── features/        - Feature slices
│   ├── auth/
│   ├── student/
│   ├── grade/
│   └── workflow/
├── common/          - Common reducers
│   ├── notification
│   └── modal
└── selectors/       - Memoized selectors
```

---

## 4. Configuration Files

### 4.1 Environment Variables

```
Backend (.env):
DATABASE_URL
SUPABASE_KEY
JWT_SECRET
JWT_EXPIRY
REFRESH_TOKEN_EXPIRY
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
REDIS_URL
MAIL_SERVICE
MAIL_API_KEY
NODE_ENV
LOG_LEVEL

Frontend (.env):
REACT_APP_API_URL
REACT_APP_LOG_LEVEL
REACT_APP_ENV
```

### 4.2 Configuration Hierarchy

```
Environment-Specific Configs:
├── config/database.ts
│   ├── database.config.development.ts
│   ├── database.config.production.ts
│   └── database.config.test.ts
│
├── config/auth.ts
│   ├── auth.config.development.ts
│   └── auth.config.production.ts
│
└── env validation
    └── Ensure all required vars present on startup
```

---

## 5. Documentation Organization

```
docs/
├── architecture/     - System architecture docs
├── database/        - Database schema & migrations
├── diagrams/        - Visual diagrams (Mermaid)
├── api/             - API documentation
├── deployment/      - Deployment guides
├── development/     - Developer setup guides
└── user/            - User/admin manuals
```

---

## 6. Testing Organization

```
Unit Tests
├── Location: src/[feature]/__tests__
├── Pattern: ComponentName.unit.test.ts
└── Scope: Single component/function

Integration Tests
├── Location: tests/integration/
├── Pattern: feature.integration.test.ts
└── Scope: Multiple components working together

E2E Tests
├── Location: tests/e2e/
├── Pattern: user-journey.e2e.test.ts
└── Scope: Full user workflows
```

---

## 7. Build Output Structure

```
After Build:
├── dist/            - Production build
│   ├── backend/
│   │   ├── index.js
│   │   ├── controllers/
│   │   ├── services/
│   │   └── models/
│   │
│   └── frontend/
│       ├── index.html
│       ├── js/
│       ├── css/
│       └── assets/

├── coverage/        - Test coverage reports
│   ├── index.html
│   ├── lcov.info
│   └── lcov-report/
```

---

## 8. Git Repository Structure

```
Branches:
├── main             - Production-ready code
├── develop          - Development integration branch
├── feature/*        - Feature branches
├── bugfix/*         - Bug fix branches
├── hotfix/*         - Hotfix branches
└── release/*        - Release branches

Tags:
├── v1.0.0          - Version releases
├── v1.0.0-beta.1   - Beta releases
└── v1.0.0-rc.1     - Release candidates

Commit Convention:
├── feat: new feature
├── fix: bug fix
├── docs: documentation
├── style: formatting
├── refactor: refactoring
└── test: testing
```

---

## 9. DevOps & Infrastructure

```
.docker/
├── Dockerfile.backend
├── Dockerfile.frontend
└── docker-compose.yml

kubernetes/ (if applicable)
├── deployments/
├── services/
├── configmaps/
└── secrets/

terraform/ (if applicable)
├── main.tf
├── variables.tf
├── outputs.tf
└── prod/
    ├── main.tf
    └── terraform.tfvars
```

---

## 10. Important Files

### Key Root Files

```
- README.md                  - Project overview
- CONTRIBUTING.md            - Contribution guidelines
- CHANGELOG.md               - Version history
- LICENSE                    - Project license
- Makefile                   - Common tasks
- docker-compose.yml         - Local dev environment
- .env.example              - Example environment variables
- .eslintrc.json            - Linting rules
- .prettierrc                - Code formatting
- .gitignore                - Git ignore patterns
```

---

## 11. Naming Conventions

### File Naming

```
React Components:      PascalCase.tsx
Utility Functions:     camelCase.ts
Constants:             UPPER_SNAKE_CASE.ts
Styles:                kebab-case.css or kebab-case.scss
Database Migrations:   001_description.ts
Tests:                 ComponentName.test.ts
                       ComponentName.spec.ts
```

### Directory Naming

```
- Always lowercase
- Hyphenated for multi-word: my-components
- Plural for collections: services, models, utils
- Singular for feature folders: feature-name
```

---

## 12. Size Constraints & Limits

```
Backend:
├── Max file upload: 100MB
├── Request body limit: 10MB
├── Database connection pool: 20-50
└── Redis memory: 2GB

Frontend:
├── Main bundle: < 500KB
├── CSS: < 100KB
├── Images: Optimized < 5MB per image
└── Total assets: < 50MB
```

