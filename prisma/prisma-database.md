# Prisma ORM Database Documentation

## Academic Department360 Dashboard - Prisma Implementation Guide

---

## Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Schema Overview](#schema-overview)
4. [Data Models](#data-models)
5. [Relationships](#relationships)
6. [Queries & Operations](#queries--operations)
7. [Migrations](#migrations)
8. [Seeding](#seeding)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

---

## Overview

This document describes the Prisma ORM implementation for the Academic Department360 Dashboard using PostgreSQL as the primary database.

### Key Features

- **Type-Safe Database Access**: Generated Prisma Client ensures type safety
- **Automatic Migrations**: Schema migrations with rollback support
- **Query Optimization**: Built-in query optimization and indexing
- **Scalability**: Supports 1000+ concurrent users with proper indexing
- **FERPA Compliance**: Audit logging for sensitive data access
- **Relationships Management**: Automatic relationship handling

### Tech Stack

```
Database: PostgreSQL 14+
ORM: Prisma 5.x
Client: Prisma Client JS
Database Driver: postgresql
```

---

## Installation & Setup

### 1. Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma prisma-client-js
npm install bcrypt  # For password hashing in seed
```

### 2. Initialize Prisma

```bash
npx prisma init
```

### 3. Configure Environment

Create `.env` file in project root:

```env
# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@localhost:5432/department360?schema=public&sslmode=prefer"

# Prisma Client Configuration
DATABASE_POOL_SIZE=20
DATABASE_POOL_MAX_IDLE_TIME=60

# Encryption Keys (for sensitive fields)
FIELD_ENCRYPTION_KEY="your-256-bit-base64-encoded-key"

# OneDrive Integration
ONEDRIVE_CLIENT_ID="your-client-id"
ONEDRIVE_CLIENT_SECRET="your-client-secret"
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Migrations

```bash
npx prisma migrate dev --name init
```

---

## Schema Overview

### File Structure

```
prisma/
├── schema.prisma          # Main schema definition
├── seed.ts               # Database seeding script
├── migrations/           # Migration history
│   ├── migration_lock.toml
│   └── [timestamp]_init/
│       └── migration.sql
└── README.md            # Prisma documentation
```

### Schema Statistics

| Metric | Value |
|--------|-------|
| Total Models | 34 |
| Relations | 50+ |
| Indexes | 60+ |
| Enums | 20+ |
| Total Fields | 200+ |

---

## Data Models

### Core User Management

#### **User Model**

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  passwordHash      String
  firstName         String
  lastName          String
  status            UserStatus
  isMfaEnabled      Boolean   @default(false)
  mfaMethod         MfaMethod?
  
  // Relations
  roles             UserRole[]
  auditLogs         AuditLog[]
  // ... more relations
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  ARCHIVED
}

enum MfaMethod {
  TOTP
  SMS
  EMAIL
  AUTHENTICATOR
}
```

**Queries:**

```typescript
// Find user by email
const user = await prisma.user.findUnique({
  where: { email: "user@department360.edu" },
  include: { roles: true }
});

// List all active users
const activeUsers = await prisma.user.findMany({
  where: { status: "ACTIVE" },
  take: 50,
  skip: 0
});

// Create new user
const newUser = await prisma.user.create({
  data: {
    email: "newuser@department360.edu",
    passwordHash: hashedPassword,
    firstName: "John",
    lastName: "Doe",
    status: "ACTIVE"
  }
});
```

#### **UserRole Model**

```prisma
model UserRole {
  id              String    @id @default(cuid())
  userId          String
  roleId          String
  departmentId    String?
  isPrimary       Boolean   @default(false)
  expiresAt       DateTime?
  
  // Relations
  user            User      @relation(fields: [userId], references: [id])
  role            Role      @relation(fields: [roleId], references: [id])
  department      Department? @relation(fields: [departmentId])
  
  @@unique([userId, roleId, departmentId])
}
```

**Queries:**

```typescript
// Assign role to user
const userRole = await prisma.userRole.create({
  data: {
    userId: "user-id",
    roleId: "faculty-role-id",
    departmentId: "math-dept-id",
    isPrimary: true
  }
});

// Get user's roles
const userRoles = await prisma.userRole.findMany({
  where: { userId: "user-id" },
  include: { role: true, department: true }
});

// Check if user has specific role
const hasRole = await prisma.userRole.findFirst({
  where: {
    userId: "user-id",
    role: { name: "faculty" }
  }
});
```

### Faculty & Student Models

#### **Faculty Model**

```prisma
model Faculty {
  id                String      @id @default(cuid())
  userId            String      @unique
  departmentId      String
  employeeId        String      @unique
  title             String?
  specialization    String?
  employmentStatus  EmploymentStatus
  tenureStatus      TenureStatus
  salaryAmount      Decimal?    @db.Decimal(10, 2)
  isActive          Boolean     @default(true)
  
  // Relations
  user              User        @relation(...)
  department        Department  @relation(...)
  classes           Class[]
  advisedStudents   Student[]
}
```

**Queries:**

```typescript
// Create faculty
const faculty = await prisma.faculty.create({
  data: {
    userId: "user-id",
    departmentId: "dept-id",
    employeeId: "FAC001",
    title: "Professor",
    specialization: "Calculus",
    employmentStatus: "FULL_TIME",
    tenureStatus: "TENURED"
  }
});

// Get faculty with their classes
const facultyWithClasses = await prisma.faculty.findUnique({
  where: { id: "faculty-id" },
  include: {
    user: true,
    department: true,
    classes: {
      include: { course: true, semester: true }
    }
  }
});

// List all faculty in department
const deptFaculty = await prisma.faculty.findMany({
  where: {
    departmentId: "dept-id",
    isActive: true
  },
  include: { user: true }
});
```

#### **Student Model**

```prisma
model Student {
  id                String      @id @default(cuid())
  userId            String      @unique
  studentId         String      @unique
  degreeProgram     String
  majorId           String
  enrollmentStatus  EnrollmentStatus
  currentGpa        Decimal?    @db.Decimal(4, 3)
  academicStanding  AcademicStanding
  creditsEarned     Int         @default(0)
  primaryAdvisorId  String?
  
  // Relations
  user              User        @relation(...)
  enrollments       Enrollment[]
  grades            Grade[]
  gradeAppeals      GradeAppeal[]
}
```

**Queries:**

```typescript
// Create student
const student = await prisma.student.create({
  data: {
    userId: "user-id",
    studentId: "STU001",
    degreeProgram: "BS-CS",
    majorId: "program-id",
    enrollmentStatus: "ENROLLED",
    enrollmentDate: new Date()
  }
});

// Get student with full profile
const studentProfile = await prisma.student.findUnique({
  where: { id: "student-id" },
  include: {
    user: true,
    enrollments: {
      include: {
        class: { include: { course: true } },
        grade: true
      }
    },
    gradeAppeals: true,
    primaryAdvisor: true
  }
});

// List students by academic standing
const probationStudents = await prisma.student.findMany({
  where: {
    academicStanding: "PROBATION"
  }
});
```

### Academic Structure

#### **Department Model**

```prisma
model Department {
  id                String      @id @default(cuid())
  code              String      @unique
  name              String      @unique
  departmentHeadId  String?     @unique
  isActive          Boolean     @default(true)
  
  // Relations
  departmentHead    Faculty?    @relation("head", ...)
  faculty           Faculty[]
  programs          Program[]
  courses           Course[]
}
```

#### **Program Model**

```prisma
model Program {
  id                      String      @id @default(cuid())
  departmentId            String
  code                    String
  name                    String
  degreeType              DegreeType
  totalCreditsRequired    Int?
  minimumGpa              Decimal     @db.Decimal(3, 2)
  accreditationStatus     String?
  
  // Relations
  department              Department  @relation(...)
  courses                 CourseProgram[]
  
  @@unique([departmentId, code])
}

enum DegreeType {
  BACHELOR
  MASTER
  PHD
  CERTIFICATE
}
```

#### **Course Model**

```prisma
model Course {
  id                  String      @id @default(cuid())
  departmentId        String
  courseCode          String
  courseNumber        Int
  title               String
  creditHours         Int         @default(3)
  prerequisites       String?
  isActive            Boolean     @default(true)
  
  // Relations
  department          Department  @relation(...)
  programs            CourseProgram[]
  classes             Class[]
  
  @@unique([departmentId, courseCode])
}
```

**Queries:**

```typescript
// Get department with all programs and courses
const dept = await prisma.department.findUnique({
  where: { code: "CS" },
  include: {
    programs: {
      include: {
        courses: {
          include: { course: true }
        }
      }
    },
    courses: true,
    faculty: { include: { user: true } }
  }
});

// List active programs
const programs = await prisma.program.findMany({
  where: { isActive: true },
  include: { department: true }
});

// Get course with prerequisites
const courseWithPrereqs = await prisma.course.findUnique({
  where: { id: "course-id" },
  include: {
    prerequisiteCourse: true,
    prerequisiteFor: true,
    programs: { include: { program: true } }
  }
});
```

#### **Class Model**

```prisma
model Class {
  id                  String      @id @default(cuid())
  courseId            String
  instructorId        String
  semesterId          String
  sectionNumber       Int
  enrollmentCapacity  Int
  currentEnrollment   Int         @default(0)
  deliveryMode        DeliveryMode
  
  // Relations
  course              Course      @relation(...)
  instructor          Faculty     @relation(...)
  semester            Semester    @relation(...)
  enrollments         Enrollment[]
  
  @@unique([courseId, semesterId, sectionNumber])
}

enum DeliveryMode {
  IN_PERSON
  ONLINE
  HYBRID
}
```

### Enrollment & Grading

#### **Enrollment Model**

```prisma
model Enrollment {
  id                String      @id @default(cuid())
  studentId         String
  classId           String
  semesterId        String
  enrollmentStatus  EnrollmentStatusEnum
  gradeLetter       String?
  gradePoints       Decimal?    @db.Decimal(3, 2)
  includeInGpa      Boolean     @default(true)
  transcriptStatus  TranscriptStatus
  
  // Relations
  student           Student     @relation(...)
  class             Class       @relation(...)
  semester          Semester    @relation(...)
  grade             Grade?
  
  @@unique([studentId, classId, semesterId])
}

enum EnrollmentStatusEnum {
  ENROLLED
  WAITLISTED
  DROPPED
  AUDIT
}

enum TranscriptStatus {
  PENDING
  POSTED
  HELD
}
```

**Queries:**

```typescript
// Enroll student in class
const enrollment = await prisma.enrollment.create({
  data: {
    studentId: "student-id",
    classId: "class-id",
    semesterId: "semester-id",
    enrollmentStatus: "ENROLLED"
  }
});

// Get student's current enrollments
const studentEnrollments = await prisma.enrollment.findMany({
  where: {
    studentId: "student-id",
    semester: { isActive: true }
  },
  include: {
    class: { include: { course: true } },
    grade: true
  }
});

// Get class enrollment list
const classRoster = await prisma.enrollment.findMany({
  where: { classId: "class-id" },
  include: {
    student: { include: { user: true } },
    grade: true
  },
  orderBy: { student: { user: { lastName: 'asc' } } }
});
```

#### **Grade Model**

```prisma
model Grade {
  id              String      @id @default(cuid())
  enrollmentId    String
  classId         String
  studentId       String
  gradeNumeric    Decimal?    @db.Decimal(5, 2)
  gradeLetter     String?
  gradePoints     Decimal?    @db.Decimal(3, 2)
  isDraft         Boolean     @default(true)
  isApproved      Boolean     @default(false)
  isFinal         Boolean     @default(false)
  submittedById    String?
  approvedById    String?
  
  // Relations
  enrollment      Enrollment  @relation(...)
  class           Class       @relation(...)
  student         Student     @relation(...)
  submittedBy     Faculty?    @relation("submittedByFaculty", ...)
  approvedBy      Faculty?    @relation("approvedByFaculty", ...)
}
```

**Queries:**

```typescript
// Submit grade
const grade = await prisma.grade.create({
  data: {
    enrollmentId: "enrollment-id",
    classId: "class-id",
    studentId: "student-id",
    gradeNumeric: 92,
    gradeLetter: "A",
    gradePoints: 4.0,
    isDraft: false,
    submittedById: "faculty-id"
  }
});

// Approve grades
const approvedGrade = await prisma.grade.update({
  where: { id: "grade-id" },
  data: {
    isApproved: true,
    isFinal: true,
    approvedById: "admin-id",
    approvedAt: new Date()
  }
});

// Get pending grade submissions
const pendingGrades = await prisma.grade.findMany({
  where: {
    isDraft: false,
    isApproved: false
  },
  include: {
    student: { include: { user: true } },
    class: { include: { course: true } }
  }
});

// Calculate student GPA
const studentGpa = await prisma.grade.aggregate({
  where: {
    studentId: "student-id",
    enrollment: { includeInGpa: true }
  },
  _avg: { gradePoints: true }
});
```

#### **Grade Appeal Model**

```prisma
model GradeAppeal {
  id                  String      @id @default(cuid())
  enrollmentId        String
  studentId           String
  gradeId             String
  appealReason        String
  appealStatus        AppealStatus
  facultyResponse     String?
  departmentReviewNotes String?
  
  // Relations
  enrollment          Enrollment  @relation(...)
  student             Student     @relation(...)
  grade               Grade       @relation("originalGrade", ...)
  facultyReviewer     Faculty?    @relation("facultyReviewerFaculty", ...)
  departmentReviewer  Faculty?    @relation("deptReviewerFaculty", ...)
}

enum AppealStatus {
  SUBMITTED
  IN_REVIEW
  APPROVED
  DENIED
  ESCALATED
}
```

### Workflow & Approval

#### **Workflow Model**

```prisma
model Workflow {
  id                String      @id @default(cuid())
  workflowType      WorkflowType
  status            WorkflowStatus
  relatedResourceType String?
  relatedResourceId String?
  initiatedById      String
  data              Json?
  
  // Relations
  initiatedBy       User        @relation("initiated", ...)
  approvals         WorkflowApproval[]
  
  @@index([workflowType, status])
}

enum WorkflowType {
  GRADE_SUBMISSION
  COURSE_ADDITION
  GRADE_APPEAL
  LEAVE_REQUEST
  CURRICULUM_CHANGE
  ACADEMIC_STANDING_CHANGE
}

enum WorkflowStatus {
  DRAFT
  SUBMITTED
  IN_REVIEW
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
}
```

#### **WorkflowApproval Model**

```prisma
model WorkflowApproval {
  id                String      @id @default(cuid())
  workflowId        String
  approvalLevel     Int
  assignedToId      String
  approvalStatus    ApprovalStatus
  dueDate           DateTime?
  
  // Relations
  workflow          Workflow    @relation(...)
  assignedTo        User        @relation("assigned", ...)
  
  @@unique([workflowId, approvalLevel])
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  ESCALATED
  REASSIGNED
}
```

**Queries:**

```typescript
// Create workflow
const workflow = await prisma.workflow.create({
  data: {
    workflowType: "GRADE_SUBMISSION",
    status: "SUBMITTED",
    initiatedById: "faculty-id",
    data: {
      courseCode: "CS-1100",
      semester: "Spring 2024"
    }
  }
});

// Get pending approvals for user
const pendingApprovals = await prisma.workflowApproval.findMany({
  where: {
    assignedToId: "user-id",
    approvalStatus: "PENDING",
    dueDate: { gte: new Date() }
  },
  include: {
    workflow: true
  },
  orderBy: { dueDate: 'asc' }
});

// Approve workflow
const approval = await prisma.workflowApproval.update({
  where: { id: "approval-id" },
  data: {
    approvalStatus: "APPROVED",
    responseDate: new Date(),
    comments: "Approved"
  }
});

// Complete workflow
const completedWorkflow = await prisma.workflow.update({
  where: { id: "workflow-id" },
  data: {
    status: "COMPLETED",
    completedById: "user-id",
    completedAt: new Date()
  }
});
```

### Audit & Logging

#### **AuditLog Model**

```prisma
model AuditLog {
  id              String      @id @default(cuid())
  userId          String?
  action          String
  resourceType    String?
  resourceId      String?
  oldValues       Json?
  newValues       Json?
  ipAddress       String?
  userAgent       String?
  ferpaProtected  Boolean     @default(false)
  studentId       String?
  severity        Severity    @default(INFO)
  createdAt       DateTime    @default(now())
  
  // Relations
  user            User?       @relation(...)
  student         Student?    @relation(...)
  
  @@index([createdAt, userId])
  @@index([ferpaProtected, severity])
}

enum Severity {
  INFO
  WARNING
  ERROR
  CRITICAL
}
```

**Queries:**

```typescript
// Log user action
const auditLog = await prisma.auditLog.create({
  data: {
    userId: "user-id",
    action: "GRADE_SUBMITTED",
    resourceType: "Grade",
    resourceId: "grade-id",
    newValues: {
      gradeLetter: "A",
      gradeNumeric: 92
    },
    severity: "INFO",
    ferpaProtected: true,
    studentId: "student-id"
  }
});

// Query audit trail for student (FERPA compliance)
const studentAuditTrail = await prisma.auditLog.findMany({
  where: {
    studentId: "student-id",
    ferpaProtected: true
  },
  orderBy: { createdAt: 'desc' },
  take: 100
});

// Get critical actions
const criticalActions = await prisma.auditLog.findMany({
  where: {
    severity: "CRITICAL"
  },
  orderBy: { createdAt: 'desc' }
});
```

---

## Relationships

### Relationship Types

| From | To | Type | Description |
|------|-----|---------|-------------|
| User | UserRole | 1:Many | User has multiple roles |
| User | AuditLog | 1:Many | User actions logged |
| Department | Faculty | 1:Many | Department has many faculty |
| Faculty | Class | 1:Many | Faculty teaches multiple classes |
| Student | Enrollment | 1:Many | Student enrolls in courses |
| Course | Class | 1:Many | Course has multiple sections |
| Enrollment | Grade | 1:1 | Each enrollment has one final grade |
| Workflow | WorkflowApproval | 1:Many | Workflow has multiple approvals |

### Cascade Rules

```prisma
// CASCADE on DELETE
- Enrollment → Grade (when enrollment deleted, grades deleted)
- Workflow → WorkflowApproval (when workflow deleted, approvals deleted)
- CourseProgram (when course/program deleted)

// RESTRICT on DELETE
- User ← Faculty (cannot delete user if faculty record exists)
- User ← Student (cannot delete user if student record exists)

// SET NULL on DELETE
- Department.departmentHeadId ← Faculty
- Student.primaryAdvisorId ← Faculty
```

---

## Queries & Operations

### Best Practices

#### 1. **Use Includes for Related Data**

```typescript
// ✅ Good - Load related data in one query
const student = await prisma.student.findUnique({
  where: { id: "student-id" },
  include: {
    enrollments: {
      include: {
        class: { include: { course: true } },
        grade: true
      }
    }
  }
});

// ❌ Avoid - Multiple database queries (N+1 problem)
const student = await prisma.student.findUnique({
  where: { id: "student-id" }
});
const enrollments = await prisma.enrollment.findMany({
  where: { studentId: student.id }
});
```

#### 2. **Use Where Filters**

```typescript
// Filter by multiple conditions
const students = await prisma.student.findMany({
  where: {
    enrollmentStatus: "ENROLLED",
    academicStanding: "PROBATION",
    enrollmentDate: {
      gte: new Date("2023-08-01")
    }
  }
});

// OR conditions
const students = await prisma.student.findMany({
  where: {
    OR: [
      { academicStanding: "PROBATION" },
      { academicStanding: "SUSPENSION" }
    ]
  }
});
```

#### 3. **Use Pagination**

```typescript
// Paginate results
const pageSize = 20;
const page = 1;
const students = await prisma.student.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
  orderBy: { user: { lastName: 'asc' } }
});

// Get total count
const total = await prisma.student.count();
```

#### 4. **Use Select for Performance**

```typescript
// Select only needed fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    studentId: true,
    currentGpa: true,
    user: {
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    }
  },
  take: 50
});
```

#### 5. **Use Transactions**

```typescript
// Transaction for multiple related operations
const result = await prisma.$transaction(async (tx) => {
  // Create grade
  const grade = await tx.grade.create({
    data: {
      enrollmentId: "enrollment-id",
      // ... other fields
    }
  });

  // Update enrollment
  await tx.enrollment.update({
    where: { id: "enrollment-id" },
    data: {
      gradeId: grade.id,
      transcriptStatus: "POSTED"
    }
  });

  // Create audit log
  await tx.auditLog.create({
    data: {
      action: "GRADE_POSTED",
      resourceId: grade.id
    }
  });

  return grade;
});
```

### Common Queries

```typescript
// Get all classes for a faculty member
const facultyClasses = await prisma.class.findMany({
  where: { instructorId: "faculty-id" },
  include: {
    course: true,
    semester: true,
    enrollments: { include: { student: true } }
  }
});

