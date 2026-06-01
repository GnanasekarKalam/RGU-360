// FACULTY AND STUDENT MASTER MODULES DOCUMENTATION
// Complete implementation guide for Faculty and Student Master Modules

## Overview
The Faculty and Student Master Modules provide comprehensive management systems for faculty credentials, achievements, and student records including academic performance, fees, and mentoring relationships.

---

## FACULTY MASTER MODULE

### Components
1. **Faculty Profile** - Enhanced faculty information
2. **Qualifications** - Academic degrees and credentials
3. **Publications** - Research publications and papers
4. **FDP (Faculty Development Programs)** - Professional development tracking
5. **Seminars** - Seminar and workshop participation
6. **PhD Tracking** - Research scholar supervision tracking
7. **Skills** - Competencies and endorsements
8. **Evidence** - Supporting documentation

### Database Models

#### FacultyQualification
Stores academic qualifications of faculty members.
- Fields: degreeType, specialization, university, yearOfPassing, gradePercentage, certificateUrl, isVerified
- Relationships: One-to-Many with Faculty

#### FacultyPublication
Tracks research publications by faculty.
- Fields: title, authors, publicationType, journalName, publicationYear, doi, impact, citationCount, isVerified
- Supported Types: JOURNAL, CONFERENCE, BOOK, BOOK_CHAPTER, PATENT, TECHNICAL_REPORT

#### FacultyFDP
Tracks Faculty Development Program participation.
- Fields: programName, organizingInstitute, startDate, endDate, level, fieldOfStudy, certificateIssued
- Levels: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT

#### FacultySeminar
Tracks seminar and workshop participation.
- Fields: seminarTitle, organizingBody, venue, startDate, endDate, role
- Roles: ORGANIZER, SPEAKER, CHAIR, PARTICIPANT, INVITED_GUEST

#### FacultyPhd
Tracks PhD research supervision and progress.
- Fields: studentName, researchTopic, supervisorName, enrollmentDate, expectedCompletionDate, status, progressPercentage
- Statuses: ENROLLED, PROGRESS, THESIS_SUBMITTED, VIVA_SCHEDULED, COMPLETED, WITHDRAWN

#### FacultySkill
Tracks faculty skills and competencies.
- Fields: skillName, skillCategory, proficiencyLevel, yearsOfExperience, endorsements
- Proficiency Levels: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, MASTER

#### FacultyEvidence
Stores supporting documentation for achievements.
- Fields: title, evidenceType, documentUrl, issueDate, verificationNumber, status
- Types: AWARD, PATENT, RESEARCH_GRANT, CERTIFICATION, LICENSE, RECOGNITION, ACHIEVEMENT
- Status: PENDING, VERIFIED, REJECTED, EXPIRED

### API Endpoints

#### Profile Management
- `GET /api/faculty/:id` - Get faculty profile
- `PUT /api/faculty/:id` - Update faculty profile
- `GET /api/faculty/:id/dashboard` - Get complete dashboard with all components

#### Qualifications
- `POST /api/faculty/:id/qualifications` - Add qualification
- `GET /api/faculty/:id/qualifications` - List qualifications
- `DELETE /api/faculty/:id/qualifications/:qualificationId` - Delete qualification

#### Publications
- `POST /api/faculty/:id/publications` - Add publication
- `GET /api/faculty/:id/publications?limit=100` - List publications with pagination
- `DELETE /api/faculty/:id/publications/:publicationId` - Delete publication

#### FDP Programs
- `POST /api/faculty/:id/fdp` - Add FDP program
- `GET /api/faculty/:id/fdp` - List FDP programs
- `DELETE /api/faculty/:id/fdp/:fdpId` - Delete FDP program

#### Seminars
- `POST /api/faculty/:id/seminars` - Add seminar
- `GET /api/faculty/:id/seminars` - List seminars
- `DELETE /api/faculty/:id/seminars/:seminarId` - Delete seminar

#### PhD Tracking
- `POST /api/faculty/:id/phd` - Add PhD candidate
- `GET /api/faculty/:id/phd` - List PhD candidates
- `PUT /api/faculty/:id/phd/:phdId` - Update PhD progress
- `DELETE /api/faculty/:id/phd/:phdId` - Delete PhD candidate

#### Skills
- `POST /api/faculty/:id/skills` - Add skill
- `GET /api/faculty/:id/skills` - List skills
- `DELETE /api/faculty/:id/skills/:skillId` - Delete skill

#### Evidence
- `POST /api/faculty/:id/evidence` - Add evidence
- `GET /api/faculty/:id/evidence` - List evidence
- `PATCH /api/faculty/:id/evidence/:evidenceId/verify` - Verify evidence (Admin)
- `DELETE /api/faculty/:id/evidence/:evidenceId` - Delete evidence

### Service Functions

All service functions follow the pattern: `{ success: boolean, message?: string, data: {...} }`

