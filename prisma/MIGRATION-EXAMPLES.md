// Migration Examples for Academic Department360 Dashboard
// These examples show how to handle common schema changes with Prisma

// ============================================================================
// EXAMPLE 1: Add New Field to Faculty
// ============================================================================

/*
// Step 1: Modify schema.prisma
model Faculty {
  // ... existing fields
  // NEW FIELD: Research Interests
  researchInterests    String[]    @default([])
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_research_interests_to_faculty

// Step 3: Generated migration SQL will include:
ALTER TABLE "Faculty" ADD COLUMN "researchInterests" TEXT[] DEFAULT '{}';

// Step 4: Use in application
const faculty = await prisma.faculty.update({
  where: { id: 'faculty-id' },
  data: {
    researchInterests: ['Machine Learning', 'Data Science']
  }
});
*/

// ============================================================================
// EXAMPLE 2: Create New Table for Library Integration
// ============================================================================

/*
// Step 1: Add to schema.prisma
model LibraryResource {
  id                String      @id @default(cuid())
  isbn              String      @unique
  title             String
  author            String
  publicationYear   Int?
  quantity          Int         @default(1)
  available         Int         @default(1)
  subject           String[]
  createdAt         DateTime    @default(now())
  
  // Relations
  checkouts         LibraryCheckout[]
  
  @@index([isbn])
  @@index([subject])
}

model LibraryCheckout {
  id                String      @id @default(cuid())
  resourceId        String
  studentId         String
  checkoutDate      DateTime    @default(now())
  dueDate           DateTime
  returnDate        DateTime?
  isOverdue         Boolean     @default(false)
  
  // Relations
  resource          LibraryResource @relation(fields: [resourceId], references: [id])
  student           Student     @relation(fields: [studentId], references: [id])
  
  @@unique([resourceId, studentId, checkoutDate])
}

// Step 2: Create migration
$ npx prisma migrate dev --name create_library_management

// Step 3: Query usage
const checkout = await prisma.libraryCheckout.create({
  data: {
    resourceId: 'resource-id',
    studentId: 'student-id',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  }
});

const overdue = await prisma.libraryCheckout.findMany({
  where: {
    dueDate: { lt: new Date() },
    returnDate: null
  },
  include: { resource: true, student: { include: { user: true } } }
});
*/

// ============================================================================
// EXAMPLE 3: Rename Field
// ============================================================================

/*
// Step 1: In schema.prisma, rename field
model Course {
  // ... other fields
  - courseCode       String  // OLD
  + code            String  // NEW
}

// Step 2: Create migration (will create two-step process)
$ npx prisma migrate dev --name rename_course_code_to_code

// Generated migration will:
// 1. ALTER TABLE "Course" ADD COLUMN "code" VARCHAR(20)
// 2. UPDATE "Course" SET "code" = "courseCode"
// 3. ALTER TABLE "Course" DROP COLUMN "courseCode"

// Step 3: Update application code
// Before:
// const course = await prisma.course.create({ data: { courseCode: 'CS101' } });
// After:
// const course = await prisma.course.create({ data: { code: 'CS101' } });
*/

// ============================================================================
// EXAMPLE 4: Change Column Type
// ============================================================================

/*
// Step 1: Modify schema.prisma
model Grade {
  - gradeNumeric    Decimal   @db.Decimal(5, 2)  // OLD: 0-100 scale
  + gradeNumeric    Int       // NEW: percentage 0-100
}

// Step 2: Create migration
$ npx prisma migrate dev --name change_grade_numeric_to_int

// Generated migration SQL:
// ALTER TABLE "Grade" ALTER COLUMN "gradeNumeric" TYPE INTEGER;

// Step 3: Update application logic if needed
const grade = await prisma.grade.update({
  where: { id: 'grade-id' },
  data: { gradeNumeric: 92 }  // Now an integer
});
*/

// ============================================================================
// EXAMPLE 5: Add Relationship Between Existing Tables
// ============================================================================

