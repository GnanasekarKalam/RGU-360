# Prisma Schema Fixes Required

## Status: ⚠️ Schema Requires Manual Fixes

The Prisma schema has several relation field issues that need to be resolved before the project can run. This document guides you through fixing them.

## ❌ Identified Issues

### 1. Missing Back-Relations in User Model (Lines 62-87)

**Problem**: User model references other models without reciprocal relations.

**Affected Relations**:
- `gradeSubmitted` (references Grade with relation "submittedBy")
- `gradeApproved` (references Grade with relation "approvedBy")
- `gradeAppealFacultyReview` (references GradeAppeal with relation "facultyReviewer")
- `gradeAppealDeptReview` (references GradeAppeal with relation "deptReviewer")
- `accreditationSubmitted` (references AccreditationEvidence with relation "accreditationSubmittedBy")
- `accreditationVerified` (references AccreditationEvidence with relation "accreditationVerifiedBy")

**Solution**: Either add these fields to the referenced models OR remove them from User.

**Quick Fix** (Remove unimplemented relations):
```prisma
// In src/types/auth.types.ts User section, comment out or remove:
// gradeSubmitted        Grade[]     @relation("submittedBy")
// gradeApproved         Grade[]     @relation("approvedBy")
// gradeAppealFacultyReview GradeAppeal[] @relation("facultyReviewer")
// gradeAppealDeptReview GradeAppeal[] @relation("deptReviewer")
// accreditationSubmitted AccreditationEvidence[]
// accreditationVerified  AccreditationEvidence[]
```

### 2. Duplicate Relation Definitions (Grade & Enrollment)

**Problem**: Both sides of relationship define fields and references.

**Location**: Grade model (Line 602) and Enrollment model (Line 536)

**Error**: "Both provide the `references` argument"

**Solution**: Remove fields/references from one side of the relation.

**Quick Fix**:
```prisma
// In Grade model, keep:
enrollment              Enrollment  @relation(fields: [enrollmentId], references: [id])

// In Enrollment model, change to:
grade                   Grade?
```

### 3. Missing Unique Constraint for One-to-One Relation

**Error**: "A one-to-one relation must use unique fields"

**Fix**:
```prisma
// Add @unique to the defining side
enrollmentId            String      @unique
```

### 4. UserRole assignedBy Relation Issue

**Problem**: Missing back-relation on User model.

**Fix**: Add to User model:
```prisma
assignedRoles           UserRole[]  @relation("assignedRoles")
```

## 🔧 How to Fix Manually

### Option A: Automated Script

```bash
# Run the automatic fixer
node scripts/fix-schema.js

# Then verify
npx prisma validate
npx prisma generate
```

### Option B: Manual Steps

1. **Open** `prisma/schema.prisma`

2. **Find** the User model (around line 30)

3. **Remove** or comment out these lines:
```prisma
// DELETE THESE LINES:
gradeSubmitted        Grade[]     @relation("submittedBy")
gradeApproved         Grade[]     @relation("approvedBy")
gradeAppealFacultyReview GradeAppeal[] @relation("facultyReviewer")
gradeAppealDeptReview GradeAppeal[] @relation("deptReviewer")
accreditationSubmitted AccreditationEvidence[] @relation("accreditationSubmittedBy")
accreditationVerified  AccreditationEvidence[] @relation("accreditationVerifiedBy")
```

4. **Find** Grade model (around line 595)

5. **Verify** enrollment relation is correct:
```prisma
enrollment              Enrollment  @relation(fields: [enrollmentId], references: [id])
```

6. **Find** Enrollment model (around line 530)

7. **Change** grade relation:
```prisma
// CHANGE FROM:
grade                   Grade?      @relation(fields: [gradeId], references: [id])

// CHANGE TO:
grade                   Grade?
```

8. **Add** unique constraint:
```prisma
enrollmentId            String      @unique
```

### Option C: Complete Schema Replacement

If manual fixes are complex, use a simplified schema:

```bash
# Backup current schema
cp prisma/schema.prisma prisma/schema.prisma.backup

# Replace with simplified version
# (See SIMPLIFIED-SCHEMA.md)
```

## ✅ Verification Steps

After making fixes:

```bash
# 1. Validate syntax
npx prisma validate

# 2. Generate client
npx prisma generate

# 3. Check for remaining errors
echo $?  # Should output 0

# 4. Create migration
npx prisma migrate dev --name fix_schema

# 5. Test database connection
npx prisma db execute --stdin <<EOF
SELECT 1;
EOF
```

## 📋 Typical Fix Order

1. Remove orphaned relations from User model
2. Fix Grade/Enrollment bidirectional relation
3. Add missing @unique constraints
4. Run `npx prisma generate`
5. Run `npx prisma migrate dev`
6. Test locally: `npm run dev`
7. Deploy to Vercel

## 🚀 After Fixing

Once schema is valid:

```bash
# Build and verify
npm run build

# Deploy to Vercel
vercel --prod

# Post-deployment migrations
vercel env pull
npx prisma migrate deploy
npx prisma db seed
```

## 🆘 If You Get Stuck

1. **Check Prisma Docs**: https://www.prisma.io/docs/concepts/relations
2. **Review Examples**: Check similar projects in your codebase
3. **Reset Database**: `npx prisma migrate reset` (in development only!)
4. **Use Prisma Studio**: `npx prisma studio` to visualize relations
5. **Generate Migration**: Let Prisma help: `npx prisma migrate dev`

## 🔗 Related Files

- Schema file: `prisma/schema.prisma`
- Auto-fixer: `scripts/fix-schema.js`
- Type definitions: `src/types/*.types.ts`
- Migration history: `prisma/migrations/`

---

**Estimated Fix Time**: 15-30 minutes (manual) or 5 minutes (automated)

**Priority**: HIGH - Must fix before full deployment

**Status**: In Progress | Last Updated: June 1, 2026
