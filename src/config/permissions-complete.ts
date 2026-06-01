// src/config/permissions-complete.ts
// Complete permission matrix for all roles - Comprehensive RBAC

import { UserRole, Permission } from '../types/auth.types';

/**
 * Complete Permission Matrix - Defines what each role can do
 * Format: resource:action
 */
export const PERMISSION_MATRIX: Record<UserRole, string[]> = {
  // ========================================================================
  // SUPER_ADMIN - Full system access with no restrictions
  // ========================================================================
  [UserRole.SUPER_ADMIN]: [
    // === USER MANAGEMENT ===
    'users:read',
    'users:write',
    'users:delete',
    'users:create',
    'users:manage_roles',
    'users:reset_password',
    'users:view_audit_logs',
    'users:deactivate',
    'users:activate',
    'users:manage_mfa',
    'users:export',

    // === DEPARTMENT MANAGEMENT ===
    'departments:read',
    'departments:write',
    'departments:delete',
    'departments:create',
    'departments:manage',

    // === FACULTY MANAGEMENT ===
    'faculty:read',
    'faculty:write',
    'faculty:delete',
    'faculty:create',
    'faculty:manage',
    'faculty:export',

    // === STUDENT MANAGEMENT ===
    'students:read',
    'students:write',
    'students:delete',
    'students:create',
    'students:manage',
    'students:export',

    // === COURSE MANAGEMENT ===
    'courses:read',
    'courses:write',
    'courses:delete',
    'courses:create',
    'courses:manage',
    'courses:archive',

    // === ENROLLMENT MANAGEMENT ===
    'enrollments:read',
    'enrollments:write',
    'enrollments:delete',
    'enrollments:create',
    'enrollments:approve',
    'enrollments:cancel',

    // === GRADE MANAGEMENT ===
    'grades:read',
    'grades:write',
    'grades:delete',
    'grades:create',
    'grades:approve',
    'grades:publish',
    'grades:manage_appeals',
    'grades:override',

    // === WORKFLOW & APPROVALS ===
    'workflows:read',
    'workflows:write',
    'workflows:delete',
    'workflows:create',
    'workflows:approve',
    'workflows:manage',
    'workflows:configure',

    // === ACCREDITATION ===
    'accreditation:read',
    'accreditation:write',
    'accreditation:delete',
    'accreditation:create',
    'accreditation:manage',
    'accreditation:submit',

    // === SYSTEM SETTINGS ===
    'settings:read',
    'settings:write',
    'settings:manage',
    'settings:configure_security',

    // === AUDIT & REPORTS ===
    'reports:read',
    'reports:generate',
    'reports:schedule',
    'reports:export',
    'audit:read',
    'audit:export',
    'audit:delete',

    // === ANALYTICS ===
    'analytics:read',
    'analytics:manage',
    'analytics:export',

    // === SYSTEM ADMINISTRATION ===
    'system:manage',
    'system:backup',
    'system:restore',
    'system:logs',
  ],

  // ========================================================================
  // ADMIN - Administrative access with department-level restrictions
  // ========================================================================
  [UserRole.ADMIN]: [
    // === USER MANAGEMENT ===
    'users:read',
    'users:write',
    'users:reset_password',
    'users:view_audit_logs',
    'users:manage_roles',
    'users:export',

    // === DEPARTMENT MANAGEMENT ===
    'departments:read',
    'departments:write',
    'departments:manage',

    // === FACULTY MANAGEMENT ===
    'faculty:read',
    'faculty:write',
    'faculty:manage',
    'faculty:export',

    // === STUDENT MANAGEMENT ===
    'students:read',
    'students:write',
    'students:manage',
    'students:export',

    // === COURSE MANAGEMENT ===
    'courses:read',
    'courses:write',
    'courses:create',
    'courses:manage',
    'courses:archive',

    // === ENROLLMENT MANAGEMENT ===
    'enrollments:read',
    'enrollments:write',
    'enrollments:create',
    'enrollments:approve',
    'enrollments:cancel',

    // === GRADE MANAGEMENT ===
    'grades:read',
    'grades:write',
    'grades:create',
    'grades:approve',
    'grades:publish',
    'grades:manage_appeals',

    // === WORKFLOW & APPROVALS ===
    'workflows:read',
    'workflows:write',
    'workflows:create',
    'workflows:approve',
    'workflows:manage',

    // === ACCREDITATION ===
    'accreditation:read',
    'accreditation:write',
    'accreditation:manage',
    'accreditation:submit',

    // === AUDIT & REPORTS ===
    'reports:read',
    'reports:generate',
    'reports:schedule',
    'reports:export',
    'audit:read',

    // === ANALYTICS ===
    'analytics:read',
    'analytics:export',
  ],

  // ========================================================================
  // HOD - Head of Department (Department-scoped access)
  // ========================================================================
  [UserRole.HOD]: [
    // === DEPARTMENT RESOURCES ===
    'departments:read',

    // === FACULTY MANAGEMENT (Department scoped) ===
    'faculty:read',
    'faculty:write', // Only in their department
    'faculty:manage', // Their department only
    'faculty:export',

    // === STUDENT MANAGEMENT (Department scoped) ===
    'students:read', // Only their department students
    'students:write', // Limited to their department
    'students:export',

    // === COURSE MANAGEMENT (Department scoped) ===
    'courses:read',
    'courses:write', // Only department courses
    'courses:create', // In their department
    'courses:manage', // Their department only
    'courses:archive',

    // === ENROLLMENT MANAGEMENT (Department scoped) ===
    'enrollments:read',
    'enrollments:write', // Department courses
    'enrollments:create', // Department courses
    'enrollments:approve',

    // === GRADE MANAGEMENT (Department scoped) ===
    'grades:read',
    'grades:approve', // Faculty grade approval
    'grades:publish', // Department grades
    'grades:manage_appeals',

    // === WORKFLOW APPROVALS ===
    'workflows:read',
    'workflows:approve',

    // === LEAVE REQUESTS ===
    'leave_requests:read',
    'leave_requests:approve',
    'leave_requests:manage',

    // === CURRICULUM ===
    'curriculum:read',
    'curriculum:write',
    'curriculum:approve',
    'curriculum:manage',

    // === ACADEMIC PLANNING ===
    'academic_planning:read',
    'academic_planning:write',
    'academic_planning:manage',

    // === REPORTS ===
    'reports:read',
    'reports:generate',
    'reports:export',

    // === ANALYTICS ===
    'analytics:read',
    'analytics:export',
  ],

  // ========================================================================
  // FACULTY - Faculty member access (Course and student scoped)
  // ========================================================================
  [UserRole.FACULTY]: [
    // === PROFILE ===
    'profile:read',
    'profile:write',
    'profile:view_audit',

    // === COURSE MANAGEMENT (Their courses) ===
    'courses:read',
    'classes:read',
    'classes:manage', // Their classes only

    // === STUDENT MANAGEMENT (Their courses only) ===
    'students:read', // Course students only
    'enrollments:read', // Their course enrollments

    // === GRADE MANAGEMENT (Their courses) ===
    'grades:read', // Their courses
    'grades:write', // Submit grades for their courses
    'grades:view_appeals',
    'grades:respond_appeals',

    // === ATTENDANCE ===
    'attendance:read',
    'attendance:write',
    'attendance:manage', // Their classes

    // === SUBMISSIONS ===
    'submissions:read', // Student submissions in their courses
    'submissions:manage', // Grade/evaluate submissions
    'submissions:feedback',

    // === LEAVE MANAGEMENT ===
    'leave_requests:write', // Submit leave requests
    'leave_requests:read',

    // === PERSONAL ===
    'profile:read',
    'schedule:read',
    'calendar:read',
    'documents:read', // Department documents

    // === ANALYTICS ===
    'analytics:read', // Personal teaching analytics
  ],

  // ========================================================================
  // STUDENT - Student access (Personal and course scoped)
  // ========================================================================
  [UserRole.STUDENT]: [
    // === PROFILE ===
    'profile:read',
    'profile:write', // Personal info only

    // === ENROLLMENT ===
    'enrollments:read', // Own enrollments
    'courses:read', // Enrolled courses

    // === GRADES ===
    'grades:read', // Own grades
    'grades:appeal', // File grade appeal

    // === SCHEDULE ===
    'schedule:read',
    'calendar:read',

    // === DOCUMENTS ===
    'documents:read',
    'documents:download',

    // === SUBMISSIONS ===
    'submissions:read', // Own submissions
    'submissions:write', // Submit assignments
    'submissions:view_feedback',

    // === PERSONAL ANALYTICS ===
    'analytics:read', // Personal only
  ],

  // ========================================================================
  // IQAC - Internal Quality Assurance Cell (Read-heavy, assessment focused)
  // ========================================================================
  [UserRole.IQAC]: [
    // === GENERAL READ ACCESS ===
    'departments:read',
    'faculty:read',
    'students:read',
    'courses:read',
    'enrollments:read',
    'grades:read',

    // === QUALITY ASSESSMENT ===
    'accreditation:read',
    'accreditation:write',
    'accreditation:manage',
    'accreditation:submit',

    // === REPORTS & ANALYTICS ===
    'reports:read',
    'reports:generate',
    'reports:export',
    'analytics:read',
    'analytics:export',

    // === AUDIT ===
    'audit:read',
    'audit:export',

    // === EVIDENCE MANAGEMENT ===
    'evidence:read',
    'evidence:write',
    'evidence:manage',
    'evidence:upload',

    // === LEARNING OUTCOMES ===
    'outcomes:read',
    'outcomes:write',
    'outcomes:analyze',
    'outcomes:manage',

    // === SURVEYS ===
    'surveys:read',
    'surveys:create',
    'surveys:analyze',
    'surveys:distribute',

    // === QUALITY METRICS ===
    'metrics:read',
    'metrics:analyze',
    'metrics:export',
  ],

  // ========================================================================
  // MANAGEMENT_VIEWER - Management read-only access (Dashboard focused)
  // ========================================================================
  [UserRole.MANAGEMENT_VIEWER]: [
    // === READ-ONLY ACCESS ===
    'departments:read',
    'faculty:read',
    'students:read',
    'courses:read',
    'enrollments:read',
    'grades:read',

    // === REPORTS ===
    'reports:read',
    'reports:export',

    // === ANALYTICS ===
    'analytics:read',
    'analytics:export',

    // === DASHBOARDS ===
    'dashboards:read',
    'dashboards:export',

    // === AUDIT LOGS ===
    'audit:read',

    // === KEY METRICS ===
    'metrics:read',
  ],
};

