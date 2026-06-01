#!/usr/bin/env node
/**
 * Quick Prisma Schema Fixer
 * Fixes common relation errors in schema.prisma
 * Run: node scripts/fix-schema.js
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf-8');

console.log('🔧 Fixing Prisma schema...\n');

// Fix 1: Remove problematic relations from User model that don't have back-relations
const userModelFixes = [
  { old: /  gradeSubmitted\s+Grade\[\]\s+@relation\("submittedBy"\)\n/g, new: '  // gradeSubmitted removed (missing back-relation)\n' },
  { old: /  gradeApproved\s+Grade\[\]\s+@relation\("approvedBy"\)\n/g, new: '  // gradeApproved removed (missing back-relation)\n' },
  { old: /  gradeAppealFacultyReview\s+GradeAppeal\[\]\s+@relation\("facultyReviewer"\)\n/g, new: '  // gradeAppealFacultyReview removed\n' },
  { old: /  gradeAppealDeptReview\s+GradeAppeal\[\]\s+@relation\("deptReviewer"\)\n/g, new: '  // gradeAppealDeptReview removed\n' },
  { old: /  accreditationSubmitted\s+AccreditationEvidence\[\]\s+@relation\("accreditationSubmittedBy"\)\n/g, new: '  // accreditationSubmitted removed\n' },
  { old: /  accreditationVerified\s+AccreditationEvidence\[\]\s+@relation\("accreditationVerifiedBy"\)\n/g, new: '  // accreditationVerified removed\n' },
];

userModelFixes.forEach(fix => {
  schema = schema.replace(fix.old, fix.new);
});

// Fix 2: Remove circular relations from Enrollment/Grade
schema = schema.replace(
  /enrollment\s+Grade\?\s+@relation\(fields: \[gradeId\],\s+references: \[id\]\)/g,
  'enrollment              Grade?      @relation()'
);

// Fix 3: Fix UserRole assignedBy relation
schema = schema.replace(
  /assignedBy\s+User\?\s+@relation\("assignedRoles",/g,
  'assignedBy      User?     @relation("assignedRoles",'
);

// Fix 4: Comment out problematic relation on EnrollmentTracking
schema = schema.replace(
  /gradeAppeal\s+GradeAppeal\[\]\s+@relation\("enrollmentTracking"\)/g,
  '// gradeAppeal removed (duplicate relation)'
);

fs.writeFileSync(schemaPath, schema);
console.log('✅ Schema fixed!\n');
console.log('📝 Next steps:');
console.log('   1. Review the changes in prisma/schema.prisma');
console.log('   2. Run: npx prisma generate');
console.log('   3. Run: npx prisma migrate dev');
console.log('   4. Verify: npm run dev\n');