// Get grades for grade submission
const gradesToSubmit = await prisma.grade.findMany({
  where: {
    isDraft: false,
    isApproved: false,
    class: { instructorId: "faculty-id" }
  },
  include: {
    enrollment: true,
    student: { include: { user: true } }
  }
});

// Calculate semester GPA for student
const semesterGpa = await prisma.grade.aggregate({
  where: {
    studentId: "student-id",
    enrollment: {
      semesterId: "semester-id",
      includeInGpa: true
    }
  },
  _avg: { gradePoints: true }
});

// Get accreditation evidence
const evidence = await prisma.accreditationEvidence.findMany({
  where: {
    accreditation: { programId: "program-id" },
    status: "PENDING_REVIEW"
  },
  include: { accreditation: true }
});
```

---

## Migrations

### Create Migrations

```bash
# After modifying schema.prisma, create migration
npx prisma migrate dev --name <migration_name>

# Example: Add new field
npx prisma migrate dev --name add_office_hours_to_faculty

# Create migration without running it
npx prisma migrate dev --name <name> --create-only
```

### Apply Migrations

```bash
# Apply pending migrations
npx prisma migrate deploy

# Reset database (⚠️ destructive)
npx prisma migrate reset

# Resolve migration conflicts
npx prisma migrate resolve --rolled-back "<migration_name>"
```

### Migration Workflow

```bash
# Development
1. Modify schema.prisma
2. npx prisma migrate dev --name descriptive_name
3. Test changes
4. Commit migration files

