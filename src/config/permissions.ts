// src/config/permissions.ts
// Complete permission matrix for all roles

import { UserRole, Permission } from '../types/auth.types';

/**
 * Permission Matrix - Defines what each role can do
 * Format: resource:action
 */
export const PERMISSION_MATRIX: Record<UserRole, string[]> = {
  // ========================================================================
  // SUPER_ADMIN - Full system access
  // ========================================================================
  [UserRole.SUPER_ADMIN]: [
    // User Management
    'users:read',
    'users:write',
    'users:delete',
    'users:manage_roles',
    'users:reset_password',
    'users:view_audit_logs',

    // Department Management
    'departments:read',
    'departments:write',
    'departments:delete',

    // Faculty Management
    'faculty:read',
    'faculty:write',
    'faculty:delete',
    'faculty:manage',

    // Student Management
    'students:read',
    'students:write',
    'students:delete',

    // Course Management
    'courses:read',
    'courses:write',
    'courses:delete',
    'courses:manage',

    // Enrollment Management
    'enrollments:read',
    'enrollments:write',
    'enrollments:delete',
    'enrollments:approve',

    // Grade Management
    'grades:read',
    'grades:write',
    'grades:delete',
    'grades:approve',
    'grades:manage_appeals',

    // Workflow & Approvals
    'workflows:read',
    'workflows:write',
    'workflows:approve',
    'workflows:manage',

    // Accreditation
    'accreditation:read',
    'accreditation:write',
    'accreditation:delete',
    'accreditation:manage',

    // System Settings
    'settings:read',
    'settings:write',
    'settings:manage',

    // Audit & Reports
    'reports:read',
    'reports:generate',
    'audit:read',
    'audit:export',

    // Analytics
    'analytics:read',
    'analytics:manage',
  ],

  // ========================================================================
  // ADMIN - Administrative access with restrictions
  // ========================================================================
  [UserRole.ADMIN]: [
    // User Management
    'users:read',
    'users:write',
    'users:reset_password',
    'users:view_audit_logs',

    // Department Management
    'departments:read',
    'departments:write',

    // Faculty Management
    'faculty:read',
    'faculty:write',

    // Student Management
    'students:read',
    'students:write',

    // Course Management
    'courses:read',
    'courses:write',
    'courses:manage',

    // Enrollment Management
    'enrollments:read',
    'enrollments:write',
    'enrollments:approve',

    // Grade Management
    'grades:read',
    'grades:approve',
    'grades:manage_appeals',

    // Workflow & Approvals
    'workflows:read',
    'workflows:approve',

    // Reports
    'reports:read',
    'reports:generate',
    'audit:read',

    // Analytics
    'analytics:read',
  ],

  // ========================================================================
  // HOD - Head of Department
  // ========================================================================
  [UserRole.HOD]: [
    // Department Resources
    'departments:read',
    'faculty:read',
    'faculty:write', // Only in their department
    'students:read', // Only their department students

    // Course Management
    'courses:read',
    'courses:write', // Only department courses

    // Faculty Approvals
    'grades:approve',
    'grades:manage_appeals',

    // Workflow Approvals
    'workflows:read',
    'workflows:approve',

    // Leave Requests
    'leave_requests:read',
    'leave_requests:approve',

    // Curriculum
    'curriculum:read',
    'curriculum:write',
    'curriculum:approve',

    // Reports
    'reports:read',
    'reports:generate',

    // Analytics
    'analytics:read',

    // Academic Planning
    'academic_planning:read',
  ],

  // ========================================================================
  // FACULTY - Faculty member access
  // ========================================================================
  [UserRole.FACULTY]: [
    // Profile
    'profile:read',
    'profile:write',

    // Course Management
    'courses:read',
    'classes:read',

    // Student Management (their courses only)
    'students:read',
    'enrollments:read',

    // Grade Management
    'grades:read',
    'grades:write', // Submit grades
    'grades:view_appeals',

    // Attendance
    'attendance:read',
    'attendance:write',

    // Class Management
    'classes:read',
    'classes:manage',

    // Submissions
    'submissions:read',
    'submissions:manage',

    // Leave Management
    'leave_requests:write', // Submit leave
    'leave_requests:read',

    // Personal
    'schedule:read',
    'calendar:read',
    'documents:read',

    // Analytics
    'analytics:read', // Personal analytics only
  ],

  // ========================================================================
  // STUDENT - Student access
  // ========================================================================
  [UserRole.STUDENT]: [
    // Profile
    'profile:read',
    'profile:write',

    // Enrollment
    'enrollments:read', // View own enrollments
    'courses:read',

    // Grades
    'grades:read', // View own grades
    'grades:appeal', // File grade appeal

    // Schedule
    'schedule:read',
    'calendar:read',

    // Documents
    'documents:read',
    'documents:download',

    // Submissions
    'submissions:read',
    'submissions:write',

    // Personal Analytics
    'analytics:read', // Personal only
  ],

  // ========================================================================
  // IQAC - Internal Quality Assurance Cell
  // ========================================================================
  [UserRole.IQAC]: [
    // General Read Access
    'departments:read',
    'faculty:read',
    'students:read',
    'courses:read',
    'enrollments:read',
    'grades:read',

    // Quality Assessment
    'accreditation:read',
    'accreditation:write',
    'accreditation:manage',

    // Reports & Analytics
    'reports:read',
    'reports:generate',
    'analytics:read',

    // Audit
    'audit:read',
    'audit:export',

    // Evidence Management
    'evidence:read',
    'evidence:write',
    'evidence:manage',

    // Learning Outcomes
    'outcomes:read',
    'outcomes:write',
    'outcomes:analyze',

    // Surveys
    'surveys:read',
    'surveys:create',
    'surveys:analyze',
  ],

  // ========================================================================
  // MANAGEMENT_VIEWER - Management read-only access
  // ========================================================================
  [UserRole.MANAGEMENT_VIEWER]: [
    // Read-only access to key reports
    'departments:read',
    'faculty:read',
    'students:read',
    'courses:read',
    'enrollments:read',
    'grades:read',

    // Reports & Analytics
    'reports:read',
    'analytics:read',

    // Dashboard Access
    'dashboard:read',

    // High-level statistics only
    'statistics:read',
  ],
};

