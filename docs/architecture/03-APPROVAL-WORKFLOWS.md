# Approval Workflows - Academic Department360 Dashboard

## 1. Workflow Management System Overview

### 1.1 Core Workflow Components
```
┌─────────────────────────────────────────────────────────────┐
│             WORKFLOW ENGINE (State Machine)                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ • Workflow Definition (JSON/YAML configuration)             │
│ • State Transitions (rules and conditions)                  │
│ • Task Queue Management                                     │
│ • Notification System                                       │
│ • Audit Trail & History                                     │
│ • Escalation & Timeout Handling                             │
│ • Parallel & Sequential Step Support                        │
│ • Delegation & Reassignment                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Standard Workflow States
```
DRAFT → SUBMITTED → IN_REVIEW → APPROVED → COMPLETED
                       ↓
                   REJECTED → REVISE → SUBMITTED (loop)
                       ↓
                    CANCELLED

PENDING → ESCALATED → URGENT
```

---

## 2. Core Workflows

### 2.1 Grade Submission & Approval Workflow

**Purpose**: Ensure grade accuracy and integrity with multi-level review

**Workflow Diagram**:
```
┌─────────────┐
│   Faculty   │
│ Submits     │
│  Grades     │
└──────┬──────┘
       │ [Validates: Format, Range, Completeness]
       ↓
┌──────────────────────┐
│  Draft Status        │
│  - Stored in DB      │
│  - Can be edited     │
│  - Notif sent        │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│ Faculty Finalizes    │
│ Grade Submission     │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────────┐
│ SUBMITTED State              │
│ - Locked from edit           │
│ - Create approval task       │
│ - Notify Dept Head           │
└──────┬───────────────────────┘
       │
       ├──→ [Timeout: 7 days]──→ [Auto-escalate]
       │
       ↓
┌──────────────────────────────┐
│ Department Head Review       │
├──────────────────────────────┤
│ Options:                     │
│ 1. APPROVE                   │
│ 2. REJECT (with reason)      │
│ 3. REQUEST_REVISION          │
└──────┬───────────────────────┘
       │
       ├─────────────┬──────────────┬────────────────┐
       │ APPROVE     │ REJECT       │ REQUEST_REVISION
       ↓             ↓              ↓
    Grades      Notify Faculty   Faculty Revises
    Published   Return to Draft   Resubmit
       │             │              │
       └─────────┬───┴──────────────┘
               ↓
           COMPLETED
              [Log in Audit Trail]
              [Notify Students]
              [Release Transcript]
```

**Approval Levels**:
1. **Level 1**: Faculty (Self-check) - Format validation
2. **Level 2**: Department Head - Accuracy and policy compliance
3. **Level 3** (Optional): Dean - For appeals or exceptions

**Timeframes**:
- Faculty submission deadline: End of semester + 2 weeks
- Department Head review: 7 days (auto-escalate if exceeded)
- Appeal processing: 14 days

**Triggers**:
- Grades submitted by faculty
- System auto-triggers on deadline approach (3 days warning)

**Notifications**:
- Faculty: Confirmation of submission, approval status
- Dept Head: New grades to review
- Students: Grade published notification
- Academic Advisor: Grade changes affecting standing

**Data Captured**:
- Submitted by, date/time
- Approved by, date/time
- Any comments or flags
- Number of grades changed
- Appeal reason (if applicable)

---

### 2.2 Course Addition/Modification Workflow

**Purpose**: Control course catalog changes and ensure academic planning alignment

**Workflow Diagram**:
```
┌──────────────────────┐
│ Faculty Proposes     │
│ New Course or        │
│ Modification         │
└──────┬───────────────┘
       │ [Validation: Title, Credits, Prerequisites]
       ↓
┌──────────────────────────────┐
│ DRAFT Status                 │
│ - Faculty can edit           │
│ - Preview in catalog         │
│ - Check prerequisites        │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Faculty Submits for Review   │
│ Provides:                    │
│ - Course description         │
│ - Learning outcomes          │
│ - Prerequisites              │
│ - Required materials         │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ SUBMITTED State              │
│ - Notify Department Head     │
│ - Notify Curriculum Committee│
└──────┬───────────────────────┘
       │
       ├──→ [Timeout: 14 days] → [Escalate to Dean]
       │
       ↓
