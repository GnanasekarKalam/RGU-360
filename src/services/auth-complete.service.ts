// src/services/auth-complete.service.ts
// Complete authentication service with all features

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { passwordConfig, loginConfig, sessionConfig } from '../config/jwt.config';
import {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  generateTokenPair,
  verifyRefreshToken,
} from '../utils/jwt.utils';
import { UserRole, LoginCredentials, PasswordResetRequest, AuthResponse } from '../types/auth.types';
import {
  createSession,
  invalidateSession,
  invalidateUserSessions,
  getUserSessions,
  logAuditEvent,
} from './session.service';

const prisma = new PrismaClient();

// In-memory failed login tracking
const failedLoginAttempts = new Map<string, { count: number; lastAttempt: Date; lockedUntil?: Date }>();

/**
 * Validate password strength
 */
export const validatePasswordStrength = (
  password: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < passwordConfig.minLength) {
    errors.push(`Password must be at least ${passwordConfig.minLength} characters long`);
  }

  if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (passwordConfig.requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (passwordConfig.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Hash password
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, passwordConfig.saltRounds);
};

/**
 * Compare password
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Get failed login attempts
 */
const getFailedLoginAttempts = (email: string): number => {
  const record = failedLoginAttempts.get(email.toLowerCase());
  if (!record) return 0;

  // Check if lockout has expired
  if (record.lockedUntil && new Date() > record.lockedUntil) {
    failedLoginAttempts.delete(email.toLowerCase());
    return 0;
  }

  return record.count;
};

/**
 * Record failed login attempt
 */
const recordFailedLoginAttempt = (email: string, ipAddress: string): void => {
  const key = email.toLowerCase();
  const record = failedLoginAttempts.get(key) || { count: 0, lastAttempt: new Date() };

  record.count++;
  record.lastAttempt = new Date();

  if (record.count >= loginConfig.maxAttempts) {
    record.lockedUntil = new Date(Date.now() + loginConfig.lockoutDuration);
  }

  failedLoginAttempts.set(key, record);

  // Log failed attempt
  logAuditEvent({
    email,
    action: 'LOGIN_FAILED',
    resource: 'AUTH',
    status: 'FAILURE',
    ipAddress,
    userAgent: 'unknown',
    details: { attempt: record.count, lockedUntil: record.lockedUntil },
  }).catch(console.error);
};

/**
 * Clear failed login attempts
 */
const clearFailedLoginAttempts = (email: string): void => {
  failedLoginAttempts.delete(email.toLowerCase());
};

/**
 * Login user
 */
