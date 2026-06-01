# Database Schema - Academic Department360 Dashboard

## 1. Entity-Relationship Overview

```
                     ┌─────────────────────┐
                     │      USERS          │
                     ├─────────────────────┤
                     │ id (PK)             │
                     │ email               │
                     │ password_hash       │
                     │ first_name          │
                     │ last_name           │
                     │ created_at          │
                     └────────┬────────────┘
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ↓            ↓            ↓
          ┌─────────┐  ┌──────────┐ ┌───────────┐
          │ FACULTY │  │ STUDENTS │ │ ADMIN_OPS │
          └─────────┘  └──────────┘ └───────────┘
                │            │
                ├────┐       ├────┐
                │    │       │    │
                ↓    ↓       ↓    ↓
          ┌──────────┐  ┌──────────────────┐
          │ COURSES  │  │ ENROLLMENTS      │
          └──────────┘  └──────────────────┘
                │            │
                ├────┐       │
                │    │       │
                ↓    ↓       ↓
          ┌──────────────────────────┐
          │ GRADES & ASSESSMENT      │
          └──────────────────────────┘

          ┌──────────────────┐
          │ ACADEMIC_PLANNING│
          │ - Degrees        │
          │ - Programs       │
          │ - Requirements   │
          └──────────────────┘

          ┌────────────────────┐
          │ WORKFLOW & APPROVALS│
          │ - Approval Tasks   │
          │ - Workflow History │
          └────────────────────┘
```

---

## 2. Core Tables

### 2.1 USERS Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    date_of_birth DATE,
    
    -- Contact Information
    phone_number VARCHAR(20),
    mobile_number VARCHAR(20),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(100),
    
    -- Account Status
    status ENUM('active', 'inactive', 'suspended', 'archived') DEFAULT 'active',
    is_mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_method ENUM('totp', 'sms', 'email', 'authenticator') DEFAULT 'totp',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    password_changed_at TIMESTAMP,
    
    -- Soft Delete
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    UNIQUE INDEX idx_active_email (email, deleted_at) WHERE deleted_at IS NULL
);
```

### 2.2 USER_ROLES Table

```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    department_id UUID,  -- For department-scoped roles
    assigned_by UUID,    -- Who assigned this role
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,  -- For temporary role assignments
    is_primary BOOLEAN DEFAULT FALSE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (assigned_by) REFERENCES users(id),
    
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id),
    INDEX idx_department_id (department_id),
    UNIQUE INDEX idx_user_role_dept (user_id, role_id, department_id)
);
```

### 2.3 FACULTY Table

```sql
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    department_id UUID NOT NULL,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Academic Information
    title VARCHAR(100),  -- Professor, Associate Professor, etc.
    specialization VARCHAR(255),
    academic_degree VARCHAR(100),
    degree_institution VARCHAR(255),
    
    -- Employment
    employment_status ENUM('full_time', 'part_time', 'adjunct', 'visiting') DEFAULT 'full_time',
    hire_date DATE,
    tenure_status ENUM('tenured', 'tenure_track', 'non_tenure_track') DEFAULT 'non_tenure_track',
    tenure_date DATE,
    
    -- Office Information
    office_location VARCHAR(255),
    office_phone VARCHAR(20),
    office_hours TEXT,  -- JSON formatted availability
    
    -- Performance
    performance_rating DECIMAL(3,2),
    teaching_effectiveness_score DECIMAL(3,2),
    last_evaluation_date DATE,
    
    -- Financial (Encrypted)
    salary_amount DECIMAL(10,2) ENCRYPTED,
    salary_currency VARCHAR(3) DEFAULT 'USD',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    
    INDEX idx_department_id (department_id),
    INDEX idx_employment_status (employment_status),
    INDEX idx_is_active (is_active)
);
```

### 2.4 STUDENTS Table

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    
    -- Academic Information
    degree_program_id UUID NOT NULL,
    major_id UUID NOT NULL,
    minor_id UUID,
    concentration_id UUID,
    
    -- Enrollment Status
    enrollment_status ENUM('enrolled', 'leave_of_absence', 'graduated', 'withdrawn', 'suspended') DEFAULT 'enrolled',
    enrollment_date DATE NOT NULL,
    expected_graduation_date DATE,
    graduation_date DATE,
    
    -- Academic Standing
    current_gpa DECIMAL(4,3),
    cumulative_gpa DECIMAL(4,3),
    academic_standing ENUM('good', 'warning', 'probation', 'suspension') DEFAULT 'good',
    credits_earned INT DEFAULT 0,
    credits_required INT,
    
    -- Contact Information
    permanent_address_id UUID,
    current_address_id UUID,
    
    -- Emergency Contact (Encrypted)
    emergency_contact_name VARCHAR(255) ENCRYPTED,
    emergency_contact_phone VARCHAR(20) ENCRYPTED,
    emergency_contact_relation VARCHAR(50) ENCRYPTED,
    
    -- Financial Hold
    has_financial_hold BOOLEAN DEFAULT FALSE,
    
    -- Advisor Assignment
    primary_advisor_id UUID,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (degree_program_id) REFERENCES programs(id),
    FOREIGN KEY (major_id) REFERENCES degree_programs(id),
    FOREIGN KEY (primary_advisor_id) REFERENCES faculty(id),
    
    INDEX idx_enrollment_status (enrollment_status),
    INDEX idx_academic_standing (academic_standing),
    INDEX idx_degree_program_id (degree_program_id),
    INDEX idx_primary_advisor_id (primary_advisor_id)
);
```