┌──────────────────────────────┐
│ Department Head Review       │
│ Check: Policy alignment,     │
│ prerequisites, scheduling    │
└──────┬───────────────────────┘
       │
       ├─────────────────────────────┐
       │ APPROVE                     │ REJECT
       │                             │
       ↓                             ↓
    Check for              Notify Faculty
    Curriculum            Reason provided
    Committee             Can resubmit
    conflicts
       │
       ├──→ [Conflict] → Request revision
       │
       ↓
┌──────────────────────────────┐
│ APPROVED State               │
│ - Active in next semester    │
│ - Available for enrollment   │
│ - Added to OneDrive folder   │
│ - Notify faculty & advisors  │
└──────────────────────────────┘
```

**Approval Levels**:
1. **Level 1**: Faculty (Self-proposal)
2. **Level 2**: Department Head - Policy compliance
3. **Level 3**: Curriculum Committee (if interdepartmental)
4. **Level 4**: Dean (if new program/major course)

**Timeframes**:
- Proposal deadline: 60 days before semester
- Department Head review: 14 days
- Curriculum Committee: 21 days
- Dean approval: 7 days

**Triggers**:
- New course proposal
- Course modification request
- Prerequisite changes
- Credit hour modifications

---

### 2.3 Grade Appeal Workflow

**Purpose**: Fair and transparent process for student grade disputes

**Workflow Diagram**:
```
┌──────────────────────┐
│ Student Initiates    │
│ Grade Appeal         │
│ Provides Reason      │
└──────┬───────────────┘
       │ [Validation: Within 30 days of posting]
       ↓
┌──────────────────────────────┐
│ SUBMITTED State              │
│ - Appeal stored              │
│ - Notify Faculty             │
│ - Notify Advisor             │
│ - Create case number         │
└──────┬───────────────────────┘
       │
       ├──→ [Timeout: 14 days] → [Auto-escalate]
       │
       ↓
┌──────────────────────────────┐
│ Faculty Review               │
│ Options:                     │
│ 1. ACCEPT (revise grade)     │
│ 2. DENY (grade is correct)   │
│ 3. ESCALATE                  │
└──────┬───────────────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │ ACCEPT       │ DENY         │ ESCALATE     │
       ↓              ↓              ↓
    Grade       Notify          Department
    Updated     Student          Head Review
    Appeal      Appeal
    Resolved    Denied
       │              │              │
       │              ├──→ Student  ├──→ ACCEPTED/DENIED
       │              │   Can       │    from Dept Head
       │              │   Appeal to │
       │              │   Dept Head │
       │              │             │
       └──────────────┴─────────────┘
              ↓
          COMPLETED
         [Archive Case]
```

**Approval Levels**:
1. **Level 1**: Faculty - Initial review and response
2. **Level 2**: Department Head - If student appeals faculty decision
3. **Level 3**: Dean - If escalated beyond department

**Timeframes**:
- Appeal window: 30 days after grade posted
- Faculty response: 14 days
- Department Head review: 10 days (if escalated)
- Final resolution: 21 days total

**Required Documentation**:
- Original grade and grading rubric
- Student's work sample
- Faculty's grading notes
- Appeal reason from student

**Outcome**:
- Grade modified or upheld
- All parties notified
- Case archived with decision
- Academic record updated

---

### 2.4 Faculty Leave Request Workflow

**Purpose**: Manage faculty absences and ensure course coverage

**Workflow Diagram**:
```
┌──────────────────────┐
│ Faculty Requests     │
│ Leave (Vacation,     │
│ Sick, Sabbatical)    │
└──────┬───────────────┘
       │ [Validation: Balance, dates, coverage plan]
       ↓
┌──────────────────────────────┐
│ SUBMITTED State              │
│ - Dates specified            │
│ - Reason provided            │
│ - Coverage plan attached     │
│ - Notify Dept Head           │
└──────┬───────────────────────┘
       │
       ├──→ [Timeout: 5 days] → [Auto-escalate]
       │
       ↓