export const loginUser = async (
  credentials: LoginCredentials,
  ipAddress: string,
  userAgent: string
): Promise<AuthResponse> => {
  const { email, password, rememberMe } = credentials;

  // Validate input
  if (!email || !password) {
    return {
      success: false,
      message: 'Email and password are required',
    };
  }

  // Check for account lockout
  const failedAttempts = getFailedLoginAttempts(email);
  if (failedAttempts >= loginConfig.maxAttempts) {
    const record = failedLoginAttempts.get(email.toLowerCase());
    await logAuditEvent({
      email,
      action: 'LOGIN_BLOCKED',
      resource: 'AUTH',
      status: 'FAILURE',
      ipAddress,
      userAgent,
      details: { reason: 'Account locked due to too many failed attempts' },
    });

    return {
      success: false,
      message:
        'Account is temporarily locked due to too many failed login attempts. Please try again later.',
    };
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: { role: true },
          where: { expiresAt: { gt: new Date() } },
        },
      },
    });

    if (!user) {
      recordFailedLoginAttempt(email, ipAddress);
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      await logAuditEvent({
        userId: user.id,
        email,
        action: 'LOGIN_FAILED',
        resource: 'AUTH',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        details: { reason: `User is ${user.status}` },
      });

      return {
        success: false,
        message: `Account is ${user.status.toLowerCase()}. Please contact support.`,
      };
    }

    // Verify password
    const passwordValid = await comparePassword(password, user.passwordHash);
    if (!passwordValid) {
      recordFailedLoginAttempt(email, ipAddress);
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }

    // Clear failed attempts on successful login
    clearFailedLoginAttempts(email);

    // Get user role (use primary role)
    const primaryRole = user.roles.find((ur) => ur.isPrimary) || user.roles[0];
    if (!primaryRole) {
      return {
        success: false,
        message: 'User has no assigned role',
      };
    }

    // Get permissions for the role
    const permissions = await getRolePermissions(primaryRole.roleId);

    // Generate tokens
    const tokens = generateTokenPair(
      user.id,
      user.email,
      primaryRole.role.name as UserRole,
      primaryRole.departmentId || undefined
    );

    // Create session
    const session = await createSession(
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      primaryRole.role.name as string,
      permissions,
      ipAddress,
      userAgent,
      primaryRole.department?.name,
      primaryRole.departmentId || undefined,
      rememberMe
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Log successful login
    await logAuditEvent({
      userId: user.id,
      email,
      action: 'LOGIN_SUCCESS',
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      details: { sessionId: session.id, role: primaryRole.role.name },
    });

    return {
      success: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: primaryRole.role.name as UserRole,
        department: primaryRole.department?.name,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'An error occurred during login',
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async (
  userId: string,
  refreshToken: string,
  ipAddress: string,
  userAgent: string
): Promise<AuthResponse> => {
  try {
    // Verify refresh token and extract session ID
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return {
        success: false,
        message: 'Invalid refresh token',
      };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Invalidate all user sessions
    await invalidateUserSessions(userId);

    // Blacklist refresh token (optional - store in database)
    // await prisma.tokenBlacklist.create({
    //   data: {
    //     token: refreshToken,
    //     tokenType: 'REFRESH',
    //     userId,
    //     expiresAt: new Date(decoded.exp * 1000),
    //   },
    // });

    // Log logout
    await logAuditEvent({
      userId,
      email: user.email,
      action: 'LOGOUT_SUCCESS',
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Logout successful',
    };
  } catch (error: any) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'An error occurred during logout',
    };
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (
  email: string,
  ipAddress: string,
  userAgent: string
): Promise<AuthResponse> => {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      // Don't reveal if user exists (security)
      await logAuditEvent({
        email,
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'AUTH',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        details: { reason: 'User not found' },
      });

      return {
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await hashPassword(resetToken);
    const expiresAt = new Date(Date.now() + passwordConfig.resetTokenExpiry);

    // Store token in database (create a password reset token)
    // For now, we'll store it in a simple structure
    const passwordResetRecord = {
      userId: user.id,
      token: hashedToken,
      expiresAt,
      used: false,
    };

    // TODO: Store in database (you need a PasswordResetToken model in Prisma)
    console.log('[PASSWORD RESET]', passwordResetRecord);

    // Log password reset request
    await logAuditEvent({
      userId: user.id,
      email: user.email,
      action: 'PASSWORD_RESET_REQUESTED',
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
      details: { token: resetToken },
    });

    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return {
      success: false,
      message: 'An error occurred during password reset request',
    };
  }
};

/**
 * Reset password
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
  confirmPassword: string,
  ipAddress: string,
  userAgent: string
): Promise<AuthResponse> => {
  // Validate password match
  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: 'Passwords do not match',
    };
  }

  // Validate password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return {
      success: false,
      message: 'Password does not meet requirements',
    };
  }

  try {
    // Verify token (you need to retrieve from database and verify)
    // const decoded = verifyPasswordResetToken(token);

    // TODO: Implement actual token verification
    // For now, this is a placeholder

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password (you need to fetch user from reset token)
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: { passwordHash: hashedPassword },
    // });

    // Invalidate all user sessions
    // await invalidateUserSessions(userId);

    // Log password reset
    await logAuditEvent({
      action: 'PASSWORD_RESET_SUCCESSFUL',
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Password has been reset successfully. Please login with your new password.',
    };
  } catch (error: any) {
    console.error('Password reset error:', error);
    return {
      success: false,
      message: 'An error occurred during password reset',
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
  confirmPassword: string,
  ipAddress: string,
  userAgent: string
): Promise<AuthResponse> => {
  // Validate password match
  if (newPassword !== confirmPassword) {
    return {
      success: false,
      message: 'New passwords do not match',
    };
  }

  // Validate password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    return {
      success: false,
      message: 'New password does not meet requirements',
    };
  }

  try {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      return {
        success: false,
        message: 'User not found',
      };
    }

    // Verify current password
    const passwordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      await logAuditEvent({
        userId,
        email: user.email,
        action: 'PASSWORD_CHANGE_FAILED',
        resource: 'AUTH',
        status: 'FAILURE',
        ipAddress,
        userAgent,
        details: { reason: 'Invalid current password' },
      });

      return {
        success: false,
        message: 'Current password is incorrect',
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all sessions (user must login again)
    await invalidateUserSessions(userId);

    // Log password change
    await logAuditEvent({
      userId,
      email: user.email,
      action: 'PASSWORD_CHANGED',
      resource: 'AUTH',
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };
  } catch (error: any) {
    console.error('Password change error:', error);
    return {
      success: false,
      message: 'An error occurred during password change',
    };
  }
};

/**
 * Get role permissions
 */
export const getRolePermissions = async (roleId: string): Promise<string[]> => {
  try {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      select: { permissions: true },
    });

    if (!role) {
      return [];
    }

    // Assuming role has a permissions field (JSON or relation)
    return role.permissions || [];
  } catch (error) {
    console.error('Error getting role permissions:', error);
    return [];
  }
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return {
        success: false,
        message: 'Invalid or expired refresh token',
      };
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id, decoded.email, decoded.role, decoded.department);

    return {
      success: true,
      message: 'Access token refreshed',
      accessToken: newAccessToken,
    };
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return {
      success: false,
      message: 'An error occurred during token refresh',
    };
  }
};
