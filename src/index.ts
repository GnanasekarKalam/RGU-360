// src/index.ts
// Complete Authentication System - Main Export File
// This file exports all authentication-related modules

// ============================================================================
// TYPES
// ============================================================================
export * from './types/auth.types';
export * from './types/faculty-master.types';
export * from './types/student-master.types';

// ============================================================================
// CONFIGURATION
// ============================================================================
export {
  jwtConfig,
  passwordConfig,
  sessionConfig,
  loginConfig,
  mfaConfig,
  auditConfig,
  corsConfig,
  rateLimitConfig,
} from './config/jwt.config';

export {
  PERMISSION_MATRIX,
  ROLE_HIERARCHY,
  hasPermission,
  canAccess,
  getRolePermissions,
  isHigherRole,
  RESOURCE_PERMISSIONS,
  DEPARTMENT_SCOPED_PERMISSIONS,
  COURSE_SCOPED_PERMISSIONS,
  PERSONAL_SCOPED_PERMISSIONS,
} from './config/permissions-complete';

// ============================================================================
// SERVICES
// ============================================================================
export {
  validatePasswordStrength,
  hashPassword,
  comparePassword,
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  getRolePermissions as getAuthRolePermissions,
  refreshAccessToken,
} from './services/auth-complete.service';

export {
  createSession,
  getSession,
  refreshSession,
  invalidateSession,
  invalidateUserSessions,
  getUserSessions,
  cleanupExpiredSessions,
  getSessionCount,
  logAuditEvent,
  verifySessionValidity,
  getSessionSummary,
} from './services/session.service';

export {
  createRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  setPrimaryRole,
  getUserPermissions,
  userHasPermission,
  roleCanAccess,
  getAllRoles,
  bulkAssignRole,
  canManageUsers,
  canManageDepartments,
  canViewAuditLogs,
  canManageRoles,
  canAccessDepartment,
  getUserDepartments,
} from './services/role.service';

export {
  generateTotpSecret,
  generateMfaCode,
  createMfaChallenge,
  verifyMfaCode,
  enableMfa,
  disableMfa,
  getUserMfaStatus,
  generateBackupCodes,
  storeBackupCodes,
  verifyBackupCode,
  sendMfaCodeByEmail,
  sendMfaCodeBySms,
} from './services/mfa.service';

// ============================================================================
// FACULTY MASTER MODULE SERVICES
// ============================================================================
export {
  getFacultyProfile,
  updateFacultyProfile,
  addQualification,
  getQualifications,
  deleteQualification,
  addPublication,
  getPublications,
  deletePublication,
  addFDP,
  getFDPPrograms,
  deleteFDP,
  addSeminar,
  getSeminars,
  deleteSeminar,
  addPhdCandidate,
  getPhdCandidates,
  updatePhdProgress,
  deletePhdCandidate,
  addSkill,
  getSkills,
  deleteSkill,
  addEvidence,
  getEvidence,
  verifyEvidence,
  deleteEvidence,
  getFacultyDashboard,
} from './services/faculty-master.service';

// ============================================================================
// STUDENT MASTER MODULE SERVICES
// ============================================================================
export {
  getStudentProfile,
  updateStudentProfile,
  addParent,
  getParents,
  updateParent,
  deleteParent,
  createAcademicRecord,
  getAcademicRecords,
  deleteAcademicRecord,
  createFee,
  getFees,
  recordFeePayment,
  getFeeSummary,
  assignTutorWard,
  getTutorWard,
  updateTutorWard,
  terminateTutorWard,
  getStudentDashboard,
  getTuteesList,
} from './services/student-master.service';

// ============================================================================
// ROUTES
// ============================================================================
export { default as facultyRoutes } from './routes/faculty-master.routes';
export { default as studentRoutes } from './routes/student-master.routes';

// ============================================================================
// UTILITIES
// ============================================================================
export {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateTokenPair,
  verifyRefreshToken,
  verifyAccessToken,
  extractTokenFromHeader,
  shouldRefreshToken,
} from './utils/jwt.utils';

