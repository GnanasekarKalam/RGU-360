// src/types/auth.types.ts
// Authentication types and interfaces

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  HOD = 'hod', // Head of Department
  FACULTY = 'faculty',
  STUDENT = 'student',
  IQAC = 'iqac', // Internal Quality Assurance Cell
  MANAGEMENT_VIEWER = 'management_viewer',
}

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  department?: string;
  iat: number;
  exp: number;
}

export interface AuthRequest {
  userId: string;
  role: UserRole;
  permissions: string[];
  department?: string;
  timestamp: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetToken {
  userId: string;
  token: string;
  expiresAt: Date;
  used: boolean;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  sessionToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    department?: string;
  };
}

export interface PermissionMatrix {
  [K in UserRole]?: string[];
}

export type ResourceAction = 'read' | 'write' | 'delete' | 'approve' | 'manage';

export interface Permission {
  resource: string;
  action: ResourceAction;
  roles: UserRole[];
}
