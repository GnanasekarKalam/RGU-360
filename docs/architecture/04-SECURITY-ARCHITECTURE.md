# Security Architecture - Academic Department360 Dashboard

## 1. Security Framework Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 1. Network Security                                │    │
│  │    - HTTPS/TLS 1.3                                 │    │
│  │    - DDoS Protection                               │    │
│  │    - Web Application Firewall (WAF)                │    │
│  │    - API Rate Limiting                             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 2. Authentication & Authorization                 │    │
│  │    - Multi-Factor Authentication (MFA)             │    │
│  │    - JWT Token Management                          │    │
│  │    - OAuth 2.0 / OIDC Integration                  │    │
│  │    - Session Management                            │    │
│  │    - Role-Based Access Control (RBAC)              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 3. Data Security                                   │    │
│  │    - Encryption at Rest (AES-256)                  │    │
│  │    - Encryption in Transit (TLS 1.3)               │    │
│  │    - Field-Level Encryption (PII)                  │    │
│  │    - Key Management Service (KMS)                  │    │
│  │    - Data Masking & Anonymization                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 4. Application Security                            │    │
│  │    - Input Validation & Sanitization               │    │
│  │    - SQL Injection Prevention                       │    │
│  │    - XSS Protection                                │    │
│  │    - CSRF Token Validation                         │    │
│  │    - API Security (CORS, CSP)                      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 5. Infrastructure Security                         │    │
│  │    - VPC Isolation                                 │    │
│  │    - Security Groups & Firewalls                   │    │
│  │    - Database Access Control                       │    │
│  │    - Secrets Management (HashiCorp Vault)          │    │
│  │    - Server Hardening                              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 6. Audit & Monitoring                              │    │
│  │    - Comprehensive Logging                         │    │
│  │    - Security Event Monitoring                      │    │
│  │    - Intrusion Detection                           │    │
│  │    - Vulnerability Scanning                         │    │
│  │    - Penetration Testing (Quarterly)                │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │ 7. Compliance & Policy                             │    │
│  │    - FERPA Compliance                               │    │
│  │    - Data Protection Regulations                    │    │
│  │    - Security Policy Enforcement                    │    │
│  │    - Incident Response Plan                         │    │
│  │    - Business Continuity & DR                       │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Architecture

### 2.1 Multi-Factor Authentication (MFA)

```
User Credentials
       ↓
┌──────────────────┐
│ Primary Factor   │
│ (Username/Email) │
└────────┬─────────┘
         ↓
┌──────────────────────────────┐
│ Verify via Supabase Auth     │
│ - Hash comparison            │
│ - Account status check       │
└────────┬─────────────────────┘
         │ [Success]
         ↓
┌──────────────────────────────┐
│ Secondary Factor Required?   │
│ (Check user MFA setting)     │
└────────┬─────────────────────┘
         │
         ├─ [MFA Enabled]
         │   ↓
         │   ┌─────────────────────────┐
         │   │ MFA Method Options:     │
         │   │ 1. TOTP (Google Auth)   │
         │   │ 2. SMS Code             │
         │   │ 3. Email Code           │
         │   │ 4. Biometric (Mobile)   │
         │   └──────────┬──────────────┘
         │              ↓
         │   ┌──────────────────────┐
         │   │ Send Code to User    │
         │   │ Validate Within 5min │
         │   └──────────┬───────────┘
         │              │
         │              ├─ [Valid] → JWT Generated
         │              └─ [Invalid] → Reject
         │
         └─ [MFA Disabled]
            ↓
         JWT Generated
            ↓
      ┌────────────────────────────┐
      │ JWT Token Issued           │
      │ - User ID                  │
      │ - Roles & Permissions      │
      │ - Expiry: 30 mins          │
      │ - Refresh token: 7 days    │
      └────────────────────────────┘
```

### 2.2 JWT Token Structure