/*
// Requirement: Link Document model to specific student record

// Step 1: Modify schema.prisma
model Document {
  // ... existing fields
  + studentId        String?     // NEW: Link to student
  + student          Student?    @relation(fields: [studentId], references: [id])
}

model Student {
  // ... existing fields
  + documents        Document[]  // NEW: Inverse relation
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_document_student_relationship

// Generated migration:
// ALTER TABLE "Document" ADD COLUMN "studentId" TEXT;
// ALTER TABLE "Document" ADD CONSTRAINT "Document_studentId_fkey" 
//   FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL;

// Step 3: Use in application
const studentDocs = await prisma.document.findMany({
  where: { studentId: 'student-id' },
  include: { student: true }
});
*/

// ============================================================================
// EXAMPLE 6: Add Optional Field with Default
// ============================================================================

/*
// Step 1: Add to schema.prisma
model Student {
  // ... existing fields
  + scholarshipAmount  Decimal?    @db.Decimal(10, 2)  @default(0)
  + scholarshipSource  String?     @default("Merit-Based")
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_scholarship_fields_to_student

// Step 3: Existing records get default values
// Step 4: Use in application
const student = await prisma.student.update({
  where: { id: 'student-id' },
  data: {
    scholarshipAmount: 5000,
    scholarshipSource: "Departmental-Scholarship"
  }
});
*/

// ============================================================================
// EXAMPLE 7: Add Unique Constraint
// ============================================================================

/*
// Requirement: Ensure email address is unique across users

// Step 1: Modify schema.prisma
model User {
  id        String    @id @default(cuid())
  - email   String    @unique    // Already has @unique
}

// If not already unique, add it:
model Department {
  - code    String              // OLD
  + code    String    @unique   // NEW: Add unique constraint
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_unique_constraint_to_department_code

// Generated migration:
// ALTER TABLE "Department" ADD CONSTRAINT "Department_code_key" UNIQUE ("code");

// Note: If data violates constraint, migration will fail
// Solution: Clean data before migration
$ npx prisma migrate dev --name clean_and_add_unique_constraint
*/

// ============================================================================
// EXAMPLE 8: Add Enum Field
// ============================================================================

/*
// Step 1: Define enum and add field in schema.prisma
enum DocumentAccessLevel {
  PUBLIC
  RESTRICTED
  PRIVATE
  CONFIDENTIAL
}

model Document {
  // ... existing fields
  + accessLevel       DocumentAccessLevel  @default(RESTRICTED)
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_access_level_to_document

// Generated migration:
// CREATE TYPE "DocumentAccessLevel" AS ENUM ('PUBLIC', 'RESTRICTED', 'PRIVATE', 'CONFIDENTIAL');
// ALTER TABLE "Document" ADD COLUMN "accessLevel" "DocumentAccessLevel" NOT NULL DEFAULT 'RESTRICTED';

// Step 3: Use in application
const publicDocs = await prisma.document.findMany({
  where: { accessLevel: 'PUBLIC' }
});
*/

// ============================================================================
// EXAMPLE 9: Add Composite Unique Constraint
// ============================================================================

/*
// Requirement: Ensure combination of userId, semesterId, and roleId is unique

// Step 1: Add to schema.prisma
model UserRole {
  id            String    @id @default(cuid())
  userId        String
  roleId        String
  semesterId    String?
  
  @@unique([userId, roleId, semesterId])  // NEW: Composite unique
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_composite_unique_to_user_role

// Generated migration:
// ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_roleId_semesterId_key" 
//   UNIQUE ("userId", "roleId", "semesterId");

// Step 3: Use in application
const userRole = await prisma.userRole.findUnique({
  where: {
    userId_roleId_semesterId: {
      userId: 'user-id',
      roleId: 'role-id',
      semesterId: 'semester-id'
    }
  }
});
*/

// ============================================================================
// EXAMPLE 10: Data Migration (Prisma Migrate + Custom Script)
// ============================================================================

/*
// Scenario: Split fullName into firstName and lastName

// Step 1: Add new fields to schema.prisma
model User {
  id          String    @id @default(cuid())
  email       String    @unique
  - fullName  String              // OLD
  + firstName String              // NEW
  + lastName  String              // NEW
}

// Step 2: Create migration with custom logic
$ npx prisma migrate dev --name split_full_name

// This generates: migration.sql + migration_lock.toml

// Step 3: Edit migration.sql to add data transformation
-- In migrations/[timestamp]_split_full_name/migration.sql:
-- Create new columns
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Migrate existing data (split fullName)
UPDATE "User" SET 
  "firstName" = SPLIT_PART("fullName", ' ', 1),
  "lastName" = SPLIT_PART("fullName", ' ', 2);

-- Make columns NOT NULL
ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;

-- Drop old column
ALTER TABLE "User" DROP COLUMN "fullName";

// Step 4: Apply migration
$ npx prisma migrate deploy

// Step 5: Verify data transformation
const users = await prisma.user.findMany({
  select: { firstName: true, lastName: true }
});
*/

