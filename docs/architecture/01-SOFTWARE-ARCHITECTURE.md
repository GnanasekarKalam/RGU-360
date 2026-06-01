# Software Architecture - Academic Department360 Dashboard

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Web/Mobile)                     │
│                   React + TypeScript Frontend                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & REVERSE PROXY                   │
│              Load Balancing, Rate Limiting, Auth Check           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Microservices / REST API Endpoints                       │  │
│  │ • Auth Service                                           │  │
│  │ • Faculty Service                                        │  │
│  │ • Student Service                                        │  │
│  │ • Course Service                                         │  │
│  │ • Academic Planning Service                              │  │
│  │ • Analytics Service                                      │  │
│  │ • Workflow Service                                       │  │
│  │ • Document Service (OneDrive Integration)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────┬──────────────────┬────────────────────────┐
│  DATA LAYER      │  CACHE LAYER     │  EXTERNAL SERVICES    │
│ PostgreSQL       │  Redis           │ OneDrive/SharePoint   │
│ (Supabase)       │  In-Memory Cache │ OAuth 2.0 Provider    │
│                  │                  │ Email Service         │
└──────────────────┴──────────────────┴────────────────────────┘
```

## 2. Architectural Patterns

### 2.1 Layered Architecture
- **Presentation Layer**: React components, UI logic, state management (Redux/Context)
- **Business Logic Layer**: Service classes, validators, business rules
- **Data Access Layer**: Repository pattern, ORM models (Sequelize/Prisma)
- **Database Layer**: PostgreSQL with Supabase

### 2.2 Microservices Pattern (Optional Scalability)
- Separate services for distinct domains
- Communication via REST APIs and event-driven messaging
- Service mesh for inter-service communication (future)

### 2.3 RBAC (Role-Based Access Control)
- Permission checks at API gateway level
- Fine-grained permissions at service level
- Middleware-based authorization

### 2.4 Event-Driven Architecture
- Workflow events trigger cascade actions
- Grade submission events trigger notifications
- Enrollment events trigger document generation

## 3. Component Architecture

### 3.1 Frontend Components Hierarchy

```
App (Root)
├── Layout
│   ├── Header (Navigation, User Menu)
│   ├── Sidebar (Role-based Navigation)
│   └── Footer
├── Pages
│   ├── Dashboard (Role-specific dashboard)
│   ├── Faculty
│   │   ├── FacultyList
│   │   ├── FacultyDetail
│   │   └── FacultyForm
│   ├── Students
│   │   ├── StudentList
│   │   ├── StudentDetail
│   │   ├── AcademicProgress
│   │   └── GradeBook
│   ├── Courses
│   │   ├── CourseList
│   │   ├── CourseDetail
│   │   ├── ClassSchedule
│   │   └── Enrollment
│   ├── AcademicPlanning
│   │   ├── DegreeAudit
│   │   ├── CurriculumMap
│   │   └── PrerequisiteChain
│   ├── Analytics
│   │   ├── PerformanceAnalytics
│   │   ├── EnrollmentTrends
│   │   └── CustomReports
│   ├── Workflows
│   │   ├── ApprovalQueue
│   │   └── WorkflowHistory
│   ├── Documents
│   │   ├── OneDriveExplorer
│   │   ├── UploadManager
│   │   └── DocumentLibrary
│   ├── Administration
│   │   ├── UserManagement
│   │   ├── SystemSettings
│   │   └── AuditLogs
│   └── Settings
│       ├── UserProfile
│       ├── Preferences
│       └── Security

State Management (Redux/Context)
├── Auth Context
├── User Context
├── App State
└── Notification Context