### 2.5 DEPARTMENTS Table

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(500),
    description TEXT,
    
    -- Leadership
    department_head_id UUID,
    
    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    office_location VARCHAR(255),
    
    -- Configuration
    is_active BOOLEAN DEFAULT TRUE,
    budget_allocation DECIMAL(12,2),
    academic_calendar_id UUID,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_head_id) REFERENCES faculty(id),
    FOREIGN KEY (academic_calendar_id) REFERENCES academic_calendars(id),
    
    INDEX idx_code (code),
    INDEX idx_is_active (is_active)
);
```

---

## 3. Academic Structure Tables

### 3.1 PROGRAMS Table

```sql
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    degree_type ENUM('bachelor', 'master', 'phd', 'certificate') DEFAULT 'bachelor',
    description TEXT,
    
    -- Academic Requirements
    total_credits_required INT,
    minimum_gpa DECIMAL(3,2) DEFAULT 2.0,
    
    -- Accreditation
    accreditation_status VARCHAR(50),
    accreditation_body VARCHAR(255),
    accreditation_expiry DATE,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id),
    
    UNIQUE INDEX idx_dept_code (department_id, code),
    INDEX idx_is_active (is_active)
);
```

### 3.2 COURSES Table

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    course_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Academic Details
    credit_hours INT NOT NULL DEFAULT 3,
    contact_hours INT,
    lab_hours INT,
    is_lab_course BOOLEAN DEFAULT FALSE,
    
    -- Prerequisites
    prerequisite_course_id UUID,
    prerequisite_grade_required VARCHAR(5),  -- 'C' or 'B', etc.
    corequisite_course_id UUID,
    
    -- Curriculum
    program_ids UUID[] DEFAULT '{}',  -- Programs this course is required for
    is_general_education BOOLEAN DEFAULT FALSE,
    
    -- Learning Outcomes
    learning_outcomes TEXT,  -- JSON format
    assessment_methods TEXT,  -- JSON format
    
    -- Enrollment
    max_enrollment INT DEFAULT 40,
    min_enrollment INT DEFAULT 10,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (prerequisite_course_id) REFERENCES courses(id),
    FOREIGN KEY (corequisite_course_id) REFERENCES courses(id),
    
    UNIQUE INDEX idx_dept_code (department_id, course_code),
    INDEX idx_is_active (is_active),
    INDEX idx_prerequisite (prerequisite_course_id)
);
```

### 3.3 CLASSES Table (Course Instances)

```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL,
    instructor_id UUID NOT NULL,
    semester_id UUID NOT NULL,
    
    -- Schedule
    section_number INT DEFAULT 1,
    day_of_week VARCHAR(20),  -- Monday, Tuesday, etc.
    start_time TIME,
    end_time TIME,
    location VARCHAR(255),  -- Building and room
    
    -- Capacity
    enrollment_capacity INT NOT NULL,
    current_enrollment INT DEFAULT 0,
    waitlist_count INT DEFAULT 0,
    
    -- Mode
    delivery_mode ENUM('in_person', 'online', 'hybrid') DEFAULT 'in_person',
    
    -- Grading
    grading_scheme_id UUID,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_full BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (instructor_id) REFERENCES faculty(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (grading_scheme_id) REFERENCES grading_schemes(id),
    
    UNIQUE INDEX idx_course_semester_section (course_id, semester_id, section_number),
    INDEX idx_instructor_id (instructor_id),
    INDEX idx_semester_id (semester_id)
);
```

### 3.4 ENROLLMENTS Table

