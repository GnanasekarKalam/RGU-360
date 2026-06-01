// src/routes/auth.routes.ts
// Authentication routes/controllers

import { Router, Request, Response } from 'express';
import {
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  validatePasswordStrength,
  refreshAccessToken,
} from '../services/auth.service';
import {
  authenticate,
  requireRole,
  rateLimitLogin,
  validateSession,
  clearLoginAttempts,
} from '../middleware/auth.middleware';
import { UserRole, PasswordResetRequest } from '../types/auth.types';
import { sessionConfig } from '../config/jwt.config';

const router = Router();

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post('/login', rateLimitLogin, async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Attempt login
    const result = await loginUser({
      email,
      password,
      rememberMe: rememberMe || false,
    });

    // Clear failed attempts
    clearLoginAttempts(email);

    // Set secure cookies
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Login failed',
    });
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await logoutUser(userId, refreshToken);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Logout failed',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
    }

    // Update accessToken cookie
    res.cookie('accessToken', result, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      accessToken: result,
      tokenType: 'Bearer',
    });
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message || 'Token refresh failed',
    });
  }
});

/**
 * POST /auth/password-reset/request
 * Request password reset
 */
router.post('/password-reset/request', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await requestPasswordReset(email);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Password reset request failed',
    });
  }
});

/**
 * POST /auth/password-reset
 * Reset password with token
 */
router.post('/password-reset', async (req: Request, res: Response) => {
  try {
    const resetRequest: PasswordResetRequest = req.body;

    if (!resetRequest.token || !resetRequest.newPassword || !resetRequest.confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and both passwords are required',
      });
    }

    const result = await resetPassword(resetRequest);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Password reset failed',
    });
  }
});

/**
 * POST /auth/password-change
 * Change password (authenticated users only)
 */
router.post('/password-change', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId!;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Old and new passwords are required',
      });
    }

    const result = await changePassword(userId, oldPassword, newPassword);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Password change failed',
    });
  }
});

/**
 * GET /auth/validate-password
 * Validate password strength
 */
router.get('/validate-password', (req: Request, res: Response) => {
  try {
    const { password } = req.query;

    if (!password || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Password is required',
      });
    }

    const validation = validatePasswordStrength(password);

    return res.status(200).json({
      success: validation.valid,
      valid: validation.valid,
      errors: validation.errors,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Password validation failed',
    });
  }
});

/**
 * GET /auth/me
 * Get current user info
 */
router.get('/me', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.auth?.id,
        email: req.auth?.email,
        role: req.auth?.role,
        department: req.auth?.department,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get user info',
    });
  }
});

/**
 * GET /auth/permissions
 * Get current user permissions
 */
router.get('/permissions', authenticate, async (req: Request, res: Response) => {
  try {
    const { PERMISSION_MATRIX } = require('../config/permissions');
    const permissions = PERMISSION_MATRIX[req.userRole!] || [];

    return res.status(200).json({
      success: true,
      role: req.userRole,
      permissions,
      permissionCount: permissions.length,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get permissions',
    });
  }
});

/**
 * GET /auth/roles
 * Get all available roles (admin only)
 */
router.get(
  '/roles',
  authenticate,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  (req: Request, res: Response) => {
    try {
      const roles = Object.values(UserRole);

      return res.status(200).json({
        success: true,
        roles,
        count: roles.length,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get roles',
      });
    }
  }
);

/**
 * GET /auth/session-info
 * Get session information
 */
router.get('/session-info', authenticate, (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    return res.status(200).json({
      success: true,
      session: {
        userId: req.auth?.id,
        email: req.auth?.email,
        role: req.auth?.role,
        issuedAt: new Date(req.auth?.iat! * 1000),
        expiresAt: new Date(req.auth?.exp! * 1000),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to get session info',
    });
  }
});

/**
 * POST /auth/verify-token
 * Verify if token is valid
 */
router.post('/verify-token', authenticate, (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Token is valid',
    token: {
      valid: true,
      userId: req.auth?.id,
      role: req.auth?.role,
    },
  });
});

export default router;