/**
 * Role Hierarchy - Used for permission inheritance and delegation
 */
export const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPER_ADMIN]: [],
  [UserRole.ADMIN]: [UserRole.HOD, UserRole.FACULTY, UserRole.STUDENT],
  [UserRole.HOD]: [UserRole.FACULTY, UserRole.STUDENT],
  [UserRole.FACULTY]: [UserRole.STUDENT],
  [UserRole.STUDENT]: [],
  [UserRole.IQAC]: [],
  [UserRole.MANAGEMENT_VIEWER]: [],
};

/**
 * Check if user has permission
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  const rolePermissions = PERMISSION_MATRIX[role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Check if user can access resource
 */
export const canAccess = (role: UserRole, resource: string, action: string): boolean => {
  return hasPermission(role, `${resource}:${action}`);
};

/**
 * Get permissions for role
 */
export const getRolePermissions = (role: UserRole): string[] => {
  return PERMISSION_MATRIX[role] || [];
};

/**
 * Check if role is higher in hierarchy
 */
export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  const hierarchy = ROLE_HIERARCHY[role1] || [];
  return hierarchy.includes(role2);
};

/**
 * Resource-level permissions for fine-grained control
 */
export const RESOURCE_PERMISSIONS: Record<string, string[]> = {
  users: ['read', 'write', 'delete', 'create', 'manage_roles', 'reset_password'],
  departments: ['read', 'write', 'delete', 'create', 'manage'],
  faculty: ['read', 'write', 'delete', 'create', 'manage', 'export'],
  students: ['read', 'write', 'delete', 'create', 'manage', 'export'],
  courses: ['read', 'write', 'delete', 'create', 'manage', 'archive'],
  enrollments: ['read', 'write', 'delete', 'create', 'approve', 'cancel'],
  grades: ['read', 'write', 'delete', 'create', 'approve', 'publish', 'manage_appeals', 'override'],
  workflows: ['read', 'write', 'delete', 'create', 'approve', 'manage', 'configure'],
  accreditation: ['read', 'write', 'delete', 'create', 'manage', 'submit'],
  reports: ['read', 'generate', 'schedule', 'export'],
  analytics: ['read', 'manage', 'export'],
  audit: ['read', 'export', 'delete'],
  settings: ['read', 'write', 'manage', 'configure_security'],
};

/**
 * Department-scoped permissions
 */
export const DEPARTMENT_SCOPED_PERMISSIONS = [
  'faculty:write',
  'faculty:manage',
  'students:write',
  'courses:write',
  'courses:create',
  'courses:manage',
  'enrollments:write',
  'grades:approve',
  'grades:publish',
];

/**
 * Course-scoped permissions
 */
export const COURSE_SCOPED_PERMISSIONS = [
  'students:read',
  'grades:write',
  'grades:approve',
  'classes:manage',
  'submissions:manage',
  'attendance:write',
];

/**
 * Personal-scoped permissions
 */
export const PERSONAL_SCOPED_PERMISSIONS = [
  'profile:write',
  'grades:appeal',
  'submissions:write',
  'leave_requests:write',
];
