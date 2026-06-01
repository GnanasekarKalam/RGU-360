# Complete Authentication System Documentation

## Overview

This is a comprehensive, production-ready authentication system for the Academic Department360 Dashboard. It includes complete role-based access control (RBAC), session management, MFA support, and detailed audit logging.

## System Architecture

### Components

```
Authentication System
├── Services
│   ├── auth-complete.service.ts     (Core authentication logic)
│   ├── session.service.ts           (Session management)
│   ├── role.service.ts              (Role and permission management)
│   └── mfa.service.ts               (Multi-factor authentication)
├── Middleware
│   └── auth-complete.middleware.ts  (Authentication/authorization)
├── Routes
│   └── auth-complete.routes.ts      (API endpoints)
├── Configuration
│   ├── jwt.config.ts                (JWT and security config)
│   └── permissions-complete.ts      (Permission matrix)
├── Types
│   ├── auth.types.ts                (Authentication types)
│   └── session.types.ts             (Session types)
└── Utilities
    ├── jwt.utils.ts                 (JWT helpers)
    └── session.utils.ts             (Session helpers)
```

## User Roles (7 Roles)

### 1. **Super Admin**
- **Access Level**: Full system access
- **Restrictions**: None
- **Capabilities**:
  - Manage all users and roles
  - Create/modify/delete any resource
  - System configuration
  - Audit log access
  - Backup and restore

### 2. **Admin**
- **Access Level**: Administrative across system
- **Scope**: Organization-wide
- **Capabilities**:
  - User management
  - Department management
  - Faculty and student management
  - Course and enrollment management
  - Grade approvals
  - Report generation

### 3. **Head of Department (HOD)**
- **Access Level**: Department-scoped administrative
- **Scope**: Own department only
- **Capabilities**:
  - Manage faculty in department
  - Manage students in department
  - Approve grades
  - Curriculum management
  - Department reports
  - Leave approvals

### 4. **Faculty**
- **Access Level**: Course-scoped
- **Scope**: Own courses
- **Capabilities**:
  - View enrolled students
  - Submit grades
  - Manage attendance
  - Evaluate assignments
  - View personal analytics
  - Submit leave requests

### 5. **Student**
- **Access Level**: Personal-scoped read
- **Scope**: Own data
- **Capabilities**:
  - View enrollments
  - View grades
  - File grade appeals
  - View course materials
  - Submit assignments
  - View personal analytics

### 6. **IQAC (Quality Assurance)**
- **Access Level**: Read-heavy, assessment-focused
- **Scope**: Organization-wide
- **Capabilities**:
  - View accreditation data
  - Create surveys
  - Analyze learning outcomes
  - Generate quality reports
  - Manage evidence

### 7. **Management Viewer**
- **Access Level**: Read-only dashboards
- **Scope**: Organization-wide
- **Capabilities**:
  - View dashboards
  - View reports
  - View analytics
  - Export data
  - Audit log view

## Authentication Features

### 1. Login (`POST /auth/login`)

```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "faculty",
    "department": "Computer Science"
  }
}
```

**Features**:
- Rate limiting (5 attempts per 15 minutes)
- Account lockout after 5 failed attempts (15 minute lockout)
- Audit logging
- Secure cookie storage
- Session creation

### 2. Logout (`POST /auth/logout`)

**Features**:
- Session invalidation
- Token blacklisting support
- Cookie clearing
- Audit logging

### 3. Token Refresh (`POST /auth/refresh-token`)

