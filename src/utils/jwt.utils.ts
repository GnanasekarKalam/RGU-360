// src/utils/jwt.utils.ts
// JWT token generation and verification

import jwt from 'jsonwebtoken';
import { JwtPayload, UserRole } from '../types/auth.types';
import { jwtConfig } from '../config/jwt.config';

/**
 * Generate access token
 */
export const generateAccessToken = (
  userId: string,
  email: string,
  role: UserRole,
  department?: string
): string => {
  const payload = {
    id: userId,
    email,
    role,
    department,
  };

  return jwt.sign(payload, jwtConfig.accessTokenSecret, {
    expiresIn: jwtConfig.accessTokenExpiry,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: 'HS256',
  });
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId, type: 'refresh' }, jwtConfig.refreshTokenSecret, {
    expiresIn: jwtConfig.refreshTokenExpiry,
    issuer: jwtConfig.issuer,
    algorithm: 'HS256',
  });
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret, {
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
      algorithms: ['HS256'],
    }) as JwtPayload;

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): { id: string } | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.refreshTokenSecret, {
      issuer: jwtConfig.issuer,
      algorithms: ['HS256'],
    }) as { id: string };

    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

/**
 * Decode token without verification (unsafe - use only for debugging)
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

/**
 * Get token expiry time
 */
export const getTokenExpiryTime = (token: string): number | null => {
  try {
    const decoded = jwt.decode(token) as any;
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiry = (token: string): number | null => {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return null;

  const timeRemaining = expiryTime - Date.now();
  return timeRemaining > 0 ? timeRemaining : null;
};

/**
 * Parse bearer token from header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export const shouldRefreshToken = (token: string): boolean => {
  const timeUntilExpiry = getTimeUntilExpiry(token);
  if (!timeUntilExpiry) return false;

  // Refresh if less than 5 minutes remaining
  return timeUntilExpiry < 5 * 60 * 1000;
};

/**
 * Generate token pair (access + refresh)
 */
export const generateTokenPair = (
  userId: string,
  email: string,
  role: UserRole,
  department?: string
) => {
  const accessToken = generateAccessToken(userId, email, role, department);
  const refreshToken = generateRefreshToken(userId);

  return {
    accessToken,
    refreshToken,
    expiresIn: jwtConfig.accessTokenExpiry,
    tokenType: 'Bearer',
  };
};

/**
 * Validate token structure
 */
export const validateTokenStructure = (token: string): boolean => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3; // JWT has 3 parts separated by dots
};

/**
 * Compare tokens (check if same)
 */
export const compareTokens = (token1: string, token2: string): boolean => {
  return token1 === token2;
};

/**
 * Create password reset token (different from JWT, simpler)
 */
export const generatePasswordResetToken = (): string => {
  return jwt.sign(
    { 
      type: 'password_reset',
      timestamp: Date.now() 
    },
    jwtConfig.accessTokenSecret,
    {
      expiresIn: '1h', // 1 hour validity
      algorithm: 'HS256',
    }
  );
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string): boolean => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret, {
      algorithms: ['HS256'],
    }) as any;

    return decoded.type === 'password_reset';
  } catch {
    return false;
  }
};

/**
 * Create email verification token
 */
export const generateEmailVerificationToken = (email: string): string => {
  return jwt.sign(
    {
      type: 'email_verification',
      email,
      timestamp: Date.now(),
    },
    jwtConfig.accessTokenSecret,
    {
      expiresIn: '24h', // 24 hours validity
      algorithm: 'HS256',
    }
  );
};

/**
 * Verify email verification token
 */
export const verifyEmailVerificationToken = (token: string): { email: string } | null => {
  try {
    const decoded = jwt.verify(token, jwtConfig.accessTokenSecret, {
      algorithms: ['HS256'],
    }) as any;

    if (decoded.type === 'email_verification') {
      return { email: decoded.email };
    }

    return null;
  } catch {
    return null;
  }
};