```typescript
// Profile
getFacultyProfile(facultyId: string)
updateFacultyProfile(facultyId: string, data: any)

// Qualifications
addQualification(facultyId: string, data: CreateQualificationRequest)
getQualifications(facultyId: string)
deleteQualification(qualificationId: string)

// Publications
addPublication(facultyId: string, data: CreatePublicationRequest)
getPublications(facultyId: string, limit?: number)
deletePublication(publicationId: string)

// FDP
addFDP(facultyId: string, data: CreateFDPRequest)
getFDPPrograms(facultyId: string)
deleteFDP(fdpId: string)

// Seminars
addSeminar(facultyId: string, data: CreateSeminarRequest)
getSeminars(facultyId: string)
deleteSeminar(seminarId: string)

// PhD
addPhdCandidate(facultyId: string, data: CreatePhdRequest)
getPhdCandidates(facultyId: string)
updatePhdProgress(phdId: string, data: UpdatePhdRequest)
deletePhdCandidate(phdId: string)

// Skills
addSkill(facultyId: string, data: CreateSkillRequest)
getSkills(facultyId: string)
deleteSkill(skillId: string)

// Evidence
addEvidence(facultyId: string, data: CreateEvidenceRequest)
getEvidence(facultyId: string)
verifyEvidence(evidenceId: string, verifiedBy: string)
deleteEvidence(evidenceId: string)

// Dashboard
getFacultyDashboard(facultyId: string): FacultyDashboardResponse
```

### Permissions Required
- `READ:FACULTY` - View faculty profiles
- `CREATE:FACULTY_QUALIFICATION` - Add qualifications
- `UPDATE:FACULTY_QUALIFICATION` - Update qualifications
- `DELETE:FACULTY_QUALIFICATION` - Delete qualifications
- Similar for PUBLICATION, FDP, SEMINAR, PHD, SKILL, EVIDENCE

---

## STUDENT MASTER MODULE

### Components
1. **Student Profile** - Enhanced student information
2. **Parent Details** - Parent/Guardian information
3. **Academic Records** - Semester-wise academic performance
4. **Fees** - Fee structure and payment tracking
5. **Tutor-Ward Assignment** - Mentorship relationship management

### Database Models

#### StudentParent
Stores parent/guardian information.
- Fields: parentName, relationship, email, phoneNumber, profession, address fields, aadharNumber
- Relationships: One-to-Many with Student

#### StudentAcademicRecord
Tracks academic performance per semester.
- Fields: semester, academicYear, semesterGpa, creditsEarned, attemptedCredits, cumulativeGpa, academicStanding
- Unique Constraint: (studentId, semester, academicYear)

#### StudentFee
Tracks fee structure and payments.
- Fields: feeCategory, totalFeeAmount, dueDate, paidAmount, balance, paymentStatus, installments
- Categories: TUITION, HOSTEL, TRANSPORTATION, ACTIVITY, LIBRARY, LABORATORY
- Status: PENDING, PARTIAL_PAID, PAID, OVERDUE, WAIVED

#### StudentTutorWard
Manages tutor-student mentorship relationships.
- Fields: tutorId, assignmentDate, startDate, endDate, status, mentorshipPlan
- Status: ACTIVE, INACTIVE, COMPLETED, TERMINATED, PAUSED

### API Endpoints

#### Student Profile
- `GET /api/student/:id` - Get student profile
- `PUT /api/student/:id` - Update student profile
- `GET /api/student/:id/dashboard` - Get complete student dashboard

#### Parent Details
- `POST /api/student/:id/parents` - Add parent/guardian
- `GET /api/student/:id/parents` - List parents
- `PUT /api/student/:id/parents/:parentId` - Update parent details
- `DELETE /api/student/:id/parents/:parentId` - Delete parent entry

#### Academic Records
- `POST /api/student/:id/academic-records` - Create academic record
- `GET /api/student/:id/academic-records` - List academic records
- `DELETE /api/student/:id/academic-records/:recordId` - Delete academic record

#### Fees
- `POST /api/student/:id/fees` - Create fee entry
- `GET /api/student/:id/fees` - List fees
- `POST /api/student/:id/fees/:feeId/payment` - Record fee payment
- `GET /api/student/:id/fees/summary?semester=1&academicYear=2024-25` - Get fee summary

#### Tutor-Ward Assignment
- `POST /api/student/:id/tutor-ward` - Assign tutor
- `GET /api/student/:id/tutor-ward` - Get current tutor assignment
- `PUT /api/student/:id/tutor-ward/:assignmentId` - Update assignment
- `DELETE /api/student/:id/tutor-ward/:assignmentId` - Terminate assignment
- `GET /api/tutor/:tutorId/tutees` - Get tutees for faculty member

### Service Functions