```
Header
{
  "alg": "HS256",
  "typ": "JWT",
  "kid": "key-id-2026"
}

Payload
{
  "sub": "user-id-123",
  "email": "faculty@university.edu",
  "role": ["faculty"],
  "permissions": [
    "read:courses",
    "write:grades",
    "read:students"
  ],
  "department": "mathematics",
  "iat": 1719619200,
  "exp": 1719622800,
  "iss": "academic-dashboard",
  "aud": "academic-dashboard"
}

Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret_key
)
```

### 2.3 Session Management

- **Access Token Lifetime**: 30 minutes
- **Refresh Token Lifetime**: 7 days
- **Session Idle Timeout**: 30 minutes
- **Concurrent Sessions**: Max 3 per user
- **Token Rotation**: Refresh tokens rotate on use
- **Device Binding**: Optional for high-security roles

---

## 3. Authorization & Access Control

### 3.1 Role-Based Access Control (RBAC) Implementation

```
User
  ↓
┌─────────────────┐
│ Load user roles │
│ from JWT        │
└────────┬────────┘
         ↓
┌─────────────────────────┐
│ Load role permissions   │
│ from database cache     │
└────────┬────────────────┘
         ↓
┌──────────────────────────────┐
│ Check resource-level rules   │
│ - Department access          │
│ - Course ownership           │
│ - Student assignment         │
└────────┬─────────────────────┘
         ↓
┌──────────────────────┐
│ Request allowed?     │
└────────┬─────────────┘
         │
         ├─ [Yes] → Proceed
         └─ [No] → 403 Forbidden
                  Log audit event
                  Notify admin (if suspicious)
```

### 3.2 Fine-Grained Permissions

```
System Permissions (Role-based)
├── Faculty:
│   ├── read:own_courses
│   ├── read:own_students
│   ├── write:own_grades
│   ├── read:own_profile
│   └── write:own_profile
│
├── Department Head:
│   ├── read:all_courses (dept)
│   ├── read:all_students (dept)
│   ├── read:all_faculty (dept)
│   ├── write:grade_approvals
│   ├── write:course_approvals
│   └── read:department_analytics
│
└── System Admin:
    ├── read:*
    ├── write:*
    └── admin:*

Resource-Level Checks
├── Department-scoped
│   - Can faculty access course from their dept?
│
├── Ownership-based
│   - Can user access their own resources?
│
└── Hierarchical
    - Can higher role override lower role?
```

---

## 4. Data Encryption Strategy

### 4.1 Encryption at Rest

**Database Level**:
```sql
-- PII Fields Encrypted
Employees (faculty)
├── ssn → AES-256 encrypted
├── salary_info → AES-256 encrypted
├── performance_reviews → AES-256 encrypted
└── personal_contact → AES-256 encrypted

Students
├── ssn → AES-256 encrypted
├── financial_aid → AES-256 encrypted
├── medical_history → AES-256 encrypted
└── family_contact → AES-256 encrypted

Grades
├── Sensitive fields encrypted per FERPA
└── Access logged
```

**Encryption Keys**:
- Master key stored in AWS KMS or HashiCorp Vault
- Separate keys for different data classifications
- Key rotation: Annual (or on compromise)
- Backup keys stored in separate secure location

### 4.2 Encryption in Transit

```
Client ↔ API Server
├── Protocol: HTTPS (TLS 1.3 minimum)
├── Certificate: Let's Encrypt / AWS Certificate Manager
├── Certificate Pinning: Enabled for mobile
└── Cipher Suites:
    ├── TLS_AES_256_GCM_SHA384
    ├── TLS_CHACHA20_POLY1305_SHA256
    └── TLS_AES_128_GCM_SHA256

API Server ↔ Database
├── Connection: Encrypted tunnel
├── Protocol: TLS 1.2 minimum
├── Authentication: Certificate-based or IP whitelist
└── No plaintext credentials

API Server ↔ OneDrive
├── OAuth 2.0 token transmission: HTTPS only
├── File transfers: HTTPS TLS 1.2+
└── Token stored encrypted in database
```

