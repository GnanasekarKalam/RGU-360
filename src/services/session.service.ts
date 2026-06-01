// src/services/session.service.ts
// Session management service

import { PrismaClient } from '@prisma/client';
import { SessionData, AuditLogEntry } from '../types/session.types';
import { sessionConfig } from '../config/jwt.config';
import { createSessionData, updateSessionActivity, isSessionExpired, isSessionIdle } from '../utils/session.utils';

const prisma = new PrismaClient();

// In-memory session store (replace with Redis for production)
const sessions = new Map<string, SessionData>();

/**
 * Create a new session
 */
export const createSession = async (
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
): Promise<SessionData> => {
  const session = createSessionData(
    userId,
    email,
    firstName,
    lastName,
    role,
    permissions,
    ipAddress,
    userAgent,
    department,
    departmentId,
    isRemembered
  );

  sessions.set(session.id, session);

  // Log session creation
  await logAuditEvent({
    userId,
    email,
    action: 'SESSION_CREATED',
    resource: 'SESSION',
    status: 'SUCCESS',
    ipAddress,
    userAgent,
    details: { sessionId: session.id },
  });

  return session;
};

/**
 * Get session by ID
 */
export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  const session = sessions.get(sessionId);

  if (!session) {
    return null;
  }

  // Check if session is expired
  if (isSessionExpired(session)) {
    sessions.delete(sessionId);
    return null;
  }

  // Check if session is idle
  if (isSessionIdle(session, sessionConfig.inactivityTimeout)) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
};

/**
 * Update session activity
 */
export const refreshSession = async (sessionId: string): Promise<SessionData | null> => {
  const session = await getSession(sessionId);

  if (!session) {
    return null;
  }

  const updatedSession = updateSessionActivity(session);
  sessions.set(sessionId, updatedSession);

  return updatedSession;
};

/**
 * Clear session (alternate name for invalidateSession)
 */
export const clearSession = async (sessionId: string): Promise<void> => {
  const session = sessions.get(sessionId);

  if (session) {
    // Log session termination
    await logAuditEvent({
      userId: session.userId,
      email: session.email,
      action: 'SESSION_TERMINATED',
      resource: 'SESSION',
      status: 'SUCCESS',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      details: { sessionId },
    });

    sessions.delete(sessionId);
  }
};

/**
 * Invalidate all sessions for a user
 */
export const invalidateUserSessions = async (userId: string): Promise<void> => {
  const userSessions = Array.from(sessions.entries())
    .filter(([_, session]) => session.userId === userId)
    .map(([id]) => id);

  for (const sessionId of userSessions) {
    await invalidateSession(sessionId);
  }
};

/**
 * Get all active sessions for a user
 */
export const getUserSessions = async (userId: string): Promise<SessionData[]> => {
  const userSessions = Array.from(sessions.values())
    .filter(session => session.userId === userId && !isSessionExpired(session) && !isSessionIdle(session, sessionConfig.inactivityTimeout));

  return userSessions;
};

/**
 * Cleanup expired sessions
 */
export const cleanupExpiredSessions = async (): Promise<number> => {
  let count = 0;

  for (const [sessionId, session] of sessions.entries()) {
    if (isSessionExpired(session) || isSessionIdle(session, sessionConfig.inactivityTimeout)) {
      sessions.delete(sessionId);
      count++;
    }
  }

  return count;
};

/**
 * Get session count
 */
export const getSessionCount = (): number => {
  return sessions.size;
};

/**
 * Log audit event
 */
export const logAuditEvent = async (event: Partial<AuditLogEntry>): Promise<void> => {
  try {
    // In production, save to database
    console.log('[AUDIT LOG]', {
      ...event,
      timestamp: new Date().toISOString(),
    });

    // Optional: Save to database
    // await prisma.auditLog.create({
    //   data: {
    //     ...event,
    //     createdAt: new Date(),
    //   },
    // });
  } catch (error) {
    console.error('Failed to log audit event:', error);
  }
};

/**
 * Verify session validity
 */
export const verifySessionValidity = async (sessionId: string, userId: string): Promise<boolean> => {
  const session = await getSession(sessionId);

  if (!session) {
    return false;
  }

  if (session.userId !== userId) {
    return false;
  }

  return true;
};

/**
 * Get session summary for user
 */
