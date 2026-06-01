// src/config/jwt.config.ts
// JWT configuration and secrets

export interface JwtConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
  audience: string;
}

/**
 * JWT Configuration
 * Load from environment variables in production
 */
export const jwtConfig: JwtConfig = {
  // Access token expires in 15 minutes
  accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  
  // Refresh token expires in 7 days
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  
  // Token expiry times
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  
  // JWT issuer
  issuer: process.env.JWT_ISSUER || 'department360-dashboard',
  
  // JWT audience
  audience: process.env.JWT_AUDIENCE || 'department360-users',
};

/**
 * Password configuration
 */
export const passwordConfig = {
  // Bcrypt salt rounds
  saltRounds: 10,
  
  // Minimum password length
  minLength: 8,
  
  // Password requirements
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  
  // Password reset token expiry
  resetTokenExpiry: 3600000, // 1 hour in milliseconds
};

/**
 * Session configuration
 */
export const sessionConfig = {
  // Session timeout (30 minutes of inactivity)
  inactivityTimeout: 30 * 60 * 1000,
  
  // Maximum session duration (24 hours)
  maxDuration: 24 * 60 * 60 * 1000,
  
  // Remember me duration (30 days)
  rememberMeDuration: 30 * 24 * 60 * 60 * 1000,
  
  // Session check interval
  checkInterval: 5 * 60 * 1000, // 5 minutes
};

/**
 * Login attempt configuration (prevent brute force)
 */
export const loginConfig = {
  // Maximum failed attempts
  maxAttempts: 5,
  
  // Lockout duration after max attempts (15 minutes)
  lockoutDuration: 15 * 60 * 1000,
  
  // Attempt reset after (1 hour)
  attemptResetDuration: 60 * 60 * 1000,
  
  // Enable 2FA for sensitive operations
  enable2FA: true,
};

/**
 * MFA configuration
 */
export const mfaConfig = {
  // TOTP configuration
  totp: {
    issuer: 'Department360',
    appName: 'Department360 Dashboard',
    digits: 6,
    step: 30, // Time step in seconds
  },
  
  // MFA methods
  methods: {
    TOTP: true,
    EMAIL: true,
    SMS: false, // Can be enabled if SMS service configured
  },
  
  // MFA code validity
  codeValidity: 5 * 60 * 1000, // 5 minutes
};

/**
 * Audit log configuration
 */
export const auditConfig = {
  // Log sensitive operations
  logAuthAttempts: true,
  logPermissionDenials: true,
  logDataAccess: true,
  logPasswordChanges: true,
  
  // Retention period
  retentionDays: 365,
  
  // Sensitive fields to mask
  maskFields: ['password', 'token', 'secret', 'ssn', 'salary'],
};

/**
 * CORS configuration
 */
export const corsConfig = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
  // Login endpoint
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
  },
  
  // Password reset endpoint
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 requests per window
  },
  
  // General API
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
  },
  
  // Strict for sensitive operations
  sensitive: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
  },
};

export default jwtConfig;
