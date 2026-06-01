# Prisma ORM - Academic Department360 Dashboard

Complete Prisma ORM setup for Academic Department360 Dashboard using PostgreSQL.

## 📋 Contents

- `schema.prisma` - Complete database schema definition (34 models)
- `seed.ts` - Database seeding script with sample data
- `prisma-database.md` - Comprehensive Prisma documentation
- `.env.example` - Environment configuration template
- `migrations/` - Database migration history

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @prisma/client
npm install -D prisma prisma-client-js ts-node @types/node
npm install bcrypt  # For password hashing
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

Example `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/department360?schema=public"
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Run Migrations

```bash
# Create and apply initial migration
npx prisma migrate dev --name init
```

### 5. Seed Database

```bash
# Add seed command to package.json
npm run prisma:seed

# Or manually
npx prisma db seed
```

### 6. Verify Setup

```bash
# Open Prisma Studio to view data
npx prisma studio
```

## 📊 Database Schema

### Models (34 total)

#### Core User Management
- `User` - User accounts
- `UserRole` - User role assignments
- `Role` - System roles
- `Permission` - System permissions
- `RolePermission` - Role-permission mapping

#### Faculty & Students
- `Faculty` - Faculty member profiles
- `Student` - Student profiles
- `AdminOperation` - Admin staff assignments

#### Academic Structure
- `Department` - Academic departments
- `Program` - Degree programs
- `Course` - Course definitions
- `CourseProgram` - Course-program mapping
- `Class` - Course sections/instances

#### Enrollment & Grading
- `Enrollment` - Student course enrollments
- `Grade` - Student grades
- `GradeAppeal` - Grade appeal process

#### Workflow & Approvals
- `Workflow` - Workflow instances
- `WorkflowApproval` - Individual approval steps

#### Reference Data
- `Semester` - Academic terms/semesters
- `AuditLog` - Audit trail
- `SystemSetting` - System configuration
- `ApiKey` - API authentication keys

#### Accreditation & Evidence
- `Accreditation` - Program accreditation records
- `AccreditationEvidence` - Accreditation evidence documents

#### Task Management
- `Task` - Task tracking

#### Documents
- `Document` - Uploaded documents

## 🔑 Key Features

### 1. Type Safety

```typescript
// Full TypeScript support with generated types
const user: User = await prisma.user.findUnique({...});
const students: Student[] = await prisma.student.findMany({...});
```

### 2. Relationships

```typescript
// Automatic relationship loading
const faculty = await prisma.faculty.findUnique({
  where: { id: "faculty-id" },
  include: {
    classes: { include: { course: true } },
    advisedStudents: true
  }
});
```

### 3. Transactions

```typescript
// Atomic operations
const result = await prisma.$transaction(async (tx) => {
  const grade = await tx.grade.create({...});
  await tx.enrollment.update({...});
  await tx.auditLog.create({...});
  return grade;
});
```

### 4. Query Optimization

```typescript
// Only select needed fields
const students = await prisma.student.findMany({
  select: {
    id: true,
    studentId: true,
    user: { select: { firstName: true, lastName: true } }
  }
});
```

## 📈 Database Statistics

| Metric | Value |
|--------|-------|
| Total Models | 34 |
| Total Relations | 50+ |
| Total Indexes | 60+ |
| Total Enums | 20+ |
| Total Fields | 200+ |
| Support for Concurrent Users | 1000+ |

## 📋 Common Tasks

### Create New User

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'john.doe@department360.edu',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      roles: {
        create: {
          roleId: '...', // faculty role id
          isPrimary: true
        }
      }
    }
  });
  
  return user;
}
```

### Enroll Student

```typescript
async function enrollStudent(studentId: string, classId: string, semesterId: string) {
  const enrollment = await prisma.enrollment.create({
    data: {
      studentId,
      classId,
      semesterId,
      enrollmentStatus: 'ENROLLED'
    }
  });
  
  return enrollment;
}
```

### Submit Grade

```typescript
async function submitGrade(enrollmentId: string, gradeData: any) {
  const grade = await prisma.grade.create({
    data: {
      enrollmentId,
      classId: gradeData.classId,
      studentId: gradeData.studentId,
      gradeNumeric: gradeData.numeric,
      gradeLetter: gradeData.letter,
      gradePoints: gradeData.points,
      isDraft: false,
      submittedById: gradeData.facultyId
    }
  });
  
  return grade;
}
```

### Get Student Courses

```typescript
async function getStudentEnrollments(studentId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      class: {
        include: {
          course: true,
          instructor: { include: { user: true } }
        }
      },
      grade: true
    }
  });
  
  return enrollments;
}
```

### Approve Workflow

