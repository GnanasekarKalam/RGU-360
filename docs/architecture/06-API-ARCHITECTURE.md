# API Architecture - Academic Department360 Dashboard

## 1. RESTful API Design

### 1.1 API Principles
- **Resource-Oriented**: All endpoints represent resources
- **HTTP Methods**: GET, POST, PUT, DELETE, PATCH
- **JSON Format**: Request and response bodies
- **Versioning**: `/api/v1/` prefix
- **Status Codes**: Proper HTTP status codes
- **Pagination**: For large datasets
- **Rate Limiting**: Per user/IP
- **Authentication**: JWT bearer tokens

### 1.2 Base URL & Versioning

```
Production: https://api.academic-dashboard.university.edu/api/v1
Staging:    https://staging-api.academic-dashboard.university.edu/api/v1
Development: http://localhost:3000/api/v1

Version Format: /api/v{major}.{minor}/
Current: v1.0
Next: v2.0 (backwards compatible during transition)
```

---

## 2. API Endpoints by Domain

### 2.1 Authentication Endpoints

```
POST   /auth/register               Register new user
POST   /auth/login                  User login
POST   /auth/logout                 User logout
POST   /auth/refresh-token          Refresh JWT token
POST   /auth/mfa/setup              Enable MFA
POST   /auth/mfa/verify             Verify MFA code
POST   /auth/password-reset         Request password reset
PUT    /auth/password               Update password
POST   /auth/validate-token         Validate token
```

### 2.2 Faculty Endpoints

```
GET    /faculty                     List all faculty (admin only)
GET    /faculty/:id                 Get faculty details
POST   /faculty                     Create new faculty (admin)
PUT    /faculty/:id                 Update faculty
DELETE /faculty/:id                 Deactivate faculty (soft delete)
GET    /faculty/:id/courses         Get faculty's courses
GET    /faculty/:id/performance     Get faculty performance metrics
PUT    /faculty/:id/profile         Update own profile
GET    /faculty/:id/leave-balance   Get leave balance
POST   /faculty/:id/leave-request   Submit leave request
GET    /faculty/:id/schedule        Get faculty schedule
```

### 2.3 Student Endpoints

```
GET    /students                    List students (staff only)
GET    /students/:id                Get student details
POST   /students                    Create new student (admin)
PUT    /students/:id                Update student
GET    /students/:id/courses        Get enrolled courses
GET    /students/:id/grades         Get grades
GET    /students/:id/transcript     Get transcript
GET    /students/:id/degree-audit   Get degree progress
GET    /students/:id/academic-standing  Get academic standing
PUT    /students/:id/profile        Update own profile
POST   /students/:id/grade-appeal   Submit grade appeal
GET    /students/:id/schedule       Get class schedule
```

### 2.4 Course Endpoints

```
GET    /courses                     List courses (with filters)
GET    /courses/:id                 Get course details
POST   /courses                     Create new course (faculty)
PUT    /courses/:id                 Update course
DELETE /courses/:id                 Archive course
GET    /courses/:id/classes         Get class instances
GET    /courses/:id/enrollments     Get enrollments
GET    /courses/:id/prerequisites   Get prerequisite info
POST   /courses/:id/propose-change  Propose course modification
GET    /courses/search              Search courses
GET    /courses/:id/materials       Get course materials (OneDrive)
```

### 2.5 Enrollment Endpoints

```
GET    /enrollments                 List enrollments
GET    /enrollments/:id             Get enrollment details
POST   /classes/:classId/enroll     Enroll in class
DELETE /enrollments/:id             Drop course
PUT    /enrollments/:id/status      Change enrollment status
GET    /enrollments/:id/grades      Get grades for enrollment
POST   /enrollments/:id/drop        Drop course with reason
GET    /enrollments/search          Search enrollments
```

### 2.6 Grade Endpoints

```
GET    /grades                      List grades
GET    /grades/:id                  Get grade details
POST   /grades                      Create/submit grades
PUT    /grades/:id                  Update grade (draft)
POST   /grades/:id/submit           Submit grades for approval
POST   /grades/:id/approve          Approve grades (dept head)
POST   /grades/:id/reject           Reject grades
GET    /grades/pending-approval     Get pending grade submissions
POST   /grades/:id/appeal           Create grade appeal
GET    /grade-appeals               List grade appeals
PUT    /grade-appeals/:id           Respond to appeal
```

### 2.7 Academic Planning Endpoints

```
GET    /degree-programs             List degree programs
GET    /degree-programs/:id         Get program details
GET    /programs/:id/requirements   Get requirements
GET    /programs/:id/courses        Get required courses
GET    /students/:id/degree-audit   Get degree progress
GET    /students/:id/planned-courses  Get planned courses
POST   /academic-planning/:id/plan  Create academic plan
GET    /prerequisites/:courseId     Get prerequisite chain
```

### 2.8 Analytics Endpoints