```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Features**:
- Generate new access token
- Maintain user session
- Automatic token rotation support

### 4. Password Management

#### Request Password Reset (`POST /auth/request-password-reset`)

```json
{
  "email": "user@example.com"
}
```

**Features**:
- 1-hour reset token expiry
- Rate limiting
- Email-based delivery
- Security (doesn't reveal if email exists)

#### Reset Password (`POST /auth/reset-password`)

```json
{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Password Requirements**:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Change Password (`POST /auth/change-password`)

```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewSecurePass123!",
  "confirmPassword": "NewSecurePass123!"
}
```

**Features**:
- Requires current password verification
- Invalidates all sessions after change
- Forces re-login

## JWT Token Structure

### Access Token (15 minutes)
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "faculty",
  "department": "Computer Science",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token (7 days / 30 days with "Remember Me")
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Role-Based Access Control (RBAC)

### Permission System

Format: `resource:action`

**Example Permissions**:
- `users:read` - View users
- `grades:approve` - Approve grades
- `courses:write` - Create/edit courses
- `departments:manage` - Manage departments

### Checking Permissions

```typescript
import { hasPermission, canAccess } from '@/config/permissions-complete';

// Method 1: Direct permission check
const hasReadUsers = hasPermission('admin', 'users:read');

// Method 2: Resource-action check
const canEditCourses = canAccess('hod', 'courses', 'write');
```

### Middleware Usage

```typescript
import { requireRole, authorize, requirePermission } from '@/middleware/auth-complete.middleware';

// Role-based access
router.get('/admin-only', requireRole('super_admin', 'admin'), handler);

// Permission-based access
router.post('/approve-grades', authorize('grades:approve'), handler);

// Resource-action access
router.put('/courses/:id', requirePermission('courses', 'write'), handler);
```

## Session Management

### Session Features

- **Creation**: On login
- **Validation**: Every request
- **Timeout**: 30 minutes of inactivity
- **Max Duration**: 24 hours
- **Remember Me**: 30 days with checkbox
- **Multi-device**: Support for multiple active sessions

### Session Endpoints

#### Get All Sessions (`GET /auth/sessions`)

```json
{
  "success": true,
  "data": {
    "totalSessions": 2,
    "sessions": [
      {
        "id": "session-id-1",
        "ipAddress": "192.168.1.100",
        "device": "Mozilla/5.0...",
        "loginTime": "2024-05-30T10:00:00Z",
        "lastActivity": "2024-05-30T10:15:00Z",
        "expiresAt": "2024-05-30T22:00:00Z"
      }
    ]
  }
}
```

#### Terminate Session (`DELETE /auth/sessions/:sessionId`)

Terminate a specific device session while keeping others active.

#### Logout All (`POST /auth/logout-all`)

Terminate all sessions across all devices.

## Multi-Factor Authentication (MFA)

### Supported Methods

1. **TOTP** (Time-based One-Time Password)
   - Google Authenticator, Authy
   - 6-digit codes, 30-second window

2. **Email OTP**
   - Codes sent to registered email
   - 5-minute validity

3. **SMS OTP** (Optional)
   - Codes sent to phone number
   - Requires SMS service configuration

### MFA Endpoints

```typescript
// Enable MFA
POST /auth/mfa/enable
{ "method": "TOTP" }

// Disable MFA
POST /auth/mfa/disable

// Get MFA Status
GET /auth/mfa/status

// Generate backup codes
POST /auth/mfa/backup-codes
```

## Audit Logging

### Logged Events

- **Authentication**:
  - `LOGIN_SUCCESS` - Successful login
  - `LOGIN_FAILED` - Failed login attempt
  - `LOGIN_BLOCKED` - Account locked
  - `LOGOUT_SUCCESS` - Logout

- **Passwords**:
  - `PASSWORD_RESET_REQUESTED` - Password reset request
  - `PASSWORD_RESET_SUCCESSFUL` - Successful reset
  - `PASSWORD_CHANGED` - Password changed
  - `PASSWORD_CHANGE_FAILED` - Failed password change

- **Sessions**:
  - `SESSION_CREATED` - Session started
  - `SESSION_TERMINATED` - Session ended

- **Permissions**:
  - `PERMISSION_DENIED` - Access denied

### Audit Log Structure

```json
{
  "id": "log-id",
  "userId": "user-id",
  "email": "user@example.com",
  "action": "LOGIN_SUCCESS",
  "resource": "AUTH",
  "status": "SUCCESS",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "details": {
    "sessionId": "session-id",
    "role": "faculty"
  },
  "createdAt": "2024-05-30T10:00:00Z"
}
```

## Security Features

### 1. Rate Limiting

```typescript
const rateLimitConfig = {
  login: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,                      // 5 attempts
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000,   // 1 hour
    max: 3,                      // 3 attempts
  },
};
```

### 2. Account Lockout

- **Trigger**: 5 failed login attempts
- **Duration**: 15 minutes
- **Reset**: Automatic after duration or on successful login

### 3. Token Security

- **HTTP-Only Cookies**: Prevents XSS attacks
- **Secure Flag**: Only HTTPS in production
- **SameSite**: Strict CSRF protection
- **Signing**: JWT with HS256/RS256

### 4. Password Security

```typescript
const passwordConfig = {
  saltRounds: 10,                    // Bcrypt rounds
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  resetTokenExpiry: 3600000,        // 1 hour
};
```

### 5. CORS Configuration

```typescript
const corsConfig = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

## Implementation Guide

### 1. Setup Authentication Routes

```typescript
import authRoutes from '@/routes/auth-complete.routes';

app.use('/auth', authRoutes);
```

### 2. Apply Middleware

```typescript
import { authenticate, validateSession, requireRole } from '@/middleware/auth-complete.middleware';

// Protected route
app.get('/api/profile', authenticate, validateSession, (req, res) => {
  res.json({ user: req.auth });
});

// Role-based route
app.get('/api/admin', authenticate, validateSession, requireRole('super_admin', 'admin'), (req, res) => {
  res.json({ message: 'Admin only' });
});
```

### 3. Check Permissions

```typescript
import { userHasPermission } from '@/services/role.service';

const canApproveGrades = await userHasPermission(userId, 'grades:approve');
if (!canApproveGrades) {
  throw new Error('Permission denied');
}
```

### 4. Manage Sessions

```typescript
import { getUserSessions, invalidateSession } from '@/services/session.service';

const sessions = await getUserSessions(userId);
await invalidateSession(sessionId);
```

## Environment Variables

```env
# JWT Configuration
JWT_ACCESS_SECRET=your-access-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ISSUER=department360-dashboard
JWT_AUDIENCE=department360-users

# CORS
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/department360

# Email (for password reset)
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-api-key

# SMS (optional MFA)
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
```

## API Reference

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | ❌ | Login user |
| POST | `/auth/logout` | ✅ | Logout user |
| POST | `/auth/logout-all` | ✅ | Logout all devices |
| POST | `/auth/refresh-token` | ❌ | Refresh access token |
| POST | `/auth/request-password-reset` | ❌ | Request password reset |
| POST | `/auth/reset-password` | ❌ | Reset password with token |
| POST | `/auth/change-password` | ✅ | Change password |
| POST | `/auth/validate-password` | ❌ | Validate password strength |
| GET | `/auth/me` | ✅ | Get current user |
| GET | `/auth/sessions` | ✅ | Get all sessions |
| DELETE | `/auth/sessions/:sessionId` | ✅ | Terminate session |

## Testing

### Example Login Request

```bash
curl -X POST http://localhost:3000/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "faculty@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }'
```

### Example Protected Request

```bash
curl -X GET http://localhost:3000/auth/me \\
  -H "Authorization: Bearer ACCESS_TOKEN" \\
  -H "Cookie: sessionId=SESSION_ID"
```

## Database Models Required

The system expects the following Prisma models:

- `User` - User accounts
- `UserRole` - User-role assignments
- `Role` - Role definitions
- `Department` - Department information
- `Faculty` - Faculty details
- `Student` - Student details

See `PRISMA-SCHEMA-COMPLETE.md` for complete schema.

## Performance Considerations

1. **Session Storage**: Use Redis for production (currently in-memory)
2. **Token Blacklist**: Use database or Redis
3. **Audit Logs**: Consider separate database or log aggregation service
4. **Rate Limiting**: Use Redis for distributed rate limiting
5. **Database Queries**: Add indexes on frequently queried fields

## Troubleshooting

### Issue: Tokens not persisting

**Solution**: Ensure cookies are set with correct flags:
```typescript
secure: process.env.NODE_ENV === 'production',
httpOnly: true,
sameSite: 'strict',
```

### Issue: CORS errors

**Solution**: Configure CORS properly in middleware:
```typescript
const corsConfig = {
  origin: process.env.CORS_ORIGIN,
  credentials: true,
};
```

### Issue: Session expiring too quickly

**Solution**: Adjust session timeout:
```typescript
export const sessionConfig = {
  inactivityTimeout: 30 * 60 * 1000,  // Increase this
  maxDuration: 24 * 60 * 60 * 1000,
};
```

## Security Best Practices

1. ✅ Always use HTTPS in production
2. ✅ Keep secrets in environment variables
3. ✅ Rotate JWT secrets periodically
4. ✅ Use strong password requirements
5. ✅ Implement rate limiting
6. ✅ Log all authentication events
7. ✅ Use MFA for admin accounts
8. ✅ Regular security audits
9. ✅ Keep dependencies updated
10. ✅ Use prepared statements for SQL queries

## Future Enhancements

- [ ] OAuth2/OpenID Connect integration
- [ ] SAML support
- [ ] Social login (Google, GitHub)
- [ ] Biometric authentication
- [ ] Hardware security keys
- [ ] Risk-based authentication
- [ ] Advanced fraud detection
- [ ] Real-time threat monitoring
- [ ] Passwordless authentication
- [ ] WebAuthn/FIDO2 support

## Support & Documentation

For more information, see:
- [Authentication Architecture](../docs/architecture/04-SECURITY-ARCHITECTURE.md)
- [Approval Workflows](../docs/architecture/03-APPROVAL-WORKFLOWS.md)
- [User Roles Hierarchy](../docs/architecture/02-USER-ROLES-HIERARCHY.md)
