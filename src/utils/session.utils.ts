// src/utils/session.utils.ts
// Session management utilities

import crypto from 'crypto';
import { SessionData } from '../types/session.types';

/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate device fingerprint
 */
export const generateDeviceFingerprint = (userAgent: string, ipAddress: string): string => {
  const combined = `${userAgent}:${ipAddress}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

/**
 * Create session data
 */
export const createSessionData = (
  userId: string,
  email: string,
  firstName: string,
  lastName: string,
  role: string,
  permissions: string[],
  ipAddress: string,
  userAgent: string,
  department?: string,
  departmentId?: string,
  isRemembered?: boolean
): SessionData => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + (isRemembered ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000));

  return {
    id: generateSessionId(),
    userId,
    email,
    firstName,
    lastName,
    role,
    department,
    departmentId,
    permissions,
    loginTime: now,
    lastActivity: now,
    ipAddress,
    userAgent,
    isRemembered: isRemembered || false,
    expiresAt,
    createdAt: now,
    updatedAt: now,
  };
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (session: SessionData): boolean => {
  return new Date() > session.expiresAt;
};

/**
 * Check if session is idle
 */
export const isSessionIdle = (session: SessionData, timeoutMs: number): boolean => {
  const now = new Date();
  const idleTime = now.getTime() - session.lastActivity.getTime();
  return idleTime > timeoutMs;
};

/**
 * Update session last activity
 */
export const updateSessionActivity = (session: SessionData): SessionData => {
  return {
    ...session,
    lastActivity: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Serialize session for storage
 */
export const serializeSession = (session: SessionData): string => {
  return JSON.stringify(session);
};

/**
 * Deserialize session from storage
 */
export const deserializeSession = (data: string): SessionData => {
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    loginTime: new Date(parsed.loginTime),
    lastActivity: new Date(parsed.lastActivity),
    expiresAt: new Date(parsed.expiresAt),
    createdAt: new Date(parsed.createdAt),
    updatedAt: new Date(parsed.updatedAt),
  };
};