### 4.3 Field-Level Encryption Example

```javascript
// Encrypted fields in database schema
const FacultySchema = {
  id: String,
  email: String, // Not encrypted (can be indexed)
  ssn: {
    type: String,
    encrypt: true,
    algorithm: 'AES-256',
    keyId: 'faculty-key-v1'
  },
  salary: {
    type: Number,
    encrypt: true,
    algorithm: 'AES-256'
  },
  performance_rating: {
    type: String,
    encrypt: true
  }
}

// Encryption/Decryption in application layer
class FacultyRepository {
  async create(faculty) {
    // Encrypt sensitive fields
    faculty.ssn = await encrypt(faculty.ssn, 'faculty-key-v1');
    faculty.salary = await encrypt(faculty.salary, 'faculty-key-v1');
    
    // Store in database
    return db.faculty.create(faculty);
  }
  
  async getById(id) {
    const faculty = await db.faculty.findById(id);
    
    // Decrypt sensitive fields
    faculty.ssn = await decrypt(faculty.ssn, 'faculty-key-v1');
    faculty.salary = await decrypt(faculty.salary, 'faculty-key-v1');
    
    return faculty;
  }
}
```

---

## 5. FERPA Compliance

### 5.1 FERPA Requirements

**What is FERPA Protected**:
- Student educational records
- Grades and transcripts
- Disciplinary records
- Attendance records
- Course enrollment
- Test scores

**FERPA Rules**:
1. Students have right to privacy of their records
2. Students can request access to their own records
3. Students can request amendments
4. Schools must provide notice of FERPA rights
5. Schools must protect from unauthorized disclosure

### 5.2 FERPA Implementation

```
┌─────────────────────────────────────────┐
│  Student Privacy Controls                │
├─────────────────────────────────────────┤
│                                         │
│ Access Authorization                   │
│ ├── Only student can view own records   │
│ ├── Faculty can view student in course  │
│ ├── Advisor can view assigned students  │
│ ├── Parent: Only with student consent   │
│ └── Third-party: Requires written auth  │
│                                         │
│ Data Masking Rules                      │
│ ├── SSN: Display only last 4 digits     │
│ ├── Phone: Masked except student's own  │
│ ├── Address: Masked except student's    │
│ └── Email: Visible to relevant staff    │
│                                         │
│ Audit Trail                             │
│ ├── Log all access to student records   │
│ ├── Timestamp and user ID tracked       │
│ ├── Purpose of access logged            │
│ └── 7-year retention minimum            │
│                                         │
│ Disclosure Control                      │
│ ├── Logging of directory info sharing   │
│ ├── Approval tracking for records       │
│ ├── Third-party access limited          │
│ └── Student can restrict disclosure     │
│                                         │
└─────────────────────────────────────────┘
```

### 5.3 FERPA Audit Log

```sql
-- Sample FERPA audit log table
FERPA_ACCESS_LOGS
├── id: UUID
├── user_id: UUID (who accessed)
├── student_id: UUID (whose record accessed)
├── resource_type: ENUM (grades, transcript, etc.)
├── action: ENUM (view, download, export)
├── timestamp: DATETIME
├── ip_address: VARCHAR
├── user_role: VARCHAR
├── access_approved: BOOLEAN
├── purpose: VARCHAR
├── retention_until: DATETIME
└── notes: TEXT

-- Query to audit access patterns
SELECT user_id, COUNT(*) as access_count
FROM FERPA_ACCESS_LOGS
WHERE timestamp > NOW() - INTERVAL 30 DAY
  AND access_approved = FALSE
GROUP BY user_id
HAVING COUNT(*) > 10;
```

---

## 6. API Security

### 6.1 API Request/Response Security