```typescript
// Student Profile
getStudentProfile(studentId: string)
updateStudentProfile(studentId: string, data: any)

// Parents
addParent(studentId: string, data: CreateParentRequest)
getParents(studentId: string)
updateParent(parentId: string, data: UpdateParentRequest)
deleteParent(parentId: string)

// Academic Records
createAcademicRecord(studentId: string, data: CreateAcademicRecordRequest)
getAcademicRecords(studentId: string)
deleteAcademicRecord(recordId: string)

// Fees
createFee(studentId: string, data: CreateFeeRequest)
getFees(studentId: string)
recordFeePayment(feeId: string, data: RecordFeePaymentRequest)
getFeeSummary(studentId: string, semester: string, academicYear: string)

// Tutor-Ward
assignTutorWard(studentId: string, data: AssignTutorWardRequest)
getTutorWard(studentId: string)
updateTutorWard(assignmentId: string, data: UpdateTutorWardRequest)
terminateTutorWard(assignmentId: string)
getTuteesList(tutorId: string)

// Dashboard
getStudentDashboard(studentId: string): StudentDashboardResponse
```

### Permissions Required
- `READ:STUDENT` - View student profiles
- `CREATE:STUDENT_ACADEMIC_RECORD` - Add academic records
- `UPDATE:STUDENT_ACADEMIC_RECORD` - Update records
- `DELETE:STUDENT_ACADEMIC_RECORD` - Delete records
- `CREATE:STUDENT_FEE` - Create fees
- `CREATE:STUDENT_TUTOR_WARD` - Assign tutors
- `UPDATE:STUDENT_TUTOR_WARD` - Update assignments
- `DELETE:STUDENT_TUTOR_WARD` - Remove assignments

---

## Integration with Authentication System

### Required Middleware
All endpoints require the `authenticate` middleware which verifies JWT tokens and extracts user information.

### Permission Checks
Use `requirePermission(action, resource)` middleware to enforce fine-grained access control:
```typescript
requirePermission('CREATE', 'FACULTY_QUALIFICATION')
requirePermission('UPDATE', 'STUDENT_FEE')
```

### Access Control Patterns

#### Faculty Module
- Faculty can view/update own profile
- HOD can view all department faculty
- ADMIN/SUPER_ADMIN can view all
- Qualification/Publication verification requires ADMIN role

#### Student Module
- Students can view own profile
- Faculty can view advisees
- HOD can view department students
- ADMIN can view all
- Fee management restricted to ADMIN/Finance role

---

## Request/Response Examples

### Add Faculty Qualification
```json
POST /api/faculty/fac123/qualifications
{
  "degreeType": "M.Tech",
  "specialization": "Computer Science",
  "university": "IIT Delhi",
  "yearOfPassing": 2020,
  "gradePercentage": 8.5,
  "certificateUrl": "https://..."
}

Response:
{
  "success": true,
  "message": "Qualification added successfully",
  "qualification": {...}
}
```

### Add Student Parent
```json
POST /api/student/std123/parents
{
  "parentName": "John Doe",
  "relationship": "FATHER",
  "email": "john@example.com",
  "phoneNumber": "+91-9876543210",
  "profession": "Engineer",
  "organization": "Tech Corp",
  "city": "Bangalore",
  "state": "Karnataka"
}

Response:
{
  "success": true,
  "message": "Parent added successfully",
  "parent": {...}
}
```

### Record Fee Payment
```json
POST /api/student/std123/fees/fee456/payment
{
  "paidAmount": 50000,
  "paymentDate": "2024-01-15",
  "transactionId": "TXN123456",
  "remarks": "Partial payment - Installment 1"
}

Response:
{
  "success": true,
  "message": "Fee payment recorded successfully",
  "fee": {
    "id": "fee456",
    "studentId": "std123",
    "paidAmount": 50000,
    "balance": 50000,
    "paymentStatus": "PARTIAL_PAID"
  }
}
```

---

## Error Handling

All endpoints return standardized error responses:
```json
{
  "success": false,
  "message": "Descriptive error message",
  "statusCode": 400 | 401 | 403 | 404 | 500
}
```

Common error codes:
- 400: Bad request (invalid data)
- 401: Unauthorized (no token)
- 403: Forbidden (insufficient permissions)
- 404: Not found (resource doesn't exist)
- 500: Internal server error

---

## Database Considerations

### Indexes
Optimal indexes are created on:
- facultyId (all faculty tables)
- studentId (all student tables)
- status fields (for efficient filtering)
- publicationType, evidenceType (for categorization queries)

### Query Performance
- Use `orderBy` for consistent ordering
- Leverage `include` for eager loading relationships
- Implement pagination for large result sets
- Consider caching for frequently accessed data

### Cascading Deletes
All models use `onDelete: Cascade` to maintain referential integrity:
- Deleting a faculty removes all associated qualifications, publications, etc.
- Deleting a student removes all associated records and fees

---

## Future Enhancements

1. **Advanced Analytics**
   - Publication impact metrics
   - PhD completion rate tracking
   - Fee collection analytics
   - Academic performance trends

2. **Batch Operations**
   - Import faculty qualifications via CSV
   - Bulk fee generation
   - Batch academic record updates

3. **Reporting**
   - Faculty annual reports
   - Student transcripts
   - Financial statements
   - Publication statistics

4. **Notifications**
   - Fee payment reminders
   - Tutor-ward meeting reminders
   - Verification status updates

5. **Audit Logging**
   - Track all modifications to faculty/student records
   - Maintain audit trails for compliance