# Production
1. npx prisma migrate deploy
2. Verify schema
3. Run data migrations if needed
```

---

## Seeding

### Seed Database

```bash
# Run seed script
npx prisma db seed

# What gets seeded:
# - 6 roles (system_admin, department_head, faculty, etc.)
# - 12 permissions
# - System admin user
# - 2 departments (Math, Computer Science)
# - 2 faculty members
# - 2 degree programs
# - 3 courses
# - 2 semesters
# - 2 classes
# - 2 students
# - 3 enrollments
# - 2 grades
# - 1 workflow + approval
# - Accreditation records
# - Sample tasks, audit logs
# - System settings
```

### Configure Seed

In `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Custom Seeding

```typescript
// Add to seed.ts for custom data
const customData = await prisma.course.create({
  data: {
    departmentId: "dept-id",
    courseCode: "CUSTOM-101",
    courseNumber: 101,
    title: "Custom Course",
    creditHours: 3
  }
});
```

---

## Performance Optimization

### 1. Indexing Strategy

```prisma
// Already configured in schema.prisma
@@index([userId])          // Fast lookups
@@index([createdAt])       // Time-range queries
@@unique([email])          // Unique constraints
@@index([status, deleted])  // Composite indexes
```

### 2. Query Optimization

```typescript
// ✅ Optimized - Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    firstName: true
  },
  take: 100
});

// ❌ Non-optimized - Load all fields
const users = await prisma.user.findMany({
  take: 100
});
```