```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    class_id UUID NOT NULL,
    semester_id UUID NOT NULL,
    
    -- Enrollment Status
    enrollment_status ENUM('enrolled', 'waitlisted', 'dropped', 'audit') DEFAULT 'enrolled',
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    drop_date TIMESTAMP,
    
    -- Grade Information
    grade_id UUID,
    grade_letter VARCHAR(2),
    grade_points DECIMAL(3,2),
    is_grade_final BOOLEAN DEFAULT FALSE,
    grade_posted_date TIMESTAMP,
    
    -- Attendance
    attendance_count INT DEFAULT 0,
    absence_count INT DEFAULT 0,
    
    -- Transcript
    include_in_gpa BOOLEAN DEFAULT TRUE,
    transcript_status ENUM('pending', 'posted', 'held') DEFAULT 'pending',
    
    -- Audit Trail
    created_by UUID,
    modified_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (semester_id) REFERENCES semesters(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (modified_by) REFERENCES users(id),
    
    UNIQUE INDEX idx_student_class (student_id, class_id, semester_id),
    INDEX idx_enrollment_status (enrollment_status),
    INDEX idx_semester_id (semester_id)
);
```

---

## 4. Grading Tables

### 4.1 GRADES Table

```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL,
    class_id UUID NOT NULL,
    student_id UUID NOT NULL,
    
    -- Grade Information
    grade_numeric DECIMAL(5,2),  -- Raw score out of total points
    grade_letter VARCHAR(2),  -- A, B, C, D, F
    grade_points DECIMAL(3,2),  -- GPA points: 4.0, 3.7, etc.
    
    -- Grading Components
    participation_score DECIMAL(5,2),
    attendance_score DECIMAL(5,2),
    assignment_score DECIMAL(5,2),
    midterm_score DECIMAL(5,2),
    final_exam_score DECIMAL(5,2),
    project_score DECIMAL(5,2),
    
    -- Status
    is_draft BOOLEAN DEFAULT TRUE,
    is_approved BOOLEAN DEFAULT FALSE,
    is_final BOOLEAN DEFAULT FALSE,
    
    -- Submission & Approval
    submitted_by_id UUID,
    submitted_at TIMESTAMP,
    approved_by_id UUID,
    approved_at TIMESTAMP,
    
    -- Comments
    faculty_comments TEXT,
    student_comments TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (submitted_by_id) REFERENCES faculty(id),
    FOREIGN KEY (approved_by_id) REFERENCES faculty(id),
    
    INDEX idx_student_id (student_id),
    INDEX idx_enrollment_id (enrollment_id),
    INDEX idx_is_approved (is_approved),
    INDEX idx_submitted_at (submitted_at)
);
```

### 4.2 GRADE_APPEALS Table

```sql
CREATE TABLE grade_appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL,
    student_id UUID NOT NULL,
    grade_id UUID NOT NULL,
    
    -- Appeal Details
    appeal_reason TEXT NOT NULL,
    appeal_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    appeal_status ENUM('submitted', 'in_review', 'approved', 'denied', 'escalated') DEFAULT 'submitted',
    
    -- Faculty Response
    faculty_response TEXT,
    faculty_response_date TIMESTAMP,
    faculty_reviewer_id UUID,
    
    -- Department Head Review (if escalated)
    department_review_notes TEXT,
    department_reviewer_id UUID,
    department_review_date TIMESTAMP,
    
    -- Outcome
    outcome_grade_id UUID,
    resolution_date TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (enrollment_id) REFERENCES enrollments(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (grade_id) REFERENCES grades(id),
    FOREIGN KEY (faculty_reviewer_id) REFERENCES faculty(id),
    FOREIGN KEY (department_reviewer_id) REFERENCES faculty(id),
    FOREIGN KEY (outcome_grade_id) REFERENCES grades(id),
    
    INDEX idx_student_id (student_id),
    INDEX idx_appeal_status (appeal_status),
    INDEX idx_appeal_date (appeal_date)
);
```

---

## 5. Workflow & Approval Tables

### 5.1 WORKFLOWS Table

```sql
CREATE TABLE workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_type ENUM('grade_submission', 'course_addition', 'grade_appeal', 'leave_request', 'curriculum_change') NOT NULL,
    status ENUM('draft', 'submitted', 'in_review', 'approved', 'rejected', 'completed', 'cancelled') DEFAULT 'draft',
    
    -- Related Resource
    related_resource_type VARCHAR(50),  -- grades, courses, students, etc.
    related_resource_id UUID,
    
    -- Initiator
    initiated_by_id UUID NOT NULL,
    initiated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Completion
    completed_by_id UUID,
    completed_at TIMESTAMP,
    
    -- Metadata
    data JSONB,  -- Flexible field for workflow-specific data
    comments TEXT,
    
    -- Timeline
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (initiated_by_id) REFERENCES users(id),
    FOREIGN KEY (completed_by_id) REFERENCES users(id),
    
    INDEX idx_workflow_type (workflow_type),
    INDEX idx_status (status),
    INDEX idx_initiated_at (initiated_at),
    INDEX idx_resource (related_resource_type, related_resource_id)
);
```

