// src/middleware/auth.middleware.ts
// Authentication and authorization middleware

import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole } from '../types/auth.types';
import {
  verifyAccessToken,
  extractTokenFromHeader,
  shouldRefreshToken,
} from '../utils/jwt.utils';
import { hasPermission, canAccess } from '../config/permissions';
import { PrismaClient } from '@prisma/client';
import { sessionConfig } from '../config/jwt.config';

const prisma = new PrismaClient();

/**
 * Extend Express Request to include auth data
 */
declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      userId?: string;
      userRole?: UserRole;
      permissions?: string[];
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user data to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided',
      });
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token',
      });
    }

    // Attach auth data to request
    req.auth = decoded;
    req.userId = decoded.id;
    req.userRole = decoded.role;

    // Log request
    await logRequest(req, 'AUTH_SUCCESS');

    // Check if token should be refreshed
    if (shouldRefreshToken(token)) {
      res.setHeader('X-Token-Refresh-Suggested', 'true');
    }

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Authorization middleware - checks if user has required permission
 */
export const authorize = (...requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      // Check permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        hasPermission(req.userRole!, permission)
      );

      if (!hasAllPermissions) {
        await logRequest(req, 'PERMISSION_DENIED', requiredPermissions);
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
        });
      }

      return next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
      });
    }
  };
};

/**
 * Role-based authorization
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient role permissions',
        allowed: allowedRoles,
        current: req.userRole,
      });
    }

    return next();
  };
};

/**
 * Resource-based authorization
 * Example: requireResourcePermission('courses', 'write')
 */
export const requireResourcePermission = (resource: string, action: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth || !req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const hasPermission = canAccess(req.userRole, resource, action);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Insufficient permissions to ${action} ${resource}`,
      });
    }

    return next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        req.auth = decoded;
        req.userId = decoded.id;
        req.userRole = decoded.role;
      }
    }

    return next();
  } catch (error) {
    // Continue without auth
    return next();
  }
};

/**
 * Super admin only
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.userRole !== UserRole.SUPER_ADMIN) {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required',
    });
  }

  return next();
};

/**
 * Admin or above
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.userRole || ![UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  return next();
};

/**
 * Department-scoped access
 */
export const requireDepartmentAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get requested department from params or query
    const requestedDepartmentId = req.params.departmentId || req.query.departmentId;

    if (!requestedDepartmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required',
      });
    }

    // Super admin and admin can access any department
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.userRole!)) {
      return next();
    }

    // HOD can only access their department
    if (req.userRole === UserRole.HOD) {
      if (req.auth.department !== requestedDepartmentId) {
        return res.status(403).json({
          success: false,
          message: 'You can only access your own department',
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Department access error:', error);
    return res.status(500).json({
      success: false,
      message: 'Department access error',
    });
  }
};

/**
 * Session validation middleware
 * Checks if session is still valid and not expired
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.auth || !req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { status: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status.toLowerCase()}`,
      });
    }

    // Check inactivity timeout
    const lastActivity = req.headers['x-last-activity'];
    if (lastActivity) {
      const lastActivityTime = new Date(lastActivity as string).getTime();
      const currentTime = Date.now();

      if (currentTime - lastActivityTime > sessionConfig.inactivityTimeout) {
        return res.status(401).json({
          success: false,
          message: 'Session expired due to inactivity',
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Session validation error',
    });
  }
};

/**
 * Rate limiting middleware (basic implementation)
 */
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  const now = Date.now();
  const attempt = loginAttempts.get(email);

  if (attempt) {
    if (now < attempt.resetTime) {
      if (attempt.count >= 5) {
        return res.status(429).json({
          success: false,
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((attempt.resetTime - now) / 1000),
        });
      }
      attempt.count++;
    } else {
      // Reset attempts
      loginAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 });
    }
  } else {
    // First attempt
    loginAttempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 });
  }

  return next();
};

/**
 * Clear login attempts after successful login
 */
export const clearLoginAttempts = (email: string) => {
  loginAttempts.delete(email);
};

/**
 * Helper function to log requests
 */
const logRequest = async (
  req: Request,
  action: string,
  data?: any
) => {
  try {
    if (req.userId) {
      await prisma.auditLog.create({
        data: {
          userId: req.userId,
          action,
          severity: action.includes('ERROR') ? 'ERROR' : 'INFO',
          newValues: {
            path: req.path,
            method: req.method,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            data,
          },
        },
      });
    }
  } catch (error) {
    console.error('Failed to log request:', error);
  }
};