### 3. Connection Pooling

```env
# In .env
DATABASE_URL="postgresql://user:password@localhost:5432/department360?schema=public&poolSize=20&sslmode=prefer"
```

### 4. Query Complexity Limits

```typescript
// Limit nested queries
const student = await prisma.student.findUnique({
  where: { id: "student-id" },
  include: {
    enrollments: {
      take: 20,  // Limit enrollments
      include: {
        class: { include: { course: true } }
      }
    }
  }
});
```

### 5. Caching Strategy

```typescript
// Cache frequently accessed data
const cacheKey = `student:${studentId}:profile`;
let student = await redis.get(cacheKey);

if (!student) {
  student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { enrollments: true }
  });
  await redis.setex(cacheKey, 3600, JSON.stringify(student));
}
```

---

## Security Considerations

### 1. Input Validation

```typescript
// Always validate inputs before database operations
const { email, firstName } = req.body;

if (!email || !validator.isEmail(email)) {
  throw new Error("Invalid email");
}

if (!firstName || firstName.length < 2) {
  throw new Error("Invalid first name");
}

const user = await prisma.user.create({ data: { email, firstName } });
```

### 2. Authentication & Authorization

```typescript
// Check user permissions before operations
async function updateGrade(gradeId: string, userId: string, data: any) {
  // Verify user is faculty
  const user = await prisma.userRole.findFirst({
    where: {
      userId: userId,
      role: { name: "faculty" }
    }
  });

  if (!user) throw new Error("Unauthorized");

  return prisma.grade.update({
    where: { id: gradeId },
    data
  });
}
```