// ============================================================================
// EXAMPLE 11: Add Index for Performance
// ============================================================================

/*
// Scenario: Add index on frequently queried fields

// Step 1: Add to schema.prisma
model Grade {
  // ... existing fields
  @@index([studentId])        // NEW: Index for student lookups
  @@index([createdAt])        // NEW: Index for date range queries
  @@index([isApproved])       // NEW: Index for status filtering
}

// Step 2: Create migration
$ npx prisma migrate dev --name add_indexes_to_grade

// Generated migration:
// CREATE INDEX "Grade_studentId_idx" ON "Grade"("studentId");
// CREATE INDEX "Grade_createdAt_idx" ON "Grade"("createdAt");
// CREATE INDEX "Grade_isApproved_idx" ON "Grade"("isApproved");

// Step 3: Verify index usage
// Performance improvement for these queries:
const studentGrades = await prisma.grade.findMany({
  where: { studentId: 'student-id' }
});

const recentGrades = await prisma.grade.findMany({
  where: { createdAt: { gte: new Date('2024-01-01') } }
});

const approvedGrades = await prisma.grade.findMany({
  where: { isApproved: true }
});
*/

// ============================================================================
// COMMON MIGRATION PATTERNS
// ============================================================================

/*
1. ADDING A SIMPLE FIELD
   - Add field to schema.prisma with @default() for existing records
   - npx prisma migrate dev --name add_field_name
   
2. REMOVING A FIELD
   - Remove from schema.prisma
   - npx prisma migrate dev --name remove_field_name
   - WARNING: Data will be lost!
   
3. RENAMING A FIELD
   - Update field name in schema.prisma
   - npx prisma migrate dev --name rename_field_name
   - Prisma handles data preservation automatically
   
4. CHANGING FIELD TYPE
   - Update type in schema.prisma
   - npx prisma migrate dev --name change_field_type
   - May need custom SQL if complex transformation needed
   
5. ADDING RELATIONSHIP
   - Add relation fields to both models
   - npx prisma migrate dev --name add_relationship
   
6. DATA TRANSFORMATION
   - Create migration: npx prisma migrate dev --name transform_data --create-only
   - Edit migration SQL to include data transformation logic
   - npx prisma migrate deploy
   
7. PRODUCTION DEPLOYMENTS
   - Always test migrations in staging first
   - Run: npx prisma migrate status
   - Deploy: npx prisma migrate deploy
   - Verify: Check application logs for errors
   
8. ROLLBACK (Development Only)
   - npx prisma migrate reset
   - OR manually edit migration and re-run
   
9. MIGRATION CONFLICTS
   - npx prisma migrate resolve --rolled-back "<migration_name>"
   - npx prisma migrate deploy
   
10. CHECK MIGRATION STATUS
    - npx prisma migrate status
    - Shows pending and applied migrations
*/

// ============================================================================
// MIGRATION WORKFLOW (TEAM DEVELOPMENT)
// ============================================================================

/*
SCENARIO: Multiple developers working on schema changes

Developer A:
1. Modify schema.prisma for feature A
2. npx prisma migrate dev --name add_feature_a_tables
3. Commit changes + migration files to git
4. Push to shared branch

Developer B:
1. Pull latest changes
2. npx prisma migrate deploy (applies Dev A's migration)
3. Modify schema.prisma for feature B
4. npx prisma migrate dev --name add_feature_b_tables
5. Commit and push

Result: Migrations are applied in order, no conflicts

If conflicts occur:
1. Review migration_lock.toml
2. npx prisma migrate resolve --rolled-back "<conflicting_migration>"
3. Fix schema.prisma conflicts
4. npx prisma migrate dev --name fix_conflicts
5. Communicate with team about merge strategy
*/

export {};  // TypeScript syntax