```
Client Request
├── Headers
│   ├── Authorization: Bearer <JWT_TOKEN>
│   ├── X-Request-ID: <UUID>
│   ├── X-Timestamp: <UNIX_TIMESTAMP>
│   └── X-Signature: HMAC-SHA256(request)
│
├── Body
│   └── Data encrypted if sensitive
│
└── Validation
    ├── JWT verification
    ├── Signature verification
    ├── Request size limits
    ├── Rate limiting check
    └── IP whitelist check

Server Response
├── Status code (200, 401, 403, 500)
├── Secure headers
│   ├── X-Content-Type-Options: nosniff
│   ├── X-Frame-Options: DENY
│   ├── Content-Security-Policy: (CSP rules)
│   ├── Strict-Transport-Security: max-age=31536000
│   ├── X-XSS-Protection: 1; mode=block
│   └── Referrer-Policy: strict-origin-when-cross-origin
│
├── Response body (with no sensitive data if error)
└── Audit logged
```

### 6.2 Rate Limiting

```
Rate Limiting Rules:

Authentication Endpoints
├── /api/auth/login: 5 attempts per minute per IP
├── /api/auth/register: 3 per hour per IP
└── /api/auth/password-reset: 3 per hour per email

General API Endpoints
├── Authenticated users: 100 requests per minute
├── Anonymous users: 10 requests per minute
└── Burst allowance: 20 requests per 10 seconds

Heavy Operations
├── Reports/Export: 2 per hour per user
├── Data imports: 1 per 30 minutes per user
└── Batch operations: 5 per hour per user

Penalties
├── Rate limit exceeded: 429 Too Many Requests
├── After 3 violations: Temporary IP block (15 mins)
└── After 10 violations: Manual review required
```

### 6.3 CORS Configuration

```javascript
// Allowed origins for cross-origin requests
const corsOptions = {
  origin: [
    'https://academic-dashboard.university.edu',
    'https://dashboard.university.edu',
    'https://mobile-app.university.edu'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
};

// Allowed preflight methods
const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];

// Restricted headers
const restrictedHeaders = [
  'Cookie',
  'Authorization', // Only with explicit allow
  'Content-Type' // Only specific types
];
```

---

## 7. Audit & Logging

### 7.1 Audit Log Events

```
Categories of Events:

1. Authentication Events
   ├── Login (success/failure)
   ├── Logout
   ├── MFA verification
   ├── Token generation
   ├── Token refresh
   └── Account locked (too many attempts)

2. Authorization Events
   ├── Permission check passed
   ├── Permission check failed
   ├── Role assigned/removed
   ├── Access denied
   └── Privilege escalation attempt

3. Data Access Events
   ├── Record viewed
   ├── Record modified
   ├── Record deleted
   ├── Bulk export
   ├── Report generated
   └── Sensitive field accessed

4. Administrative Events
   ├── User account created/modified
   ├── System configuration changed
   ├── Backup created/restored
   ├── Permission policy updated
   └── Integration enabled/disabled

5. Security Events
   ├── Suspicious activity detected
   ├── Threshold exceeded (rate limiting)
   ├── Encryption key rotated
   ├── Certificate updated
   ├── Vulnerability scan performed
   └── Incident response initiated
```

### 7.2 Audit Log Schema

```sql
AUDIT_LOGS (
  id UUID PRIMARY KEY,
  timestamp DATETIME NOT NULL,
  user_id UUID,
  action VARCHAR(50),
  resource_type VARCHAR(50),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent VARCHAR(500),
  status VARCHAR(20),
  error_message TEXT,
  department_id UUID,
  severity ENUM('info', 'warning', 'error', 'critical'),
  
  -- FERPA-specific
  ferpa_protected BOOLEAN,
  student_id UUID,
  
  -- Retention policy
  retention_until DATE,
  
  -- Indexing for performance
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_resource (resource_type, resource_id),
  INDEX idx_ferpa (ferpa_protected)
);
```

### 7.3 Log Retention & Compliance

- **Authentication logs**: 90 days
- **Data modification logs**: 7 years (FERPA)
- **Access logs**: 3 years
- **Error logs**: 1 year
- **Audit logs**: 7 years (compliance requirement)
- **Backup logs**: 2 years