### 3. Field-Level Encryption

```typescript
// Sensitive fields (salaryAmount, etc.) should be encrypted
import crypto from 'crypto';

function encryptField(value: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  return iv.toString('hex') + ':' + cipher.update(value).toString('hex');
}
```

### 4. FERPA Compliance

```typescript
// Log all access to student records
async function getStudentData(studentId: string, userId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { user: true }
  });

  // Log access
  await prisma.auditLog.create({
    data: {
      userId,
      action: "VIEW_STUDENT_RECORD",
      resourceType: "Student",
      resourceId: studentId,
      ferpaProtected: true,
      studentId,
      severity: "INFO"
    }
  });

  return student;
}
```

### 5. SQL Injection Prevention

```typescript
// ✅ Safe - Parameterized queries (Prisma default)
const users = await prisma.user.findMany({
  where: { email: userInput }
});

// ❌ Unsafe - String concatenation (Never do this)
// const users = await db.query(`SELECT * FROM users WHERE email = '${userInput}'`);
```

---

## Troubleshooting

### Issue: "Prisma Client not generated"

```bash
npx prisma generate
```

### Issue: Migration conflicts

```bash
npx prisma migrate resolve --rolled-back "<migration_name>"
npx prisma migrate deploy
```

### Issue: Schema drift

```bash
# Check for differences
npx prisma db pull

# Reset and resync
npx prisma migrate reset
```

### Issue: Slow queries

```typescript
// Enable query logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
  ],
});

prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', e.duration, 'ms');
});
```

---

## CLI Commands Reference

```bash
# Migrations
npx prisma migrate dev              # Create and apply migration
npx prisma migrate deploy           # Apply migrations in production
npx prisma migrate status           # Show migration status
npx prisma migrate resolve          # Resolve stuck migrations
npx prisma migrate reset            # Reset database

# Database
npx prisma db push                  # Push schema changes
npx prisma db pull                  # Sync from database
npx prisma db seed                  # Run seed script

# Client
npx prisma generate                 # Generate Prisma Client
npx prisma studio                   # Open Prisma Studio (GUI)

# Formatting
npx prisma format                   # Format schema.prisma
```

---

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Prisma Schema](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/sql-best-practices.html)

---

**Generated for: Academic Department360 Dashboard**  
**Database: PostgreSQL 14+**  
**ORM: Prisma 5.x**  
**Last Updated: 2024**