┌──────────────────────────────┐
│ Department Head Review       │
│ Check: Leave balance,        │
│ course coverage, timing      │
└──────┬───────────────────────┘
       │
       ├──────────────┬──────────────┐
       │ APPROVE      │ DENY         │
       ↓              ↓
   Leave            Notify Faculty
   Approved         Denied reason
   - Mark calendar  - Can appeal
   - Notify Faculty
   - Schedule cover
       │              │
       │              └──→ Optional escalation
       │                   to Dean
       ↓
   COMPLETED
   - Leave scheduled
   - Substitute assigned
   - Students notified
```

**Leave Types**:
- **Vacation**: 15-25 days/year (requires 30 days notice)
- **Sick**: Unlimited (with documentation over 3 days)
- **Sabbatical**: Every 7 years (requires 6 months notice)
- **Professional Development**: 5 days/year (requires approval)
- **Emergency**: Processed immediately (requires notification within 24 hours)

**Approval Rules**:
- Cannot exceed annual allocation
- Cannot overlap with scheduled classes without coverage
- Department Head can approve up to 5 consecutive days
- Dean approval required for sabbatical
- Emergency leaves auto-approved (processed post-hoc)

---

### 2.5 Curriculum Change Workflow

**Purpose**: Manage program-level academic changes

**Workflow Diagram**:
```
┌──────────────────────┐
│ Department Proposes  │
│ Curriculum Change    │
│ (new degree, track)  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────────┐
│ DRAFT State                  │
│ - Full documentation         │
│ - Learning outcomes          │
│ - Course sequence            │
│ - Assessment plan            │
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Department Head Submits      │
│ for Curriculum Review        │
└──────┬───────────────────────┘
       │
       ├──→ [Timeout: 21 days]
       │
       ↓
┌──────────────────────────────┐
│ Curriculum Committee Review  │
│ - Academic alignment         │
│ - Resource requirements      │
│ - Outcome assessment         │
└──────┬───────────────────────┘
       │
       ├─────────────┬──────────────┐
       │ APPROVE     │ REVISE       │
       ↓             ↓
    Send to       Faculty revises
    Dean          Resubmit
       │             │
       └─────────┬───┘
               ↓
┌──────────────────────────────┐
│ Dean Review & Approval       │
│ - Budget implications        │
│ - Cross-department impact    │
│ - Accreditation alignment    │
└──────┬───────────────────────┘
       │
       ├──────────────┬──────────────┐
       │ APPROVE      │ DENY         │
       ↓              ↓
   APPROVED       Notify dept
   - Effective   Can resubmit
     next year     next cycle
   - Implement
     updates
```

**Approval Hierarchy**:
1. Department Head (proposer)
2. Curriculum Committee (academic review)
3. Dean (administrative approval)
4. Provost (if multiple departments affected)

**Documentation Required**:
- Learning outcomes
- Course-to-outcome mapping
- Assessment plan
- Resource requirements
- Budget impact analysis
- Transition plan for existing students

**Timeline**:
- Proposal submission: 180 days before implementation
- Committee review: 21 days
- Dean review: 14 days
- Implementation: Following academic year

---

### 2.6 Academic Standing Change Workflow

**Purpose**: Automatically flag and escalate students with at-risk academic standing

**Workflow Diagram**:
```
┌──────────────────────┐
│ System Detects       │
│ GPA < Threshold      │
│ OR Failed courses    │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────────────┐
│ AUTO-TRIGGER                 │
│ Student Status: AT_RISK      │
│ - Academic Advisor notified  │
│ - Student notified           │
│ - Hold placed on registration│
└──────┬───────────────────────┘
       │
       ↓
┌──────────────────────────────┐
│ Advisor Reviews with Student │
│ - Course performance         │
│ - External factors           │
│ - Support options            │
└──────┬───────────────────────┘
       │
       ├──────────────┬─────────────┬──────────────┐
       │ MONITORING   │ INTERVENTION│ PROBATION    │
       ↓              ↓              ↓
   Monitor next    Tutoring &    Formal
   semester        support plan  probation
   - Bi-weekly             status
     check-in              - Suspension
   - Course               of bad standing
     selection               courses
     review
       │              │              │
       └──────────────┴──────────────┘
              ↓
      [Status improved] → ACTIVE (normal standing)
      [Status worsened] → PROBATION → SUSPENSION

