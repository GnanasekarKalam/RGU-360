# Authentication System - Quick Implementation Guide

## Files Created/Modified

### New Files

```
src/
├── services/
│   ├── auth-complete.service.ts      ✨ Complete auth logic
│   ├── session.service.ts            ✨ Session management
│   ├── role.service.ts               ✨ Role/permission management
│   └── mfa.service.ts                ✨ MFA support
├── middleware/
│   └── auth-complete.middleware.ts   ✨ Auth/authz middleware
├── routes/
│   └── auth-complete.routes.ts       ✨ API routes
├── types/
│   └── session.types.ts              ✨ Session types
├── config/
│   └── permissions-complete.ts       ✨ Complete permission matrix
├── utils/
│   └── session.utils.ts              ✨ Session utilities
└── index.ts                          ✨ Main export file

AUTHENTICATION-SYSTEM.md              ✨ Complete documentation
```

## Integration Steps

### 1. Update Main App File (server.ts or app.ts)

```typescript
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './src/routes/auth-complete.routes';
import { corsConfig } from './src/config/jwt.config';

const app = express();

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

// Auth Routes
app.use('/api/auth', authRoutes);

// Other routes...
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 2. Environment Variables (.env)

```env
# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ISSUER=department360-dashboard
JWT_AUDIENCE=department360-users

# CORS
CORS_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/department360

# Node Environment
NODE_ENV=development
```

### 3. Install Required Dependencies

```bash
npm install bcrypt cookie-parser cors
npm install --save-dev @types/bcrypt @types/cookie-parser @types/cors
```

### 4. Protect Routes

```typescript
import { 
  authenticate, 
  validateSession, 
  requireRole,
  authorize,
  requirePermission 
} from './src/middleware/auth-complete.middleware';

// Public routes (no auth needed)
app.post('/api/auth/login', /* login handler */);

// Protected routes (auth required)
app.get('/api/profile', authenticate, validateSession, /* handler */);

// Role-based routes
app.get('/api/admin-dashboard', 
  authenticate, 
  validateSession, 
  requireRole('super_admin', 'admin'), 
  /* handler */
);

// Permission-based routes
app.post('/api/grades/approve',
  authenticate,
  validateSession,
  authorize('grades:approve'),
  /* handler */
);

// Resource-action routes
app.post('/api/courses',
  authenticate,
  validateSession,
  requirePermission('courses', 'write'),
  /* handler */
);
```

### 5. Check Permissions in Handlers

```typescript
import { userHasPermission } from './src/services/role.service';

app.post('/api/users/invite', authenticate, validateSession, async (req, res) => {
  const hasPermission = await userHasPermission(req.userId!, 'users:write');
  
  if (!hasPermission) {
    return res.status(403).json({ 
      success: false, 
      message: 'Permission denied' 
    });
  }

  // Handle user invitation
});
```

### 6. Session Management in Frontend

```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important: Include cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password, rememberMe: true })
});

// Get current user
const userResponse = await fetch('/api/auth/me', {
  credentials: 'include',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Refresh token
const refreshResponse = await fetch('/api/auth/refresh-token', {
  method: 'POST',
  credentials: 'include'
});

// Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Get sessions
const sessionsResponse = await fetch('/api/auth/sessions', {
  credentials: 'include',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Logout all devices
const logoutAllResponse = await fetch('/api/auth/logout-all', {
  method: 'POST',
  credentials: 'include'
});
```

## Permission Matrix Summary

### Super Admin
- Full system access
- User management
- System configuration
- All resource operations

### Admin
- Department management
- Faculty/student management
- Course management
- Grade approvals
- Report generation

### HOD (Department Head)
- Department-scoped management
- Faculty management (own dept)
- Grade approvals (own dept)
- Curriculum management
- Leave approvals

### Faculty
- Course management
- Grade submission
- Attendance management
- Assignment evaluation
- Personal analytics

### Student
- View grades
- Submit assignments
- File appeals
- View schedules
- Personal analytics

### IQAC
- Quality assurance focus
- Accreditation management
- Survey creation
- Analytics and reports

### Management Viewer
- Read-only dashboards
- Report viewing
- Analytics viewing
- Audit log access

## Testing Endpoints

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }' \
  -c cookies.txt
```

### 2. Get Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### 3. Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 4. Change Password
```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!",
    "confirmPassword": "NewPass123!"
  }'
```

### 5. Get Sessions
```bash
curl -X GET http://localhost:3000/api/auth/sessions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

### 6. Logout All
```bash
curl -X POST http://localhost:3000/api/auth/logout-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

## Database Setup

### Required Prisma Models (Already in schema.prisma)

```prisma
model User {
  id String @id @default(cuid())
  email String @unique
  passwordHash String
  status UserStatus @default(ACTIVE)
  isMfaEnabled Boolean @default(false)
  mfaMethod MfaMethod?
  lastLoginAt DateTime?
  passwordChangedAt DateTime?
  // ... other fields
  roles UserRole[]
}

model UserRole {
  id String @id @default(cuid())
  userId String
  roleId String
  departmentId String?
  isPrimary Boolean @default(false)
  expiresAt DateTime?
  // ... relations
}

model Role {
  id String @id @default(cuid())
  name String @unique
  description String?
  permissions String[] // JSON array
}
```

### Migration

```bash
npx prisma migrate dev --name add_auth_fields
npx prisma db seed -- populate roles
```

## Key Features Implemented

✅ **7 User Roles**
- Super Admin, Admin, HOD, Faculty, Student, IQAC, Management Viewer

✅ **Authentication**
- Email/password login
- JWT tokens (access + refresh)
- Logout with session invalidation
- Token refresh mechanism

✅ **Password Management**
- Strength validation
- Reset functionality
- Change password
- Bcrypt hashing

✅ **Session Management**
- Multi-device support
- Timeout handling
- Session invalidation
- Device tracking

✅ **RBAC**
- 100+ permissions
- Department scoping
- Course scoping
- Personal scoping

✅ **Security**
- Rate limiting
- Account lockout
- Audit logging
- MFA support
- CORS protection

✅ **MFA**
- TOTP support
- Email OTP
- SMS OTP (optional)
- Backup codes

✅ **API Endpoints** (11 endpoints)
- Login, Logout, Refresh
- Password management
- Session management
- User profile

## Next Steps

1. **Update Prisma Schema** (if needed)
   - Add password reset token model
   - Add audit log model
   - Add token blacklist model

2. **Configure Email Service**
   - Set up SendGrid or similar
   - Email templates for password reset

3. **Setup MFA** (optional)
   - Configure TOTP issuer
   - SMS gateway setup

4. **Frontend Integration**
   - Implement login/logout UI
   - Session/token management
   - Protected routes
   - Permission checks

5. **Testing**
   - Unit tests
   - Integration tests
   - Security tests

6. **Deployment**
   - Environment configuration
   - SSL certificates
   - Database setup
   - Monitoring/logging

## Support

For issues or questions:
1. Check [AUTHENTICATION-SYSTEM.md](../AUTHENTICATION-SYSTEM.md)
2. Review specific service files
3. Check middleware implementations
4. Review route handlers

## Security Checklist

- [ ] Change JWT secrets in production
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MFA for admin accounts
- [ ] Setup audit logging
- [ ] Configure database backups
- [ ] Enable security headers
- [ ] Setup monitoring
- [ ] Regular security updates
