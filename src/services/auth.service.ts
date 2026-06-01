// src/services/auth.service.ts
// Authentication service - handles login, logout, password reset, etc.

import bcrypt from 'bcrypt';
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
import { UserRole, LoginCredentials, PasswordResetRequest } from '../types/auth.types';

const prisma = new PrismaClient();

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): { valid: boolean; errors: string[] } => {
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
 * Login user
 */
export const loginUser = async (credentials: LoginCredentials) => {
  const { email, password, rememberMe } = credentials;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    // Log failed attempt
    await logAuthAttempt(email, false, 'User not found');
    throw new Error('Invalid email or password');
  }

  // Check if user is active
  if (user.status !== 'ACTIVE') {
    await logAuthAttempt(email, false, `User is ${user.status}`);
    throw new Error(`Account is ${user.status.toLowerCase()}`);
  }

  // Check failed login attempts
  const failedAttempts = await getFailedLoginAttempts(email);
  if (failedAttempts >= loginConfig.maxAttempts) {
    await logAuthAttempt(email, false, 'Too many failed attempts');
    throw new Error('Account locked due to too many failed login attempts. Try again later.');
  }

  // Verify password
  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    await recordFailedLoginAttempt(email);
    await logAuthAttempt(email, false, 'Invalid password');
    throw new Error('Invalid email or password');
  }

  // Clear failed attempts on successful login
  await clearFailedLoginAttempts(email);

  // Get user role (use primary role)
  const primaryRole = user.roles.find((ur) => ur.isPrimary);
  if (!primaryRole) {
    throw new Error('User has no assigned role');
  }

  const role = primaryRole.role.name as UserRole;

  // Generate tokens
  const tokens = generateTokenPair(
    user.id,
    user.email,
    role,
    primaryRole.departmentId || undefined
  );

  // Create session
  const sessionData = {
    userId: user.id,
    email: user.email,
    role,
    loginTime: new Date(),
    rememberMe: rememberMe || false,
  };

  // Store refresh token in database
  await prisma.apiKey.create({
    data: {
      key: tokens.refreshToken,
      name: `Refresh Token - ${new Date().toISOString()}`,
      userId: user.id,
      permissions: [role],
      expiresAt: new Date(
        Date.now() +
          (rememberMe
            ? 30 * 24 * 60 * 60 * 1000
            : 7 * 24 * 60 * 60 * 1000)
      ),
    },
  });

  // Log successful login
  await logAuthAttempt(email, true, 'Login successful');

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
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
      role,
      department: primaryRole.departmentId,
    },
  };
};

/**
 * Logout user
 */
export const logoutUser = async (userId: string, refreshToken: string) => {
  // Invalidate refresh token
  await prisma.apiKey.deleteMany({
    where: {
      userId,
      key: refreshToken,
    },
  });

  // Log logout
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user) {
    await logAuthAttempt(user.email, true, 'Logout successful');
  }

  return { success: true, message: 'Logout successful' };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  const verified = verifyRefreshToken(refreshToken);
  if (!verified) {
    throw new Error('Invalid or expired refresh token');
  }

  // Check if token exists in database
  const storedToken = await prisma.apiKey.findUnique({
    where: { key: refreshToken },
  });

  if (!storedToken || !storedToken.userId) {
    throw new Error('Refresh token not found');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: storedToken.userId },
    include: {
      roles: {
        include: { role: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Get user role
  const primaryRole = user.roles.find((ur) => ur.isPrimary);
  if (!primaryRole) {
    throw new Error('User has no assigned role');
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(
    user.id,
    user.email,
    primaryRole.role.name as UserRole,
    primaryRole.departmentId || undefined
  );

  return {
    success: true,
    accessToken: newAccessToken,
    expiresIn: '15m',
  };
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists
    return {
      success: true,
      message: 'If email exists, password reset link will be sent',
    };
  }

  // Generate reset token
  const resetToken = generatePasswordResetToken();

  // Store reset token
  await prisma.apiKey.create({
    data: {
      key: resetToken,
      name: `Password Reset Token - ${email}`,
      userId: user.id,
      permissions: ['password_reset'],
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  // TODO: Send email with reset link
  // await sendPasswordResetEmail(email, resetToken);

  await logAuthAttempt(email, true, 'Password reset requested');

  return {
    success: true,
    message: 'If email exists, password reset link will be sent',
  };
};

/**
 * Reset password
 */
export const resetPassword = async (
  resetRequest: PasswordResetRequest
) => {
  const { token, newPassword, confirmPassword } = resetRequest;

  // Verify token
  if (!verifyPasswordResetToken(token)) {
    throw new Error('Invalid or expired reset token');
  }

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    throw new Error('Passwords do not match');
  }

  // Validate password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    throw new Error(`Password is weak: ${validation.errors.join(', ')}`);
  }

  // Find user with this reset token
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: token },
  });

  if (!apiKey || !apiKey.userId) {
    throw new Error('Invalid reset token');
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await prisma.user.update({
    where: { id: apiKey.userId },
    data: {
      passwordHash: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  // Invalidate all refresh tokens
  await prisma.apiKey.deleteMany({
    where: {
      userId: apiKey.userId,
      permissions: { has: 'refresh' },
    },
  });

  // Invalidate reset token
  await prisma.apiKey.delete({ where: { key: token } });

  const user = await prisma.user.findUnique({ where: { id: apiKey.userId } });
  if (user) {
    await logAuthAttempt(user.email, true, 'Password reset successful');
  }

  return { success: true, message: 'Password reset successful' };
};

/**
 * Change password (for authenticated users)
 */
export const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
) => {
  // Get user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const passwordValid = await comparePassword(oldPassword, user.passwordHash);
  if (!passwordValid) {
    await logAuthAttempt(user.email, false, 'Old password incorrect');
    throw new Error('Old password is incorrect');
  }

  // Validate new password strength
  const validation = validatePasswordStrength(newPassword);
  if (!validation.valid) {
    throw new Error(`Password is weak: ${validation.errors.join(', ')}`);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: hashedPassword,
      passwordChangedAt: new Date(),
    },
  });

  await logAuthAttempt(user.email, true, 'Password changed');

  return { success: true, message: 'Password changed successfully' };
};

/**
 * Helper: Get failed login attempts
 */
const getFailedLoginAttempts = async (email: string): Promise<number> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return 0;

  // Count failed attempts in last 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const failedAttempts = await prisma.auditLog.count({
    where: {
      email,
      action: 'FAILED_LOGIN',
      createdAt: { gte: oneHourAgo },
    },
  });

  return failedAttempts;
};

/**
 * Helper: Record failed login attempt
 */
const recordFailedLoginAttempt = async (email: string) => {
  await prisma.auditLog.create({
    data: {
      action: 'FAILED_LOGIN',
      email,
      severity: 'WARNING',
      oldValues: { attempt: 'login_failed' },
    },
  });
};

/**
 * Helper: Clear failed login attempts
 */
const clearFailedLoginAttempts = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    // Could store reset timestamp in a separate table if needed
  }
};

/**
 * Helper: Log authentication attempt
 */
const logAuthAttempt = async (
  email: string,
  success: boolean,
  message: string
) => {
  await prisma.auditLog.create({
    data: {
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      email,
      severity: success ? 'INFO' : 'WARNING',
      oldValues: { message },
    },
  });
};