export const getSessionSummary = async (userId: string) => {
  const sessions_list = await getUserSessions(userId);

  return {
    totalSessions: sessions_list.length,
    sessions: sessions_list.map(session => ({
      id: session.id,
      ipAddress: session.ipAddress,
      device: session.userAgent,
      loginTime: session.loginTime,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
    })),
  };
};

/**
 * Update session activity
 */
export const updateSessionActivity = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    // In production, update in Redis or database
    const session = await prisma.apiKey.findUnique({
      where: { key: sessionId },
    });

    if (!session || session.userId !== userId) {
      return false;
    }

    // Check if expired
    if (session.expiresAt && session.expiresAt < new Date()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get active sessions for user
 */
export const getUserActiveSessions = async (userId: string): Promise<SessionInfo[]> => {
  try {
    const sessions = await prisma.apiKey.findMany({
      where: {
        userId,
        permissions: { has: 'session' },
        expiresAt: { gt: new Date() },
      },
    });

    return sessions.map((s) => ({
      userId,
      sessionId: s.key,
      email: s.name.split(' - ')[1] || '',
      loginTime: s.createdAt!,
      lastActivity: s.updatedAt!,
      isActive: true,
    }));
  } catch {
    return [];
  }
};

/**
 * Invalidate session
 */
export const invalidateSession = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    const session = await prisma.apiKey.findUnique({
      where: { key: sessionId },
    });

    if (!session || session.userId !== userId) {
      return false;
    }

    await prisma.apiKey.delete({
      where: { key: sessionId },
    });

    return true;
  } catch {
    return false;
  }
};

/**
 * Invalidate all sessions for user (logout from all devices)
 */
export const invalidateAllUserSessions = async (userId: string): Promise<number> => {
  try {
    const result = await prisma.apiKey.deleteMany({
      where: {
        userId,
        permissions: { has: 'session' },
      },
    });

    return result.count;
  } catch {
    return 0;
  }
};

/**
 * Check session validity
 */
export const isSessionValid = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    const session = await prisma.apiKey.findUnique({
      where: { key: sessionId },
    });

    if (!session || session.userId !== userId) {
      return false;
    }

    // Check expiry
    if (session.expiresAt && session.expiresAt < new Date()) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Get session info
 */
export const getSessionInfo = async (
  userId: string,
  sessionId: string
): Promise<SessionInfo | null> => {
  try {
    const session = await prisma.apiKey.findUnique({
      where: { key: sessionId },
    });

    if (!session || session.userId !== userId) {
      return null;
    }

    return {
      userId,
      sessionId: session.key,
      email: session.name.split(' - ')[1] || '',
      loginTime: session.createdAt!,
      lastActivity: session.updatedAt!,
      isActive: true,
    };
  } catch {
    return null;
  }
};

/**
 * Clean expired sessions
 */
export const cleanExpiredSessions = async (): Promise<number> => {
  try {
    const result = await prisma.apiKey.deleteMany({
      where: {
        permissions: { has: 'session' },
        expiresAt: { lt: new Date() },
      },
    });

    return result.count;
  } catch {
    return 0;
  }
};

/**
 * Get session statistics
 */
export const getSessionStats = async (userId: string) => {
  try {
    const sessions = await prisma.apiKey.findMany({
      where: {
        userId,
        permissions: { has: 'session' },
      },
    });

    const activeSessions = sessions.filter((s) => !s.expiresAt || s.expiresAt > new Date());
    const expiredSessions = sessions.filter((s) => s.expiresAt && s.expiresAt <= new Date());

    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      expiredSessions: expiredSessions.length,
      oldestSession: sessions.length > 0 ? sessions[sessions.length - 1].createdAt : null,
      newestSession: sessions.length > 0 ? sessions[0].createdAt : null,
    };
  } catch {
    return {
      totalSessions: 0,
      activeSessions: 0,
      expiredSessions: 0,
      oldestSession: null,
      newestSession: null,
    };
  }
};

/**
 * Extend session timeout
 */
export const extendSessionTimeout = async (
  userId: string,
  sessionId: string
): Promise<boolean> => {
  try {
    const session = await prisma.apiKey.findUnique({
      where: { key: sessionId },
    });

    if (!session || session.userId !== userId) {
      return false;
    }

    // Extend expiry by inactivity timeout
    const newExpiry = new Date(
      Date.now() + sessionConfig.inactivityTimeout
    );

    await prisma.apiKey.update({
      where: { key: sessionId },
      data: { expiresAt: newExpiry },
    });

    return true;
  } catch {
    return false;
  }
};