export {
  generateSessionId,
  generateDeviceFingerprint,
  createSessionData,
  isSessionExpired,
  isSessionIdle,
  updateSessionActivity,
  serializeSession,
  deserializeSession,
} from './utils/session.utils';

// ============================================================================
// MIDDLEWARE
// ============================================================================
export {
  authenticate,
  validateSession,
  authorize,
  requireRole,
  requirePermission,
  rateLimitLogin,
  rateLimitPasswordReset,
  clearLoginAttempts,
  departmentScope,
  ownerOrAdmin,
} from './middleware/auth-complete.middleware';

// ============================================================================
// ROUTES
// ============================================================================
export { default as authRoutes } from './routes/auth-complete.routes';

// ============================================================================
// FEATURE SUMMARY
// ============================================================================
/**
 * COMPLETE AUTHENTICATION SYSTEM FEATURES:
 *
 * ✅ USER ROLES (7 roles)
 *   - Super Admin (full system access)
 *   - Admin (administrative access)
 *   - HOD (department-scoped)
 *   - Faculty (course-scoped)
 *   - Student (personal-scoped)
 *   - IQAC (quality assurance)
 *   - Management Viewer (read-only dashboards)
 *
 * ✅ AUTHENTICATION FEATURES
 *   - Email and password login
 *   - Secure JWT token generation (access + refresh)
 *   - Logout with session invalidation
 *   - Token refresh mechanism
 *   - Session management with timeout/expiry
 *   - Remember me functionality
 *   - Failed login attempt tracking with account lockout
 *
 * ✅ PASSWORD MANAGEMENT
 *   - Password strength validation
 *   - Bcrypt hashing with salt rounds
 *   - Password reset with token expiry
 *   - Password change for authenticated users
 *   - Configurable password requirements
 *
 * ✅ ROLE-BASED ACCESS CONTROL (RBAC)
 *   - Fine-grained permission matrix
 *   - 100+ resource:action permissions
 *   - Department-scoped access
 *   - Course-scoped access
 *   - Personal-scoped access
 *   - Role hierarchy
 *
 * ✅ SESSION MANAGEMENT
 *   - Session creation and tracking
 *   - Session timeout (configurable)
 *   - Session cleanup
 *   - Multi-device session support
 *   - Session invalidation on logout
 *   - Device fingerprinting
 *
 * ✅ SECURITY FEATURES
 *   - HTTP-only cookies
 *   - CORS protection
 *   - Rate limiting (login, password reset)
 *   - Account lockout mechanism
 *   - Audit logging
 *   - Token blacklisting ready
 *   - MFA support (TOTP, Email, SMS)
 *
 * ✅ MULTI-FACTOR AUTHENTICATION
 *   - TOTP generation and verification
 *   - Email OTP delivery
 *   - SMS OTP support
 *   - Backup codes generation
 *   - MFA status management
 *
 * ✅ AUDIT & LOGGING
 *   - Login attempts (success/failure)
 *   - Password changes
 *   - Role assignments
 *   - Permission denials
 *   - Session events
 *   - Configurable retention
 *
 * ✅ API ENDPOINTS
 *   - POST /auth/login
 *   - POST /auth/logout
 *   - POST /auth/logout-all
 *   - POST /auth/refresh-token
 *   - POST /auth/request-password-reset
 *   - POST /auth/reset-password
 *   - POST /auth/change-password
 *   - POST /auth/validate-password
 *   - GET /auth/me
 *   - GET /auth/sessions
 *   - DELETE /auth/sessions/:sessionId
 *
 * ✅ MIDDLEWARE
 *   - authenticate: Verify JWT tokens
 *   - validateSession: Check session validity
 *   - authorize: Permission-based access
 *   - requireRole: Role-based access
 *   - requirePermission: Resource-action access
 *   - rateLimitLogin: Prevent brute force
 *   - departmentScope: Department access control
 *   - ownerOrAdmin: Personal resource access
 */
