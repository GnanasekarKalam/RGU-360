// src/types/session.types.ts
// Session management types

export interface SessionData {
  id: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  department?: string;
  departmentId?: string;
  permissions: string[];
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  isRemembered: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FailedLoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  attemptCount: number;
  lastAttempt: Date;
  lockedUntil?: Date;
  createdAt: Date;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  email?: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface TokenBlacklist {
  id: string;
  token: string;
  tokenType: 'ACCESS' | 'REFRESH';
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface MfaChallenge {
  id: string;
  userId: string;
  method: 'TOTP' | 'EMAIL' | 'SMS';
  code: string;
  verified: boolean;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
}
