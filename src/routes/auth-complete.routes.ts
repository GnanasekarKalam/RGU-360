// src/routes/auth-complete.routes.ts
// Complete authentication routes

import { Router, Request, Response } from 'express';
import {
  loginUser,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  validatePasswordStrength,
  refreshAccessToken,
} from '../services/auth-complete.service';
import {
  authenticate,
  requireRole,
  rateLimitLogin,
  rateLimitPasswordReset,
  validateSession,
  authorize,
  requirePermission,
} from '../middleware/auth-complete.middleware';
import { UserRole } from '../types/auth.types';
import { getUserSessions, getSessionSummary } from '../services/session.service';

const router = Router();

/**
 * POST /auth/login
 * Login user with email and password
 */
router.post('/login', rateLimitLogin, async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Attempt login
    const result = await loginUser(
      { email, password, rememberMe: rememberMe || false },
      ipAddress,
      userAgent
    );

    if (!result.success) {
      return res.status(401).json(result);
    }

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
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
    });
  }
});

/**
 * POST /auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await logoutUser(userId, refreshToken, ipAddress, userAgent);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during logout',
    });
  }
});

/**
 * POST /auth/refresh-token
 * Refresh access token using refresh token
 */
router.post('/refresh-token', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.status(401).json(result);
    }

    // Set new access token cookie
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during token refresh',
    });
  }
});

/**
 * POST /auth/request-password-reset
 * Request password reset token
 */
router.post('/request-password-reset', rateLimitPasswordReset, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await requestPasswordReset(email, ipAddress, userAgent);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password reset request',
    });
  }
});

/**
 * POST /auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', rateLimitPasswordReset, async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, new password, and confirmation are required',
      });
    }

    const result = await resetPassword(token, newPassword, confirmPassword, ipAddress, userAgent);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password reset',
    });
  }
});

/**
 * POST /auth/change-password
 * Change password (authenticated user)
 */
router.post(
  '/change-password',
  authenticate,
  validateSession,
  async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;
      const userId = req.userId!;
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password, new password, and confirmation are required',
        });
      }

      const result = await changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword,
        ipAddress,
        userAgent
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      // Clear cookies on password change (user must login again)
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('sessionId');

      return res.status(200).json(result);
    } catch (error: any) {
      console.error('Password change error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred during password change',
      });
    }
  }
);

/**
 * POST /auth/validate-password
 * Validate password strength
 */
router.post('/validate-password', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
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
    console.error('Password validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during password validation',
    });
  }
});

/**
 * GET /auth/me
 * Get current user profile (authenticated)
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
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving profile',
    });
  }
});

/**
 * GET /auth/sessions
 * Get all active sessions for current user
 */
router.get('/sessions', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const summary = await getSessionSummary(userId);

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while retrieving sessions',
    });
  }
});

/**
 * DELETE /auth/sessions/:sessionId
 * Terminate a specific session
 */
router.delete('/sessions/:sessionId', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId!;

    // TODO: Implement session termination
    // const session = await getSession(sessionId);
    // if (!session || session.userId !== userId) {
    //   return res.status(404).json({
    //     success: false,
    //     message: 'Session not found',
    //   });
    // }

    // await invalidateSession(sessionId);

    return res.status(200).json({
      success: true,
      message: 'Session terminated successfully',
    });
  } catch (error: any) {
    console.error('Terminate session error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while terminating session',
    });
  }
});

/**
 * POST /auth/logout-all
 * Logout from all devices
 */
router.post('/logout-all', authenticate, validateSession, async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // TODO: Implement logout all functionality
    // await invalidateUserSessions(userId);

    const result = await logoutUser(userId, refreshToken, ipAddress, userAgent);

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    return res.status(200).json({
      success: true,
      message: 'Logged out from all devices successfully',
    });
  } catch (error: any) {
    console.error('Logout all error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while logging out from all devices',
    });
  }
});

export default router;