```typescript
async function approveWorkflow(workflowId: string, approvalLevel: number) {
  const approval = await prisma.workflowApproval.update({
    where: {
      workflowId_approvalLevel: {
        workflowId,
        approvalLevel
      }
    },
    data: {
      approvalStatus: 'APPROVED',
      responseDate: new Date()
    }
  });
  
  return approval;
}
```

## 🔒 Security Features

### Field-Level Encryption
- Salary information
- Emergency contact details
- Medical/health information
- Financial data

### FERPA Compliance
- Audit logging for student record access
- Access control based on user roles
- 7-year retention for audit logs

### Authentication
- Password hashing with bcrypt
- JWT token support
- Multi-Factor Authentication (MFA)

## 🗄️ Database Connection

### Connection String Format

```
postgresql://[user[:password]@][netloc][:port][/dbname][?param1=value1&...]
```

### Connection Options

```
?schema=public              # Schema name
&sslmode=prefer            # SSL mode
&poolSize=20               # Connection pool size
&sslrootcert=/path/to/ca  # CA certificate (cloud databases)
```

### Examples

#### Local Development
```
postgresql://postgres:password@localhost:5432/department360
```

#### AWS RDS
```
postgresql://admin:password@mydb.c123.us-east-1.rds.amazonaws.com:5432/department360?sslmode=require
```

#### Heroku PostgreSQL
```
postgresql://user:password@ec2-123-45-67-89.compute-1.amazonaws.com:5432/database?sslmode=require
```

## 📝 Migrations

### Create New Migration

```bash
# After modifying schema.prisma
npx prisma migrate dev --name add_new_field

# Review generated SQL
cat prisma/migrations/[timestamp]_add_new_field/migration.sql
```

### Apply Migrations (Production)

```bash
# Deploy pending migrations
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### Rollback Migration (Development Only)

```bash
# Reset database and re-run migrations
npx prisma migrate reset
```

## 🌱 Seeding

### Run Seed

```bash
# Run seed script
npx prisma db seed

# Or via npm script
npm run db:seed
```

### Seed Data Includes

- 6 system roles (System Admin, Department Head, Faculty, etc.)
- 12 permissions across system resources
- System admin user
- 2 departments (Mathematics, Computer Science)
- 2 faculty members
- 2 degree programs (BS Math, BS CS)
- 3 courses with prerequisites
- 2 academic semesters
- 2 course sections
- 2 students with enrollments
- 2 grades with approvals
- 1 workflow with approval
- Accreditation records
- Sample tasks and audit logs
- System configuration settings

## 🎯 Performance

### Optimization Tips

1. **Use Indexes** - Already configured in schema.prisma
2. **Select Specific Fields** - Reduce data transfer
3. **Limit Query Results** - Use pagination with take/skip
4. **Connection Pooling** - Use appropriate pool size
5. **Cache Results** - Implement Redis caching for frequently accessed data

### Connection Pool Configuration

```env
# For production: Higher pool size
DATABASE_URL="postgresql://...?poolSize=30&poolTimeout=45"

# For serverless: Lower pool size
DATABASE_URL="postgresql://...?poolSize=5&poolTimeout=10"
```

## 📚 Studio & Tools

### Prisma Studio

```bash
# Open web-based database GUI
npx prisma studio

# Accessible at: http://localhost:5555
```

### Generate Types

```bash
# Generate TypeScript types
npx prisma generate

# Types available in: node_modules/@prisma/client
```

### Format Schema

```bash
# Auto-format schema.prisma
npx prisma format
```

## 🔧 Troubleshooting

### Issue: "connect ECONNREFUSED"

```bash
# Check database is running
psql --version

# Verify connection string
echo $DATABASE_URL
```

### Issue: "SSL mode requires sslmode parameter"

```env
# Add SSL parameter to connection string
DATABASE_URL="postgresql://...?sslmode=require"
```

### Issue: "Migration locked"

```bash
# Reset migration state
npx prisma migrate resolve --rolled-back "<migration_name>"
```

### Issue: "Prisma Client not generated"

```bash
# Regenerate client
npx prisma generate
```

## 📖 Documentation Links

- [Prisma Docs](https://www.prisma.io/docs)
- [Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Client Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference)

## 🛠️ CLI Shortcuts

Add to `package.json`:

```json
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:deploy": "prisma migrate deploy",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset",
    "db:generate": "prisma generate",
    "db:format": "prisma format"
  }
}
```

Usage:
```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

---

## 📞 Support

For issues or questions:
1. Check [prisma-database.md](./prisma-database.md) for detailed documentation
2. Review [Prisma documentation](https://www.prisma.io/docs)
3. Check PostgreSQL logs for database errors
4. Verify `.env` configuration

---

**Last Updated**: 2024  
**Prisma Version**: 5.x  
**PostgreSQL Version**: 14+  
**Node.js Version**: 18+