/**
 * Detailed Resource Permissions
 */
export const RESOURCE_PERMISSIONS: Permission[] = [
  // User Management
  {
    resource: 'users',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
    ],
  },
  {
    resource: 'users',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    resource: 'users',
    action: 'delete',
    roles: [UserRole.SUPER_ADMIN],
  },
  {
    resource: 'users',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },

  // Department Management
  {
    resource: 'departments',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
  {
    resource: 'departments',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    resource: 'departments',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOD],
  },

  // Faculty Management
  {
    resource: 'faculty',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
  {
    resource: 'faculty',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOD],
  },
  {
    resource: 'faculty',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },

  // Student Management
  {
    resource: 'students',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.FACULTY,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
  {
    resource: 'students',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },
  {
    resource: 'students',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },

  // Grade Management
  {
    resource: 'grades',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.FACULTY,
      UserRole.STUDENT,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
  {
    resource: 'grades',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY],
  },
  {
    resource: 'grades',
    action: 'approve',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOD],
  },
  {
    resource: 'grades',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },

  // Workflow Approvals
  {
    resource: 'workflows',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
    ],
  },
  {
    resource: 'workflows',
    action: 'approve',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOD],
  },
  {
    resource: 'workflows',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  },

  // Accreditation
  {
    resource: 'accreditation',
    action: 'read',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.IQAC],
  },
  {
    resource: 'accreditation',
    action: 'write',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.IQAC],
  },
  {
    resource: 'accreditation',
    action: 'manage',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.IQAC],
  },

  // Reports
  {
    resource: 'reports',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
  {
    resource: 'reports',
    action: 'generate',
    roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.HOD, UserRole.IQAC],
  },

  // Analytics
  {
    resource: 'analytics',
    action: 'read',
    roles: [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.HOD,
      UserRole.IQAC,
      UserRole.MANAGEMENT_VIEWER,
    ],
  },
];

/**
 * Get permissions for a specific role
 */
export const getPermissionsForRole = (role: UserRole): string[] => {
  return PERMISSION_MATRIX[role] || [];
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

/**
 * Check if a role can perform an action on a resource
 */
export const canAccess = (
  role: UserRole,
  resource: string,
  action: string
): boolean => {
  return hasPermission(role, `${resource}:${action}`);
};

/**
 * Get common access levels
 */
export const ACCESS_LEVELS = {
  FULL: [UserRole.SUPER_ADMIN],
  ADMIN: [UserRole.SUPER_ADMIN, UserRole.ADMIN],
  MANAGEMENT: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.HOD,
    UserRole.IQAC,
  ],
  FACULTY_PLUS: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.HOD,
    UserRole.FACULTY,
    UserRole.IQAC,
  ],
  ALL: Object.values(UserRole),
} as const;