---

## 8. Incident Response

### 8.1 Security Incident Response Plan

```
Incident Detected
    ↓
┌─────────────────────────────────┐
│ 1. DETECTION & CLASSIFICATION   │
│ • Severity level (1-4)          │
│ • Type of incident              │
│ • Initial impact assessment     │
└──────────┬──────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 2. CONTAINMENT                   │
│ • Isolation of affected systems  │
│ • Access revocation if needed    │
│ • Service continuity measures    │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 3. COMMUNICATION                 │
│ • Internal notification (CISO)   │
│ • Executive notification         │
│ • External notification (if req) │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 4. INVESTIGATION                 │
│ • Gather forensic evidence      │
│ • Root cause analysis           │
│ • Impact assessment             │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 5. REMEDIATION                   │
│ • Apply patches/fixes            │
│ • Reset credentials if breached  │
│ • System hardening               │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 6. RECOVERY                      │
│ • System restoration             │
│ • Service resumption             │
│ • Verification testing           │
└──────────┬───────────────────────┘
           ↓
┌──────────────────────────────────┐
│ 7. POST-INCIDENT REVIEW          │
│ • Root cause confirmation        │
│ • Lessons learned documentation  │
│ • Process improvements           │
│ • Training updates               │
└──────────────────────────────────┘
```

### 8.2 Incident Severity Levels

| Level | Examples | Response Time | Escalation |
|-------|----------|----------------|-----------|
| **1 - Critical** | Data breach, ransomware, service down | Immediate (< 15 min) | CEO, Legal, Law Enforcement |
| **2 - High** | Unauthorized access, privilege escalation | 1 hour | CISO, Department Head |
| **3 - Medium** | Failed login attempts (multiple), permission errors | 4 hours | Security Team |
| **4 - Low** | Suspicious activity, minor policy violation | Next business day | Documentation only |

---

## 9. Third-Party & Vendor Security

### 9.1 Third-Party Assessment

Requirements for external integrations:
- SOC 2 Type II certification
- Data processing agreement
- Incident notification SLA
- Data breach liability coverage
- Annual security audit

### 9.2 OneDrive Integration Security

```
OneDrive Access Control
├── OAuth 2.0 authentication required
├── Tokens encrypted in database
├── Scope restrictions:
│   ├── Course-specific folders only
│   ├── No admin drive access
│   └── Document-scoped permissions
│
├── Audit logging:
│   ├── Document access logged
│   ├── Download tracked
│   └── Share events logged
│
└── Data retention:
    ├── Automatic deletion after semester
    ├── Backup integration enabled
    └── Encryption verified
```

---

## 10. Security Standards & Compliance

### 10.1 Industry Standards
- **OWASP Top 10**: Addressed in architecture
- **NIST Cybersecurity Framework**: Implemented
- **ISO 27001**: Aspiration
- **FERPA**: Mandatory compliance
- **WCAG 2.1 AA**: Accessibility security

### 10.2 Regular Security Activities
- **Vulnerability Scanning**: Monthly
- **Penetration Testing**: Quarterly
- **Security Code Review**: Per release
- **Compliance Audit**: Annual
- **Incident Simulation**: Bi-annual

---

## 11. Security Roadmap

### Phase 1 (Months 1-3): Foundation
- MFA implementation
- HTTPS/TLS enforcement
- Basic RBAC implementation
- Audit logging infrastructure
- FERPA compliance basics

### Phase 2 (Months 4-6): Hardening
- Field-level encryption
- API rate limiting
- CORS configuration
- Advanced RBAC
- Penetration testing

### Phase 3 (Months 7-9): Maturity
- Key management service
- Secrets rotation
- Advanced threat detection
- Disaster recovery drills
- Compliance certification

### Phase 4 (Months 10-12): Excellence
- Zero-trust architecture
- Continuous compliance monitoring
- Advanced analytics
- Security automation
- Industry certifications