### 5.2 WORKFLOW_APPROVALS Table

```sql
CREATE TABLE workflow_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL,
    approval_level INT NOT NULL,  -- 1, 2, 3, etc.
    
    -- Approver
    assigned_to_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Status
    approval_status ENUM('pending', 'approved', 'rejected', 'escalated', 'reassigned') DEFAULT 'pending',
    
    -- Response
    response_date TIMESTAMP,
    comments TEXT,
    
    -- Reassignment (if applicable)
    reassigned_to_id UUID,
    reassignment_reason VARCHAR(255),
    reassignment_date TIMESTAMP,
    
    -- Escalation (if applicable)
    escalation_reason VARCHAR(255),
    escalated_to_id UUID,
    escalation_date TIMESTAMP,
    escalation_level INT,
    
    -- Timeline
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id),
    FOREIGN KEY (reassigned_to_id) REFERENCES users(id),
    FOREIGN KEY (escalated_to_id) REFERENCES users(id),
    
    UNIQUE INDEX idx_workflow_level (workflow_id, approval_level),
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_approval_status (approval_status),
    INDEX idx_due_date (due_date)
);
```

---

## 6. System Tables

### 6.1 AUDIT_LOGS Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    
    -- Request Details
    ip_address INET,
    user_agent VARCHAR(500),
    
    -- Status
    status VARCHAR(20),
    error_message TEXT,
    
    -- FERPA Tracking
    ferpa_protected BOOLEAN DEFAULT FALSE,
    student_id UUID,
    
    -- Severity
    severity ENUM('info', 'warning', 'error', 'critical') DEFAULT 'info',
    
    -- Retention
    retention_until DATE,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (student_id) REFERENCES students(id),
    
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_ferpa (ferpa_protected),
    INDEX idx_severity (severity)
);
```

---

## 7. Reference/Lookup Tables

### 7.1 SEMESTERS Table

```sql
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    academic_year INT NOT NULL,
    season ENUM('spring', 'summer', 'fall', 'winter'),
    
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    registration_start DATE,
    registration_end DATE,
    add_drop_deadline DATE,
    withdrawal_deadline DATE,
    grades_due_date DATE,
    
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_academic_year (academic_year),
    INDEX idx_is_active (is_active)
);
```

### 7.2 ROLES Table

```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,  -- Cannot be modified
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_is_active (is_active)
);
```

### 7.3 PERMISSIONS Table

```sql
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(100),
    action VARCHAR(50),  -- read, write, delete, approve, etc.
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE INDEX idx_resource_action (resource, action)
);
```

### 7.4 ROLE_PERMISSIONS Table

```sql
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    UNIQUE INDEX idx_role_permission (role_id, permission_id)
);
```

---

## 8. Indexing Strategy

### High-Priority Indexes (Query Performance)
- `users.email` - Login queries
- `students.student_id` - Student lookup
- `faculty.employee_id` - Faculty lookup
- `enrollments.student_id, semester_id` - Student course lookup
- `grades.enrollment_id` - Grade queries
- `workflow_approvals.assigned_to_id, approval_status` - Pending approvals
- `audit_logs.created_at, user_id` - Audit queries

### Partial Indexes (Optimize space)
- `audit_logs` - On ferpa_protected AND deleted_at IS NULL
- `users` - On deleted_at IS NULL for active user queries
- `workflow_approvals` - On approval_status = 'pending'

### Full-Text Indexes (Search)
- `courses.title, description`
- `faculty.specialization`
- `programs.name, description`

---

## 9. Constraints & Data Integrity

### Primary Key Constraints
- All tables have UUID primary keys
- Ensures global uniqueness
- Better for distributed systems

### Foreign Key Constraints
- Referential integrity enforced
- Cascading deletes for dependent records (e.g., enrollments delete when student deleted)
- Restrict deletes where needed (e.g., cannot delete faculty if they have grades)

### Unique Constraints
- Email must be unique (prevents duplicate accounts)
- Student ID unique per institution
- Course code unique per department

### Check Constraints
- GPA between 0.0 and 4.0
- Credit hours > 0
- Grade numeric between 0 and 100
- Enrollment capacity >= current enrollment

---

## 10. Data Security

### Encrypted Fields
- SSN
- Salary information
- Emergency contact information
- Medical/health information
- Financial information

### Encryption Strategy
- Field-level AES-256 encryption
- Encryption keys managed by KMS
- Decryption only in application layer
- Database stores encrypted values

### Access Logging
- All PII access logged (FERPA compliance)
- Audit trail for sensitive data modifications
- Retention: 7 years for FERPA records