Services
├── API Client (Axios wrapper)
├── Auth Service
├── Storage Service
└── Notification Service
```

### 3.2 Backend Services Architecture

```
API Server (Node.js/Express)
│
├── Middleware Layer
│   ├── Authentication (JWT validation)
│   ├── Authorization (RBAC)
│   ├── Error Handling
│   ├── Logging
│   └── Request Validation
│
├── Routes
│   ├── /api/auth/*
│   ├── /api/faculty/*
│   ├── /api/students/*
│   ├── /api/courses/*
│   ├── /api/academic-planning/*
│   ├── /api/analytics/*
│   ├── /api/workflows/*
│   ├── /api/documents/*
│   └── /api/admin/*
│
├── Services
│   ├── AuthService (JWT, OAuth, MFA)
│   ├── FacultyService
│   ├── StudentService
│   ├── CourseService
│   ├── AcademicPlanningService
│   ├── AnalyticsService
│   ├── WorkflowService
│   ├── DocumentService
│   └── NotificationService
│
├── Repositories (Data Access Objects)
│   ├── UserRepository
│   ├── FacultyRepository
│   ├── StudentRepository
│   ├── CourseRepository
│   └── EnrollmentRepository
│
├── Models
│   ├── User
│   ├── Faculty
│   ├── Student
│   ├── Course
│   ├── Enrollment
│   ├── Grade
│   ├── WorkflowApproval
│   └── AuditLog
│
└── Utilities
    ├── Email Sender
    ├── PDF Generator
    ├── Excel Exporter
    └── Validators
```

## 4. Data Flow Architecture

### 4.1 User Authentication Flow
```
User Login
    ↓
Frontend: Send credentials
    ↓
Backend: Validate credentials (Supabase Auth)
    ↓
Backend: Generate JWT token
    ↓
Frontend: Store JWT in secure storage
    ↓
Frontend: Add JWT to Authorization header for API calls
    ↓
Backend: Validate JWT on each request
    ↓
Backend: Load user permissions and RBAC rules
```

### 4.2 Grade Submission & Approval Flow
```
Faculty submits grades
    ↓
Backend: Validate grade data
    ↓
Database: Store draft grades
    ↓
Trigger: Create workflow approval task
    ↓
Notification: Department Head receives approval notification
    ↓
Department Head: Reviews and approves/rejects
    ↓
Backend: Update grade status
    ↓
Notification: Faculty and Student receive confirmation
    ↓
Database: Log audit trail
```

### 4.3 Analytics Query Flow
```
Frontend: User requests analytics
    ↓
Backend: Check cache (Redis)
    ↓
If cached: Return cached data (expires in 1 hour)
    ↓
If not cached: Query database
    ↓
Backend: Transform data for visualization
    ↓
Backend: Cache transformed data
    ↓
Frontend: Display analytics
```

## 5. Security Architecture

### 5.1 Security Layers
1. **Network Layer**: HTTPS/TLS, API Gateway rate limiting
2. **Authentication Layer**: JWT, MFA, Session management
3. **Authorization Layer**: RBAC, permission checks
4. **Data Layer**: Encryption at rest, field-level encryption for sensitive data
5. **Audit Layer**: Comprehensive logging of all access

### 5.2 Data Protection
- Sensitive fields encrypted at database level
- PII masked in logs
- Automatic session expiration (30 mins idle)
- Refresh token rotation

## 6. Integration Architecture

### 6.1 OneDrive Integration
- OAuth 2.0 authentication
- Graph API for file operations
- Webhook for document changes
- Automatic syncing of course materials

### 6.2 External Systems
- Student Information System (SIS) API integration
- Email system for notifications
- Analytics platform for advanced reporting

## 7. Performance Optimization Strategy

### 7.1 Frontend
- Code splitting and lazy loading
- Image optimization and compression
- Caching strategies (service workers)
- Virtual scrolling for large lists

### 7.2 Backend
- Query optimization with indexing
- Connection pooling
- Caching layer (Redis)
- Database replication for read-heavy operations

### 7.3 Infrastructure
- CDN for static assets
- Load balancing across multiple servers
- Auto-scaling based on demand

## 8. Deployment Architecture

```
┌────────────────────────────────────────────┐
│         Cloud Platform (AWS/Azure)         │
├────────────────────────────────────────────┤
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Load Balancer (Traffic Distribution) │ │
│  └──────────────────────────────────────┘ │
│              ↓                             │
│  ┌──────────────────────────────────────┐ │
│  │  API Servers (Auto-scaling group)    │ │
│  │  • Server 1                          │ │
│  │  • Server 2                          │ │
│  │  • Server 3 (scales up/down)         │ │
│  └──────────────────────────────────────┘ │
│              ↓                             │
│  ┌──────────────────────────────────────┐ │
│  │  Data Layer                          │ │
│  │  • PostgreSQL Primary (RW)           │ │
│  │  • PostgreSQL Replica (RO)           │ │
│  │  • Redis Cache                       │ │
│  └──────────────────────────────────────┘ │
│              ↓                             │
│  ┌──────────────────────────────────────┐ │
│  │  External Services                   │ │
│  │  • OneDrive/SharePoint               │ │
│  │  • Email Service                     │ │
│  │  • Logging Service                   │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

## 9. Technology Choices Rationale

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Database | PostgreSQL (Supabase) | ACID compliance, complex queries, RBAC support, scalability |
| Backend | Node.js + Express | Fast development, vast ecosystem, real-time capabilities |
| Frontend | React + TypeScript | Type safety, component reusability, large community |
| Authentication | Supabase Auth + JWT | Built-in OAuth, MFA support, no vendor lock-in |
| Real-time | WebSockets (Socket.io) | Live updates, notifications, collaboration features |
| Caching | Redis | High performance, distributed caching, session store |
| File Storage | OneDrive | Enterprise integration, compliance, versioning |
| Hosting | Cloud (AWS/Azure) | Scalability, reliability, managed services |

---

## 10. Scalability Considerations

- **Horizontal Scaling**: Multiple API server instances behind load balancer
- **Database Scaling**: Read replicas for reporting, connection pooling
- **Cache Scaling**: Distributed Redis cluster for high traffic
- **CDN**: Static assets served from CDN edge locations
- **Microservices Ready**: Architecture designed to support service decomposition

---

## 11. High Availability & Disaster Recovery

- **Multi-AZ Deployment**: Data replicated across availability zones
- **Automated Failover**: Database replication with automatic promotion
- **Backup Strategy**: 
  - Hourly incremental backups
  - Daily full backups retained for 30 days
  - Weekly backup retention for 90 days
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 1 hour