```

**Automatic Triggers**:
- GPA < 2.0 for 2 consecutive semesters
- More than 2 failed courses in semester
- Attendance < 70%
- Incomplete grades > 30 days

**Intervention Tiers**:
1. **Monitoring**: Low risk, needs observation
2. **Intervention**: Medium risk, requires support
3. **Probation**: High risk, at threat of suspension
4. **Suspension**: Academic dismissal

---

## 3. Workflow Configuration Schema

```json
{
  "workflow_id": "grade_submission_v1",
  "name": "Grade Submission & Approval",
  "description": "Workflow for submitting and approving final grades",
  "version": "1.0",
  "enabled": true,
  
  "states": [
    {
      "id": "draft",
      "label": "Draft",
      "type": "start",
      "description": "Initial grade draft state"
    },
    {
      "id": "submitted",
      "label": "Submitted",
      "type": "waiting",
      "assignee_role": "department_head",
      "timeout": {
        "duration": 7,
        "unit": "days",
        "action": "escalate"
      }
    },
    {
      "id": "approved",
      "label": "Approved",
      "type": "end",
      "actions": ["publish_grades", "notify_students"]
    },
    {
      "id": "rejected",
      "label": "Rejected",
      "type": "end",
      "next_state": "draft"
    }
  ],
  
  "transitions": [
    {
      "from": "draft",
      "to": "submitted",
      "action": "finalize_submission",
      "role": "faculty",
      "validators": ["validate_grades", "check_completeness"]
    },
    {
      "from": "submitted",
      "to": "approved",
      "action": "approve",
      "role": "department_head",
      "conditions": ["no_errors", "all_data_valid"]
    },
    {
      "from": "submitted",
      "to": "rejected",
      "action": "reject",
      "role": "department_head",
      "requires": "rejection_reason"
    },
    {
      "from": "rejected",
      "to": "draft",
      "action": "return_to_draft",
      "automatic": true
    }
  ],
  
  "notifications": [
    {
      "event": "state_change",
      "state": "submitted",
      "recipients": ["department_head"],
      "template": "grade_review_pending"
    },
    {
      "event": "state_change",
      "state": "approved",
      "recipients": ["faculty", "students"],
      "template": "grades_published"
    }
  ],
  
  "audit": {
    "track_all_changes": true,
    "log_level": "detailed",
    "retention": 7  // years
  }
}
```

---

## 4. Workflow Escalation & Escalation Matrix

### Escalation Rules

| Workflow | Escalation Level | Timeout | Escalate To |
|----------|-----------------|---------|-------------|
| Grade Approval | Level 1 | 7 days | Department Head |
| | Level 2 | 14 days | Dean |
| Course Addition | Level 1 | 14 days | Department Head |
| | Level 2 | 21 days | Curriculum Committee |
| | Level 3 | 28 days | Dean |
| Grade Appeal | Level 1 | 14 days | Faculty Supervisor |
| | Level 2 | 21 days | Department Head |
| | Level 3 | 28 days | Dean |
| Leave Request | Level 1 | 5 days | Department Head |
| | Level 2 | 10 days | Dean |
| Curriculum Change | Level 1 | 21 days | Curriculum Committee |
| | Level 2 | 35 days | Dean |

### Escalation Notifications
- Automated reminders at 50% of timeout
- Final warning at 75% of timeout
- Auto-escalation at 100% of timeout
- Executive notification for critical tasks

---

## 5. Workflow Performance Metrics

**Key Metrics to Track**:
- Average processing time per workflow type
- Escalation rate (% reaching escalation)
- Rejection rate
- Revision cycles required
- Completion rate within SLA

**Targets**:
- Grade approval: 95% complete within 7 days
- Course addition: 90% complete within 42 days
- Grade appeals: 100% complete within 30 days
- Leave requests: 100% complete within 5 days