```
GET    /analytics/dashboard         Get dashboard metrics
GET    /analytics/performance       Get performance analytics
GET    /analytics/enrollment        Get enrollment trends
GET    /analytics/retention         Get retention analytics
GET    /analytics/gpa-distribution  Get GPA distribution
GET    /analytics/course-success    Get course success rates
GET    /analytics/faculty-effectiveness  Get faculty ratings
GET    /analytics/custom-report     Generate custom report
POST   /analytics/export            Export analytics data
```

### 2.9 Workflow & Approval Endpoints

```
GET    /workflows                   List workflows
GET    /workflows/:id               Get workflow details
POST   /workflows                   Create workflow
PUT    /workflows/:id               Update workflow
GET    /approvals/pending           Get pending approvals
POST   /approvals/:id/approve       Approve workflow
POST   /approvals/:id/reject        Reject workflow
GET    /approvals/history           Get approval history
POST   /workflows/:id/escalate      Escalate workflow
```

### 2.10 Document/OneDrive Endpoints

```
GET    /documents                   List documents
GET    /documents/:path             List files in folder
POST   /documents/upload            Upload file
GET    /documents/:fileId/download  Download file
DELETE /documents/:fileId           Delete file
POST   /documents/:fileId/share     Share file
GET    /documents/search            Search documents
POST   /documents/:fileId/permissions  Manage permissions
```

### 2.11 Administration Endpoints

```
GET    /admin/users                 List users
POST   /admin/users                 Create user
PUT    /admin/users/:id             Update user
DELETE /admin/users/:id             Delete user
POST   /admin/users/:id/roles       Assign roles
DELETE /admin/users/:id/roles/:roleId  Remove role
GET    /admin/audit-logs            Get audit logs
GET    /admin/system-status         Get system status
POST   /admin/backup                Trigger backup
GET    /admin/settings              Get system settings
PUT    /admin/settings              Update settings
```

---

## 3. Request/Response Format

### 3.1 Standard Request Structure

```
Method: POST
URL: https://api.academic-dashboard.university.edu/api/v1/grades

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
  X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
  X-Timestamp: 1719619200

Body:
{
  "enrollment_id": "123e4567-e89b-12d3-a456-426614174000",
  "grade_numeric": 87.5,
  "grade_letter": "B",
  "comments": "Good work on final project"
}
```

### 3.2 Standard Response Structure

```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "id": "grade-id-uuid",
    "enrollment_id": "enrollment-uuid",
    "grade_numeric": 87.5,
    "grade_letter": "B",
    "created_at": "2026-06-28T15:30:00Z",
    "updated_at": "2026-06-28T15:30:00Z"
  },
  "meta": {
    "timestamp": "2026-06-28T15:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "v1.0"
  }
}
```

### 3.3 Error Response Structure

```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Grade numeric must be between 0 and 100",
    "details": {
      "field": "grade_numeric",
      "value": 150,
      "constraint": "max=100"
    }
  },
  "meta": {
    "timestamp": "2026-06-28T15:30:00Z",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

---

## 4. Pagination & Filtering

### 4.1 Pagination Example

```
GET /api/v1/students?page=2&limit=20&sort=-created_at

Response:
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 1500,
    "totalPages": 75,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 4.2 Filtering Example

```
GET /api/v1/students?status=enrolled&major_id=uuid&gpa_min=3.0

Query Parameters:
  status: enrolled|suspended|graduated
  major_id: UUID
  gpa_min: 0.0-4.0
  gpa_max: 0.0-4.0
  enrollment_date_from: ISO date
  enrollment_date_to: ISO date
```

---

## 5. Status Codes & Error Handling

### 5.1 HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE with no response |
| 400 | Bad Request | Validation error, malformed request |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable | Validation errors on input |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Maintenance or external service down |

### 5.2 Error Response Codes

| Error Code | HTTP | Description |
|-----------|------|-------------|
| INVALID_INPUT | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Authentication required or failed |
| PERMISSION_DENIED | 403 | User lacks required permission |
| NOT_FOUND | 404 | Resource not found |
| RESOURCE_EXISTS | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| WORKFLOW_INVALID | 422 | Workflow state transition invalid |
| DATABASE_ERROR | 500 | Database operation failed |
| EXTERNAL_SERVICE_ERROR | 503 | OneDrive/external service unavailable |

---

## 6. Security Headers

### 6.1 Standard Security Headers

```
All responses include:

X-Content-Type-Options: nosniff
  - Prevents MIME sniffing

X-Frame-Options: DENY
  - Prevents clickjacking

Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'
  - Prevents XSS attacks

Strict-Transport-Security: max-age=31536000; includeSubDomains
  - Forces HTTPS

X-XSS-Protection: 1; mode=block
  - Legacy XSS protection

Referrer-Policy: strict-origin-when-cross-origin
  - Controls referrer information

Access-Control-Allow-Origin: https://dashboard.university.edu
  - CORS configuration
```

---

## 7. Rate Limiting

### 7.1 Rate Limit Headers

