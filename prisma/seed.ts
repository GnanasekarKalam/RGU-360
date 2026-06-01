import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================================
  // 1. ROLES & PERMISSIONS
  // ============================================================================
  console.log('📋 Creating roles...');

  const systemAdminRole = await prisma.role.upsert({
    where: { name: 'system_admin' },
    update: {},
    create: {
      name: 'system_admin',
      description: 'Full system administrator access',
      isSystemRole: true,
      isActive: true,
    },
  });

  const deptHeadRole = await prisma.role.upsert({
    where: { name: 'department_head' },
    update: {},
    create: {
      name: 'department_head',
      description: 'Department head with full departmental access',
      isSystemRole: true,
      isActive: true,
    },
  });

  const facultyRole = await prisma.role.upsert({
    where: { name: 'faculty' },
    update: {},
    create: {
      name: 'faculty',
      description: 'Faculty member teaching courses',
      isSystemRole: true,
      isActive: true,
    },
  });

  const advisorRole = await prisma.role.upsert({
    where: { name: 'academic_advisor' },
    update: {},
    create: {
      name: 'academic_advisor',
      description: 'Academic advisor for students',
      isSystemRole: true,
      isActive: true,
    },
  });

  const studentRole = await prisma.role.upsert({
    where: { name: 'student' },
    update: {},
    create: {
      name: 'student',
      description: 'Student enrolled in courses',
      isSystemRole: true,
      isActive: true,
    },
  });

  const adminStaffRole = await prisma.role.upsert({
    where: { name: 'admin_staff' },
    update: {},
    create: {
      name: 'admin_staff',
      description: 'Administrative staff member',
      isSystemRole: true,
      isActive: true,
    },
  });

  console.log('✅ Created 6 roles');

  // ============================================================================
  // 2. PERMISSIONS
  // ============================================================================
  console.log('🔐 Creating permissions...');

  const permissions = [
    { name: 'users.read', resource: 'users', action: 'read' },
    { name: 'users.write', resource: 'users', action: 'write' },
    { name: 'grades.read', resource: 'grades', action: 'read' },
    { name: 'grades.write', resource: 'grades', action: 'write' },
    { name: 'grades.approve', resource: 'grades', action: 'approve' },
    { name: 'courses.read', resource: 'courses', action: 'read' },
    { name: 'courses.write', resource: 'courses', action: 'write' },
    { name: 'enrollments.read', resource: 'enrollments', action: 'read' },
    { name: 'enrollments.write', resource: 'enrollments', action: 'write' },
    { name: 'workflows.read', resource: 'workflows', action: 'read' },
    { name: 'workflows.approve', resource: 'workflows', action: 'approve' },
    { name: 'audit.read', resource: 'audit', action: 'read' },
  ];

  const createdPermissions = await Promise.all(
    permissions.map((perm) =>
      prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      })
    )
  );

  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // ============================================================================
  // 3. SYSTEM USERS
  // ============================================================================
  console.log('👥 Creating system users...');

  const hashedPassword = await bcrypt.hash('TestPassword123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@department360.edu' },
    update: {},
    create: {
      email: 'admin@department360.edu',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      status: 'ACTIVE',
      isMfaEnabled: true,
      mfaMethod: 'TOTP',
      roles: {
        create: {
          roleId: systemAdminRole.id,
          isPrimary: true,
        },
      },
    },
  });

  console.log('✅ Created system admin user');

  // ============================================================================
  // 4. DEPARTMENTS
  // ============================================================================
  console.log('🏢 Creating departments...');

  const mathDept = await prisma.department.upsert({
    where: { code: 'MATH' },
    update: {},
    create: {
      code: 'MATH',
      name: 'Department of Mathematics',
      fullName: 'Department of Mathematics and Statistics',
      description: 'Advanced mathematics, statistics, and computational sciences',
      phone: '(555) 123-4001',
      email: 'math@department360.edu',
      officeLocation: 'Science Building, Room 101',
      isActive: true,
      budgetAllocation: 500000,
    },
  });

  const csDept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      code: 'CS',
      name: 'Department of Computer Science',
      fullName: 'Department of Computer Science and Engineering',
      description: 'Computer science, software engineering, and AI',
      phone: '(555) 123-4002',
      email: 'cs@department360.edu',
      officeLocation: 'Tech Building, Room 201',
      isActive: true,
      budgetAllocation: 600000,
    },
  });

  console.log('✅ Created 2 departments');

  // ============================================================================
  // 5. FACULTY USERS & FACULTY RECORDS
  // ============================================================================
  console.log('👨‍🏫 Creating faculty...');

  const faculty1User = await prisma.user.upsert({
    where: { email: 'dr.smith@department360.edu' },
    update: {},
    create: {
      email: 'dr.smith@department360.edu',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      phoneNumber: '(555) 987-6543',
      mobileNumber: '(555) 987-6544',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: facultyRole.id,
          departmentId: mathDept.id,
          isPrimary: true,
        },
      },
    },
  });

  const faculty1 = await prisma.faculty.upsert({
    where: { employeeId: 'FAC001' },
    update: {},
    create: {
      userId: faculty1User.id,
      departmentId: mathDept.id,
      employeeId: 'FAC001',
      title: 'Professor',
      specialization: 'Calculus, Linear Algebra, Analysis',
      academicDegree: 'PhD',
      degreeInstitution: 'MIT',
      employmentStatus: 'FULL_TIME',
      hireDate: new Date('2015-08-01'),
      tenureStatus: 'TENURED',
      tenureDate: new Date('2018-08-01'),
      officeLocation: 'Science Building, Room 201',
      officePhone: '(555) 123-4010',
      performanceRating: 4.5,
      teachingEffectivenessScore: 4.7,
      salaryAmount: 120000,
      isActive: true,
    },
  });

  const faculty2User = await prisma.user.upsert({
    where: { email: 'dr.johnson@department360.edu' },
    update: {},
    create: {
      email: 'dr.johnson@department360.edu',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phoneNumber: '(555) 987-6545',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: facultyRole.id,
          departmentId: csDept.id,
          isPrimary: true,
        },
      },
    },
  });

  const faculty2 = await prisma.faculty.upsert({
    where: { employeeId: 'FAC002' },
    update: {},
    create: {
      userId: faculty2User.id,
      departmentId: csDept.id,
      employeeId: 'FAC002',
      title: 'Associate Professor',
      specialization: 'Machine Learning, AI, Data Science',
      academicDegree: 'PhD',
      degreeInstitution: 'Stanford University',
      employmentStatus: 'FULL_TIME',
      hireDate: new Date('2018-08-01'),
      tenureStatus: 'TENURE_TRACK',
      officeLocation: 'Tech Building, Room 301',
      officePhone: '(555) 123-4020',
      performanceRating: 4.3,
      teachingEffectivenessScore: 4.5,
      salaryAmount: 115000,
      isActive: true,
    },
  });

  console.log('✅ Created 2 faculty members');

  // ============================================================================
  // 6. PROGRAMS
  // ============================================================================
  console.log('🎓 Creating degree programs...');

  const mathBachelorProgram = await prisma.program.upsert({
    where: { id: `${mathDept.id}-BS-MATH` },
    update: {},
    create: {
      id: `${mathDept.id}-BS-MATH`,
      departmentId: mathDept.id,
      code: 'BS-MATH',
      name: 'Bachelor of Science in Mathematics',
      degreeType: 'BACHELOR',
      description: 'Comprehensive mathematics degree with emphasis on pure and applied mathematics',
      totalCreditsRequired: 120,
      minimumGpa: 2.0,
      accreditationStatus: 'ACTIVE',
      accreditationBody: 'SACSCOC',
      isActive: true,
    },
  });

  const csBachelorProgram = await prisma.program.upsert({
    where: { id: `${csDept.id}-BS-CS` },
    update: {},
    create: {
      id: `${csDept.id}-BS-CS`,
      departmentId: csDept.id,
      code: 'BS-CS',
      name: 'Bachelor of Science in Computer Science',
      degreeType: 'BACHELOR',
      description: 'Rigorous computer science degree with hands-on software development experience',
      totalCreditsRequired: 120,
      minimumGpa: 2.0,
      accreditationStatus: 'ACTIVE',
      accreditationBody: 'ABET',
      isActive: true,
    },
  });

  console.log('✅ Created 2 degree programs');

  // ============================================================================
  // 7. COURSES
  // ============================================================================
  console.log('📚 Creating courses...');

  const calculus1 = await prisma.course.upsert({
    where: { id: 'MATH-2110' },
    update: {},
    create: {
      id: 'MATH-2110',
      departmentId: mathDept.id,
      courseCode: 'MATH-2110',
      courseNumber: 2110,
      title: 'Calculus I',
      description: 'Limits, derivatives, applications of derivatives, antiderivatives, definite integrals',
      creditHours: 4,
      contactHours: 3,
      labHours: 0,
      isLabCourse: false,
      maxEnrollment: 40,
      minEnrollment: 10,
      isActive: true,
      learningOutcomes: JSON.stringify([
        'Understand limits and continuity',
        'Apply derivatives to solve real-world problems',
        'Master integration techniques',
      ]),
      assessmentMethods: JSON.stringify(['Exams', 'Homework', 'Projects']),
      programs: {
        create: [
          { programId: mathBachelorProgram.id, isRequired: true, sequenceOrder: 1 },
          { programId: csBachelorProgram.id, isRequired: true, sequenceOrder: 1 },
        ],
      },
    },
  });

  const cs1 = await prisma.course.upsert({
    where: { id: 'CS-1100' },
    update: {},
    create: {
      id: 'CS-1100',
      departmentId: csDept.id,
      courseCode: 'CS-1100',
      courseNumber: 1100,
      title: 'Introduction to Computer Science',
      description: 'Fundamentals of computer science, programming paradigms, algorithms, and data structures',
      creditHours: 3,
      contactHours: 2,
      labHours: 2,
      isLabCourse: true,
      maxEnrollment: 30,
      minEnrollment: 10,
      isActive: true,
      isOnline: false,
      learningOutcomes: JSON.stringify([
        'Understand computer architecture',
        'Master Python programming',
        'Implement basic algorithms',
      ]),
      assessmentMethods: JSON.stringify(['Exams', 'Programming Assignments', 'Project']),
      programs: {
        create: [
          { programId: csBachelorProgram.id, isRequired: true, sequenceOrder: 1 },
        ],
      },
    },
  });

  const cs2 = await prisma.course.upsert({
    where: { id: 'CS-2100' },
    update: {},
    create: {
      id: 'CS-2100',
      departmentId: csDept.id,
      courseCode: 'CS-2100',
      courseNumber: 2100,
      title: 'Data Structures and Algorithms',
      description: 'Advanced data structures, algorithm design and analysis, complexity theory',
      creditHours: 4,
      contactHours: 3,
      labHours: 1,
      isLabCourse: true,
      prerequisiteCourseId: cs1.id,
      prerequisiteGradeRequired: 'C',
      maxEnrollment: 30,
      minEnrollment: 10,
      isActive: true,
      learningOutcomes: JSON.stringify([
        'Design efficient algorithms',
        'Analyze time and space complexity',
        'Implement advanced data structures',
      ]),
    },
  });

  console.log('✅ Created 3 courses');

  // ============================================================================
  // 8. SEMESTERS
  // ============================================================================
  console.log('📅 Creating semesters...');

  const spring2024 = await prisma.semester.upsert({
    where: { code: 'SP2024' },
    update: {},
    create: {
      code: 'SP2024',
      name: 'Spring 2024',
      academicYear: 2024,
      season: 'SPRING',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-05-10'),
      registrationStart: new Date('2023-11-01'),
      registrationEnd: new Date('2023-12-15'),
      addDropDeadline: new Date('2024-01-29'),
      withdrawalDeadline: new Date('2024-04-15'),
      gradesDueDate: new Date('2024-05-17'),
      isActive: true,
    },
  });

  const fall2024 = await prisma.semester.upsert({
    where: { code: 'FA2024' },
    update: {},
    create: {
      code: 'FA2024',
      name: 'Fall 2024',
      academicYear: 2024,
      season: 'FALL',
      startDate: new Date('2024-08-26'),
      endDate: new Date('2024-12-15'),
      registrationStart: new Date('2024-06-01'),
      registrationEnd: new Date('2024-08-15'),
      addDropDeadline: new Date('2024-09-09'),
      withdrawalDeadline: new Date('2024-11-15'),
      gradesDueDate: new Date('2024-12-22'),
      isActive: false,
    },
  });

  console.log('✅ Created 2 semesters');

  // ============================================================================
  // 9. CLASSES (Course Instances)
  // ============================================================================
  console.log('🎓 Creating classes...');

  const calcClass1 = await prisma.class.upsert({
    where: { id: 'CLASS-MATH2110-SP2024-001' },
    update: {},
    create: {
      id: 'CLASS-MATH2110-SP2024-001',
      courseId: calculus1.id,
      instructorId: faculty1.id,
      semesterId: spring2024.id,
      sectionNumber: 1,
      dayOfWeek: 'MWF',
      startTime: new Date('1970-01-01T09:00:00'),
      endTime: new Date('1970-01-01T10:15:00'),
      location: 'Science Building, Room 301',
      enrollmentCapacity: 40,
      currentEnrollment: 35,
      deliveryMode: 'IN_PERSON',
      isActive: true,
    },
  });

  const csClass1 = await prisma.class.upsert({
    where: { id: 'CLASS-CS1100-SP2024-001' },
    update: {},
    create: {
      id: 'CLASS-CS1100-SP2024-001',
      courseId: cs1.id,
      instructorId: faculty2.id,
      semesterId: spring2024.id,
      sectionNumber: 1,
      dayOfWeek: 'TTh',
      startTime: new Date('1970-01-01T10:30:00'),
      endTime: new Date('1970-01-01T11:45:00'),
      location: 'Tech Building, Room 215',
      enrollmentCapacity: 30,
      currentEnrollment: 28,
      deliveryMode: 'IN_PERSON',
      isActive: true,
    },
  });

  console.log('✅ Created 2 classes');

  // ============================================================================
  // 10. STUDENT USERS & STUDENT RECORDS
  // ============================================================================
  console.log('🧑‍🎓 Creating students...');

  const student1User = await prisma.user.upsert({
    where: { email: 'john.doe@student.edu' },
    update: {},
    create: {
      email: 'john.doe@student.edu',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '(555) 111-2222',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: studentRole.id,
          isPrimary: true,
        },
      },
    },
  });

  const student1 = await prisma.student.upsert({
    where: { studentId: 'STU001' },
    update: {},
    create: {
      userId: student1User.id,
      studentId: 'STU001',
      degreeProgram: csBachelorProgram.id,
      majorId: csBachelorProgram.id,
      enrollmentStatus: 'ENROLLED',
      enrollmentDate: new Date('2023-08-15'),
      expectedGraduationDate: new Date('2027-05-15'),
      currentGpa: 3.75,
      cumulativeGpa: 3.75,
      academicStanding: 'GOOD',
      creditsEarned: 30,
      creditsRequired: 120,
      primaryAdvisorId: faculty2.id,
    },
  });

  const student2User = await prisma.user.upsert({
    where: { email: 'jane.smith@student.edu' },
    update: {},
    create: {
      email: 'jane.smith@student.edu',
      passwordHash: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      phoneNumber: '(555) 111-2223',
      status: 'ACTIVE',
      roles: {
        create: {
          roleId: studentRole.id,
          isPrimary: true,
        },
      },
    },
  });

  const student2 = await prisma.student.upsert({
    where: { studentId: 'STU002' },
    update: {},
    create: {
      userId: student2User.id,
      studentId: 'STU002',
      degreeProgram: mathBachelorProgram.id,
      majorId: mathBachelorProgram.id,
      enrollmentStatus: 'ENROLLED',
      enrollmentDate: new Date('2023-08-15'),
      expectedGraduationDate: new Date('2027-05-15'),
      currentGpa: 3.6,
      cumulativeGpa: 3.6,
      academicStanding: 'GOOD',
      creditsEarned: 28,
      creditsRequired: 120,
      primaryAdvisorId: faculty1.id,
    },
  });

  console.log('✅ Created 2 students');

  // ============================================================================
  // 11. ENROLLMENTS
  // ============================================================================
  console.log('📝 Creating enrollments...');

  const enrollment1 = await prisma.enrollment.upsert({
    where: { id: 'ENROLL-001' },
    update: {},
    create: {
      id: 'ENROLL-001',
      studentId: student1.id,
      classId: csClass1.id,
      semesterId: spring2024.id,
      enrollmentStatus: 'ENROLLED',
      attendanceCount: 14,
      absenceCount: 1,
      transcriptStatus: 'PENDING',
    },
  });

  const enrollment2 = await prisma.enrollment.upsert({
    where: { id: 'ENROLL-002' },
    update: {},
    create: {
      id: 'ENROLL-002',
      studentId: student2.id,
      classId: calcClass1.id,
      semesterId: spring2024.id,
      enrollmentStatus: 'ENROLLED',
      attendanceCount: 15,
      absenceCount: 0,
      transcriptStatus: 'PENDING',
    },
  });

  const enrollment3 = await prisma.enrollment.upsert({
    where: { id: 'ENROLL-003' },
    update: {},
    create: {
      id: 'ENROLL-003',
      studentId: student1.id,
      classId: calcClass1.id,
      semesterId: spring2024.id,
      enrollmentStatus: 'ENROLLED',
      attendanceCount: 13,
      absenceCount: 2,
      transcriptStatus: 'PENDING',
    },
  });

  console.log('✅ Created 3 enrollments');

  // ============================================================================
  // 12. GRADES
  // ============================================================================
  console.log('📊 Creating grades...');

  const grade1 = await prisma.grade.upsert({
    where: { id: 'GRADE-001' },
    update: {},
    create: {
      id: 'GRADE-001',
      enrollmentId: enrollment1.id,
      classId: csClass1.id,
      studentId: student1.id,
      gradeNumeric: 92,
      gradeLetter: 'A',
      gradePoints: 4.0,
      participationScore: 18,
      attendanceScore: 19,
      assignmentScore: 95,
      midtermScore: 88,
      finalExamScore: 94,
      projectScore: 90,
      isDraft: false,
      isApproved: true,
      isFinal: true,
      submittedById: faculty2.id,
      submittedAt: new Date(),
      approvedById: faculty2.id,
      approvedAt: new Date(),
      facultyComments: 'Excellent work throughout the semester',
    },
  });

  const grade2 = await prisma.grade.upsert({
    where: { id: 'GRADE-002' },
    update: {},
    create: {
      id: 'GRADE-002',
      enrollmentId: enrollment2.id,
      classId: calcClass1.id,
      studentId: student2.id,
      gradeNumeric: 87,
      gradeLetter: 'B',
      gradePoints: 3.7,
      participationScore: 17,
      attendanceScore: 20,
      assignmentScore: 88,
      midtermScore: 85,
      finalExamScore: 89,
      projectScore: 85,
      isDraft: false,
      isApproved: true,
      isFinal: true,
      submittedById: faculty1.id,
      submittedAt: new Date(),
      approvedById: faculty1.id,
      approvedAt: new Date(),
      facultyComments: 'Strong performance overall',
    },
  });

  console.log('✅ Created 2 grades');

  // ============================================================================
  // 13. WORKFLOWS
  // ============================================================================
  console.log('🔄 Creating workflows...');

  const workflow1 = await prisma.workflow.upsert({
    where: { id: 'WORKFLOW-001' },
    update: {},
    create: {
      id: 'WORKFLOW-001',
      workflowType: 'GRADE_SUBMISSION',
      status: 'SUBMITTED',
      relatedResourceType: 'grade',
      relatedResourceId: grade1.id,
      initiatedById: faculty2.id,
      initiatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      data: JSON.stringify({
        courseCode: 'CS-1100',
        semester: 'Spring 2024',
        studentCount: 28,
      }),
      comments: 'Spring 2024 final grades for CS-1100 Section 001',
    },
  });

  console.log('✅ Created 1 workflow');

  // ============================================================================
  // 14. WORKFLOW APPROVALS
  // ============================================================================
  console.log('✅ Creating workflow approvals...');

  const approval1 = await prisma.workflowApproval.upsert({
    where: { id: 'APPROVAL-001' },
    update: {},
    create: {
      id: 'APPROVAL-001',
      workflowId: workflow1.id,
      approvalLevel: 1,
      assignedToId: adminUser.id,
      approvalStatus: 'APPROVED',
      responseDate: new Date(),
      comments: 'All grades verified and validated',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Created 1 workflow approval');

  // ============================================================================
  // 15. ACCREDITATION
  // ============================================================================
  console.log('🎖️ Creating accreditation records...');

  const accreditation1 = await prisma.accreditation.upsert({
    where: { id: 'ACC-001' },
    update: {},
    create: {
      id: 'ACC-001',
      programId: csBachelorProgram.id,
      accreditationBody: 'ABET',
      status: 'ACTIVE',
      expiryDate: new Date('2027-12-31'),
      lastReviewDate: new Date('2023-09-15'),
      nextReviewDate: new Date('2026-09-15'),
    },
  });

  await prisma.accreditationEvidence.upsert({
    where: { id: 'EVIDENCE-001' },
    update: {},
    create: {
      id: 'EVIDENCE-001',
      accreditationId: accreditation1.id,
      evidenceType: 'Student Learning Outcomes',
      description: 'Assessment results for SLO 1: Problem Solving',
      fileUrl: 'onedrive://compartment/evidence/SLO1_Assessment.pdf',
      fileSize: 2048576,
      status: 'APPROVED',
      reviewedBy: adminUser.id,
      reviewDate: new Date('2023-09-20'),
      reviewNotes: 'Comprehensive assessment data provided',
    },
  });

  console.log('✅ Created accreditation records');

  // ============================================================================
  // 16. TASKS
  // ============================================================================
  console.log('📋 Creating tasks...');

  await prisma.task.createMany({
    data: [
      {
        title: 'Grade Submission - CS-1100 Spring 2024',
        description: 'Submit final grades for CS-1100 Section 001',
        taskType: 'GRADING',
        status: 'COMPLETED',
        priority: 'HIGH',
        assignedToId: faculty2.id,
        createdById: adminUser.id,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completedDate: new Date(),
        tags: ['grades', 'cs', 'spring-2024'],
      },
      {
        title: 'Course Schedule for Fall 2024',
        description: 'Prepare course schedule and room assignments for Fall 2024 semester',
        taskType: 'ADMINISTRATIVE',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tags: ['scheduling', 'fall-2024'],
      },
      {
        title: 'ABET Accreditation Evaluation',
        description: 'Prepare and submit accreditation evaluation for CS program',
        taskType: 'REVIEW',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        assignedToId: adminUser.id,
        createdById: adminUser.id,
        dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        tags: ['accreditation', 'cs', 'abet'],
      },
    ],
  });

  console.log('✅ Created 3 tasks');

  // ============================================================================
  // 17. AUDIT LOGS
  // ============================================================================
  console.log('🔐 Creating audit logs...');

  await prisma.auditLog.createMany({
    data: [
      {
        userId: faculty2.id,
        action: 'GRADE_SUBMITTED',
        resourceType: 'Grade',
        resourceId: grade1.id,
        newValues: {
          gradeLetter: 'A',
          gradeNumeric: 92,
        },
        severity: 'INFO',
        ferpaProtected: true,
        studentId: student1.id,
      },
      {
        userId: adminUser.id,
        action: 'WORKFLOW_APPROVED',
        resourceType: 'Workflow',
        resourceId: workflow1.id,
        newValues: {
          status: 'APPROVED',
        },
        severity: 'INFO',
      },
      {
        userId: faculty1.id,
        action: 'ENROLLMENT_MODIFIED',
        resourceType: 'Enrollment',
        resourceId: enrollment2.id,
        oldValues: {
          absenceCount: 1,
        },
        newValues: {
          absenceCount: 0,
        },
        severity: 'INFO',
        ferpaProtected: true,
        studentId: student2.id,
      },
    ],
  });

  console.log('✅ Created 3 audit logs');

  // ============================================================================
  // 18. SYSTEM SETTINGS
  // ============================================================================
  console.log('⚙️ Creating system settings...');

  await prisma.systemSetting.createMany({
    data: [
      {
        key: 'ACADEMIC_CALENDAR_YEAR',
        value: '2024',
        description: 'Current academic year',
        valueType: 'string',
      },
      {
        key: 'FERPA_ENABLED',
        value: 'true',
        description: 'Enable FERPA compliance mode',
        valueType: 'boolean',
      },
      {
        key: 'MAX_GRADE_SUBMISSION_DAYS',
        value: '10',
        description: 'Maximum days allowed for grade submission after semester ends',
        valueType: 'number',
      },
      {
        key: 'GPA_SCALE',
        value: '4.0',
        description: 'Maximum GPA scale',
        valueType: 'string',
      },
      {
        key: 'ONEDRIVE_SYNC_ENABLED',
        value: 'true',
        description: 'Enable OneDrive synchronization',
        valueType: 'boolean',
      },
    ],
  });

  console.log('✅ Created 5 system settings');

  console.log('\n✨ Database seed completed successfully!');
  console.log('📊 Summary:');
  console.log('  • 1 system admin');
  console.log('  • 2 faculty members');
  console.log('  • 2 students');
  console.log('  • 2 departments');
  console.log('  • 2 programs');
  console.log('  • 3 courses');
  console.log('  • 2 semesters');
  console.log('  • 2 classes');
  console.log('  • 3 enrollments');
  console.log('  • 2 grades');
  console.log('  • 1 workflow');
  console.log('  • 1 approval');
  console.log('  • 1 accreditation + evidence');
  console.log('  • 3 tasks');
  console.log('  • 3 audit logs');
  console.log('  • 5 system settings');
  console.log('  • 6 roles + 12 permissions');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
