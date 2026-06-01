// src/middleware/auth-complete.middleware.ts
// Enhanced authentication and authorization middleware

import { Request, Response, NextFunction } from 'express';
import { JwtPayload, UserRole } from '../types/auth.types';
import {
  verifyAccessToken,
  extractTokenFromHeader,
  shouldRefreshToken,
} from '../utils/jwt.utils';
import { PERMISSION_MATRIX } from '../config/permissions';
import { PrismaClient } from '@prisma/client';
import { sessionConfig, loginConfig, rateLimitConfig } from '../config/jwt.config';
import { getSession, refreshSession } from '../services/session.service';

const prisma = new PrismaClient();

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

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
      sessionId?: string;
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
 * Session validation middleware
 * Validates that user's session is still active and valid
 */
export const validateSession = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found in request',
      });
    }

    // Get session ID from cookies or headers
    const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];

    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Session not found',
      });
    }

    // Validate session
    const session = await getSession(sessionId as string);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Session has expired or is invalid',
      });
    }

    // Verify session belongs to current user
    if (session.userId !== req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Session does not belong to current user',
      });
    }

    // Refresh session activity
    await refreshSession(sessionId as string);

    // Attach session to request
    req.sessionId = sessionId as string;

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

      // Get role permissions
      const rolePermissions = PERMISSION_MATRIX[req.userRole] || [];

      // Check permissions
      const hasAllPermissions = requiredPermissions.every((permission) =>
        rolePermissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: requiredPermissions,
          current: rolePermissions,
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
 */
export const requirePermission = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth || !req.userRole) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const permission = `${resource}:${action}`;
      const rolePermissions = PERMISSION_MATRIX[req.userRole] || [];

      if (!rolePermissions.includes(permission)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission,
        });
      }

      return next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Permission check error',
      });
    }
  };
};

/**
 * Rate limiting middleware for login endpoint
 */
export const rateLimitLogin = (req: Request, res: Response, next: NextFunction) => {
  const key = `login:${req.ip}`;
  const now = Date.now();
  const limit = rateLimitConfig.login;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return next();
  }

  record.count++;

  if (record.count > limit.max) {
    return res.status(429).json({
      success: false,
      message: 'Too many login attempts. Please try again later.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  return next();
};

/**
 * Rate limiting middleware for password reset
 */
export const rateLimitPasswordReset = (req: Request, res: Response, next: NextFunction) => {
  const key = `reset:${req.body.email || req.ip}`;
  const now = Date.now();
  const limit = rateLimitConfig.passwordReset;

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + limit.windowMs,
    });
    return next();
  }

  record.count++;

  if (record.count > limit.max) {
    return res.status(429).json({
      success: false,
      message: 'Too many password reset attempts. Please try again later.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  return next();
};

/**
 * Clear login attempts on successful login
 */
export const clearLoginAttempts = (email: string): void => {
  const key = `login:${email}`;
  rateLimitStore.delete(key);
};

/**
 * Department scope middleware
 * Ensures user can only access resources in their department
 */
export const departmentScope = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.auth) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Get department from request params
    const departmentId = req.params.departmentId || req.body.departmentId;

    if (!departmentId) {
      return next(); // No department scope required
    }

    // For HOD, check if they manage this department
    if (req.userRole === UserRole.HOD) {
      const isHodOfDept = await prisma.userRole.findFirst({
        where: {
          userId: req.userId,
          roleId: { in: await prisma.role.findMany({ where: { name: 'HOD' }, select: { id: true } }).then(roles => roles.map(r => r.id)) },
          departmentId: departmentId as string,
        },
      });

      if (!isHodOfDept) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this department',
        });
      }
    }

    return next();
  } catch (error) {
    console.error('Department scope error:', error);
    return res.status(500).json({
      success: false,
      message: 'Department scope check error',
    });
  }
};

/**
 * Owner or admin check middleware
 * Allows users to access only their own resources or if they're admin
 */
export const ownerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const resourceOwnerId = req.params.userId || req.body.userId;

    if (!resourceOwnerId) {
      return next(); // No owner check required
    }

    // Allow super admin and admin
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(req.userRole!)) {
      return next();
    }

    // Allow if user is accessing their own resource
    if (req.userId === resourceOwnerId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have access to this resource',
    });
  } catch (error) {
    console.error('Owner/Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Access check error',
    });
  }
};