```
Request:
GET /api/v1/students?page=1

Response Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1719622800

Meaning:
- Limit: 100 requests per minute
- Remaining: 95 requests left in this window
- Reset: Unix timestamp when limit resets
```

### 7.2 Rate Limit Tiers

| User Type | Limit | Window |
|-----------|-------|--------|
| Anonymous | 10 | per minute |
| Authenticated (General) | 100 | per minute |
| Faculty | 200 | per minute |
| Department Head | 300 | per minute |
| Admin | 1000 | per minute |
| System Integration | Custom | negotiated |

---

## 8. Webhook Architecture

### 8.1 Webhook Events

```
Events triggered:

Academic Events:
  - enrollment.created
  - enrollment.dropped
  - grade.submitted
  - grade.approved
  - grade_appeal.created
  - academic_standing.changed
  - degree_milestone.achieved

Workflow Events:
  - workflow.submitted
  - workflow.approved
  - workflow.rejected
  - workflow.escalated
  - approval_task.assigned

Administrative Events:
  - user.created
  - user.updated
  - role.changed
  - permission.changed

OneDrive Events:
  - document.uploaded
  - document.shared
  - document.deleted
```

### 8.2 Webhook Subscription

```
POST /api/v1/webhooks
{
  "event": "grade.approved",
  "url": "https://lms.university.edu/webhooks/grade-update",
  "secret": "webhook-secret-key",
  "active": true,
  "retryConfig": {
    "maxRetries": 3,
    "retryDelay": 60,
    "backoffMultiplier": 2
  }
}

Webhook Payload:
{
  "event": "grade.approved",
  "timestamp": "2026-06-28T15:30:00Z",
  "data": {
    "grade_id": "uuid",
    "enrollment_id": "uuid",
    "grade_letter": "A",
    "approved_by": "dept-head-uuid"
  },
  "signature": "sha256=..."  // HMAC-SHA256 with webhook secret
}
```

---

## 9. API Documentation

### 9.1 OpenAPI/Swagger Documentation

```yaml
openapi: 3.0.0
info:
  title: Academic Department360 Dashboard API
  version: 1.0.0
  description: RESTful API for academic management

servers:
  - url: https://api.academic-dashboard.university.edu/api/v1
    description: Production
  - url: http://localhost:3000/api/v1
    description: Development

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    Student:
      type: object
      properties:
        id:
          type: string
          format: uuid
        student_id:
          type: string
        first_name:
          type: string
        last_name:
          type: string
        email:
          type: string
          format: email
        major_id:
          type: string
          format: uuid
        gpa:
          type: number
          format: float
          minimum: 0
          maximum: 4

paths:
  /students:
    get:
      summary: List students
      security:
        - BearerAuth: []
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: Student list
        '401':
          description: Unauthorized
        '403':
          description: Permission denied
```

### 9.2 API Documentation Tools

- **Swagger UI**: Interactive API documentation
- **Postman Collection**: Pre-configured requests
- **OpenAPI YAML**: Machine-readable specification
- **API Reference**: HTML documentation

---

## 10. SDK & Client Libraries

### 10.1 JavaScript/TypeScript SDK

```typescript
import { AcademicDashboardClient } from '@academic-dashboard/sdk';

const client = new AcademicDashboardClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.academic-dashboard.university.edu/api/v1'
});

// Usage
const students = await client.students.list({ page: 1, limit: 20 });
const grades = await client.grades.getForStudent(studentId);
await client.grades.submit(gradeData);
```

### 10.2 Python SDK

```python
from academic_dashboard import Client

client = Client(
    api_key='your-api-key',
    base_url='https://api.academic-dashboard.university.edu/api/v1'
)

students = client.students.list(page=1, limit=20)
grades = client.grades.get_for_student(student_id)
client.grades.submit(grade_data)
```

---

## 11. API Versioning Strategy

### 11.1 Version Compatibility

```
v1.0 (Current)
├── New features added as additive changes
├── Existing endpoints maintained
├── Deprecated endpoints marked with warnings
└── Support period: Until v2.0 + 12 months

v2.0 (Future)
├── Breaking changes allowed
├── New REST patterns
├── Parallel operation with v1
└── Migration period: 12 months

Migration Path:
- Announce v2.0 release 6 months prior
- Provide migration guide
- Support both versions in parallel
- Sunset v1.0 after 12 months
```

---

## 12. API Gateway Configuration

```
Rate Limiting & Throttling
├── Per-user: 100 req/min
├── Per-IP: 1000 req/min
├── Burst limit: 20 req/10sec
└── Penalties: Progressive backoff

CORS Configuration
├── Allowed origins: https://dashboard.university.edu
├── Allowed methods: GET, POST, PUT, DELETE
├── Allowed headers: Content-Type, Authorization
└── Credentials: true

Caching
├── Cache-Control headers set by backend
├── 5-minute cache for read-heavy endpoints
├── No cache for write operations
└── Cache invalidation on data changes
```

