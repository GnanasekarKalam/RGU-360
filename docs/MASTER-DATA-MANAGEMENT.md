# Master Data Management System - Complete Documentation

## Overview

This document describes the comprehensive Master Data Management system for the Maths Dashboard, including Faculty Master and Student Master modules with all associated sub-entities and operations.

## Database Models

### Faculty Master Models

#### 1. FacultyQualification
Stores educational qualifications of faculty members.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `degreeType`: Type of degree (Bachelor, Master, PhD, etc.)
- `specialization`: Field of specialization
- `university`: University name
- `yearOfPassing`: Year of degree completion
- `gradePercentage`: Grade/percentage obtained
- `certificateUrl`: Link to certificate
- `certificateNumber`: Certificate reference number
- `isVerified`: Verification status
- `verifiedBy`: Admin who verified
- `verifiedAt`: Verification timestamp

#### 2. FacultyPublication
Tracks research publications of faculty.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `title`: Publication title
- `authors`: Array of author names
- `publicationType`: JOURNAL, CONFERENCE, BOOK, BOOK_CHAPTER, PATENT, TECHNICAL_REPORT
- `journalName`: Journal/conference name
- `journalVolume`, `journalIssue`: Volume and issue numbers
- `pageNumbers`: Page range
- `publicationYear`: Year of publication
- `doi`: Digital Object Identifier
- `issn`: International Standard Serial Number
- `impact`: Impact factor
- `link`: URL to publication
- `documentUrl`: Link to PDF
- `citationCount`: Number of citations
- `isVerified`: Verification status

#### 3. FacultyFDP
Stores Faculty Development Program participation.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `programName`: Name of FDP program
- `organizingInstitute`: Institute conducting FDP
- `startDate`, `endDate`: Program duration
- `duration`: Duration in days
- `level`: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `fieldOfStudy`: Subject area
- `certificateUrl`: Certificate link
- `certificateNumber`: Certificate ID
- `certificateIssued`: Boolean flag
- `isVerified`: Verification status

#### 4. FacultySeminar
Tracks seminar and conference participation.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `seminarTitle`: Title of seminar
- `organizingBody`: Organization conducting seminar
- `venue`: Location
- `city`, `country`: Geographic location
- `startDate`, `endDate`: Event duration
- `role`: ORGANIZER, SPEAKER, CHAIR, PARTICIPANT, INVITED_GUEST
- `description`: Additional details
- `certificateUrl`: Certificate link
- `isVerified`: Verification status

#### 5. FacultyPhd
Tracks PhD students supervised by faculty.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `studentName`: PhD student name
- `enrollmentNumber`: Unique enrollment number
- `researchTopic`: Research topic
- `supervisorName`: Supervisor name
- `coDoctorName`: Co-supervisor (if any)
- `enrollmentDate`: Date of enrollment
- `expectedCompletionDate`: Expected completion date
- `actualCompletionDate`: Actual completion date
- `status`: ENROLLED, PROGRESS, THESIS_SUBMITTED, VIVA_SCHEDULED, COMPLETED, WITHDRAWN
- `progressPercentage`: Completion percentage
- `preSubmissionDone`: Pre-submission thesis evaluation done
- `viva1Date`, `viva1Result`: First viva details
- `viva2Date`, `viva2Result`: Final viva details
- `finalThesisUrl`: Link to thesis
- `thesisTitle`: Title of thesis
- `isVerified`: Verification status

#### 6. FacultySkill
Stores faculty professional skills.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `skillName`: Name of skill
- `skillCategory`: Category (Technical, Research, Teaching, Management, etc.)
- `proficiencyLevel`: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT, MASTER
- `yearsOfExperience`: Years of experience with skill
- `certificateUrl`: Certificate link
- `certificateIssued`: Boolean flag
- `endorsements`: Number of endorsements
- `lastEndorsedAt`: Last endorsement timestamp
- `lastUpdated`: Last update timestamp

#### 7. FacultyEvidence
Stores achievements and evidence of accomplishments.

**Fields:**
- `id`: Unique identifier
- `facultyId`: Reference to Faculty
- `title`: Evidence title
- `description`: Detailed description
- `evidenceType`: AWARD, PATENT, RESEARCH_GRANT, CERTIFICATION, LICENSE, RECOGNITION, ACHIEVEMENT, OTHER
- `documentUrl`: Document link
- `imageUrl`: Image link
- `issueDate`: Date issued
- `expiryDate`: Expiration date (if applicable)
- `verificationNumber`: Reference/verification number
- `issuingAuthority`: Authority that issued
- `status`: PENDING, VERIFIED, REJECTED, EXPIRED
- `verifiedBy`: Verifying authority
- `verifiedAt`: Verification timestamp

### Student Master Models

#### 1. StudentParent
Stores parent/guardian information.

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Student
- `parentName`: Full name
- `relationship`: FATHER, MOTHER, GUARDIAN, UNCLE, AUNT, GRAND_FATHER, GRAND_MOTHER
- `email`: Email address
- `phoneNumber`, `mobileNumber`: Phone numbers
- `profession`: Professional occupation
- `organization`: Organization name
- `addressLine1`, `addressLine2`: Address
- `city`, `state`, `zipCode`, `country`: Location details
- `aadharNumber`: Aadhar (India ID)
- `panNumber`: PAN (Tax ID)
- `gstNumber`: GST number
- `isEmergencyContact`: Emergency contact flag
- `isVerified`: Verification status

#### 2. StudentAcademicRecord
Semester-wise academic performance.

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Student
- `semester`: Semester number
- `academicYear`: Academic year
- `semesterGpa`: Semester GPA
- `semesterCredits`: Total credits in semester
- `creditsEarned`: Credits earned
- `attemptedCredits`: Total credits attempted
- `totalCreditsEarned`: Cumulative earned credits
- `totalAttemptedCredits`: Cumulative attempted credits
- `cumulativeGpa`: Cumulative GPA
- `academicStanding`: GOOD, WARNING, PROBATION, SUSPENSION
- `notes`: Additional notes
- `recordVerifiedBy`: Verifying authority
- `recordVerifiedAt`: Verification timestamp

#### 3. StudentFee
Tracks fee structure and payment status.

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Student
- `semester`: Semester
- `academicYear`: Academic year
- `feeCategory`: TUITION, HOSTEL, TRANSPORTATION, ACTIVITY, LIBRARY, LABORATORY, OTHER
- `feeDescription`: Description
- `totalFeeAmount`: Total amount due
- `dueDate`: Payment due date
- `paidAmount`: Amount paid
- `balance`: Remaining balance
- `paymentStatus`: PENDING, PARTIAL_PAID, PAID, OVERDUE, WAIVED, EXEMPTED
- `lastPaymentDate`: Date of last payment
- `lastPaymentAmount`: Amount of last payment
- `installments`: Number of installments
- `installmentsPaid`: Installments paid
- `remarks`: Additional remarks

#### 4. StudentFeePayment
Individual payment records.

**Fields:**
- `id`: Unique identifier
- `studentFeeId`: Reference to StudentFee
- `paymentAmount`: Amount paid
- `paymentDate`: Date of payment
- `transactionId`: Transaction reference
- `paymentMethod`: CASH, CHEQUE, BANK_TRANSFER, CREDIT_CARD, ONLINE
- `bankDetails`: Bank information
- `chequeNumber`: Cheque number (if applicable)
- `chequeDate`: Cheque date
- `receiptNumber`: Receipt reference
- `receiptUrl`: Receipt link
- `remarks`: Additional remarks
- `processedBy`: Processing staff

#### 5. StudentTutorWard
Tutoring/mentoring assignment.

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Student
- `tutorId`: Reference to Faculty (tutor)
- `assignmentDate`: Date of assignment
- `startDate`: Start date of mentoring
- `endDate`: End date (if completed)
- `status`: ACTIVE, INACTIVE, COMPLETED, TERMINATED, PAUSED
- `assignmentReason`: Reason for assignment
- `mentorshipPlan`: Structured mentorship plan (JSON)
- `frequencyOfMeeting`: Meeting frequency
- `meetingDuration`: Duration per meeting (minutes)
- `lastMeetingDate`: Last meeting date
- `nextMeetingDate`: Next scheduled meeting
- `performanceNotes`: Progress notes
- `isActive`: Activity status

#### 6. StudentMeetingRecord
Meeting logs between student and tutor.

**Fields:**
- `id`: Unique identifier
- `tutorWardId`: Reference to StudentTutorWard
- `meetingDate`: Date of meeting
- `duration`: Meeting duration (minutes)
- `topics`: Topics discussed (array)
- `notes`: Detailed notes
- `studentProgress`: Student's progress feedback
- `discussionPoints`: Key discussion points
- `nextActionItems`: Action items for next meeting
- `nextMeetingScheduled`: Next scheduled meeting date

## API Endpoints

### Faculty Master Endpoints

#### Qualifications
- `POST /api/faculty/:id/qualifications` - Add qualification
- `GET /api/faculty/:id/qualifications` - Get all qualifications
- `PUT /api/faculty/qualifications/:id` - Update qualification
- `DELETE /api/faculty/qualifications/:id` - Delete qualification

#### Publications
- `POST /api/faculty/:id/publications` - Add publication
- `GET /api/faculty/:id/publications` - Get all publications
- `PUT /api/faculty/publications/:id/citations` - Update citation count

#### FDP Programs
- `POST /api/faculty/:id/fdp-programs` - Add FDP program
- `GET /api/faculty/:id/fdp-programs` - Get all FDP programs

#### Seminars
- `POST /api/faculty/:id/seminars` - Add seminar
- `GET /api/faculty/:id/seminars` - Get all seminars

#### PhD Tracking
- `POST /api/faculty/:id/phd-candidates` - Add PhD candidate
- `GET /api/faculty/:id/phd-candidates` - Get all PhD candidates
- `PUT /api/faculty/phd-candidates/:id` - Update PhD progress

#### Skills
- `POST /api/faculty/:id/skills` - Add skill
- `GET /api/faculty/:id/skills` - Get all skills
- `POST /api/faculty/skills/:id/endorse` - Endorse skill

#### Evidence
- `POST /api/faculty/:id/evidence` - Add evidence
- `GET /api/faculty/:id/evidence` - Get all evidence
- `POST /api/faculty/evidence/:id/verify` - Verify evidence

#### Dashboard
- `GET /api/faculty/:id/dashboard` - Complete faculty dashboard

### Student Master Endpoints

#### Parent/Guardian
- `POST /api/student/:id/parents` - Add parent
- `GET /api/student/:id/parents` - Get all parents
- `PUT /api/student/parents/:id` - Update parent
- `DELETE /api/student/parents/:id` - Delete parent

#### Academic Records
- `POST /api/student/:id/academic-records` - Add academic record
- `GET /api/student/:id/academic-records` - Get all records
- `GET /api/student/:id/academic-records/:semester/:year` - Get semester record

#### Fees
- `POST /api/student/:id/fees` - Add fee structure
- `GET /api/student/:id/fees` - Get all fees
- `GET /api/student/:id/fees/summary` - Get fee summary
- `POST /api/student/fees/:id/payment` - Record payment

#### Tutor Ward
- `POST /api/student/:id/tutor-ward` - Assign tutor
- `GET /api/student/:id/tutor-ward` - Get tutor assignment
- `PUT /api/student/tutor-ward/:id` - Update tutor assignment
- `POST /api/student/tutor-ward/:id/meeting` - Record meeting

#### Dashboard
- `GET /api/student/:id/dashboard` - Complete student dashboard

## Sample Request/Response Examples

### Add Faculty Qualification
```json
POST /api/faculty/{facultyId}/qualifications
{
  "degreeType": "Ph.D",
  "specialization": "Mathematics",
  "university": "University of XYZ",
  "yearOfPassing": 2020,
  "gradePercentage": 95.5,
  "certificateUrl": "https://..."
}

Response:
{
  "success": true,
  "message": "Qualification added successfully",
  "qualification": {...}
}
```

### Add Faculty Publication
```json
POST /api/faculty/{facultyId}/publications
{
  "title": "Advanced Mathematical Techniques",
  "authors": ["Dr. John Doe", "Dr. Jane Smith"],
  "publicationType": "JOURNAL",
  "journalName": "Journal of Mathematics",
  "journalVolume": "45",
  "journalIssue": "3",
  "pageNumbers": "125-140",
  "publicationYear": 2024,
  "doi": "10.xxxx/xxxxx",
  "impact": 2.5
}

Response:
{
  "success": true,
  "message": "Publication added successfully",
  "publication": {...}
}
```

### Add Student Parent
```json
POST /api/student/{studentId}/parents
{
  "parentName": "John Smith",
  "relationship": "FATHER",
  "email": "john@example.com",
  "mobileNumber": "+1234567890",
  "profession": "Engineer",
  "organization": "Tech Corp",
  "isEmergencyContact": true
}

Response:
{
  "success": true,
  "message": "Parent/Guardian added successfully",
  "parent": {...}
}
```

### Add Academic Record
```json
POST /api/student/{studentId}/academic-records
{
  "semester": "5",
  "academicYear": "2023-24",
  "semesterGpa": 3.85,
  "semesterCredits": 18,
  "creditsEarned": 18,
  "attemptedCredits": 18,
  "academicStanding": "GOOD",
  "notes": "Excellent performance in all courses"
}

Response:
{
  "success": true,
  "message": "Academic record added successfully",
  "record": {...}
}
```

### Record Fee Payment
```json
POST /api/student/fees/{feeId}/payment
{
  "paidAmount": 50000,
  "paymentDate": "2024-06-01",
  "transactionId": "TXN123456",
  "paymentMethod": "BANK_TRANSFER",
  "remarks": "Tuition fee paid for semester 5"
}

Response:
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {...},
  "fee": {...}
}
```

### Assign Tutor to Student
```json
POST /api/student/{studentId}/tutor-ward
{
  "tutorId": "{facultyId}",
  "startDate": "2024-06-01",
  "assignmentReason": "Academic support",
  "mentorshipPlan": "{JSON formatted plan}",
  "frequencyOfMeeting": 2
}

Response:
{
  "success": true,
  "message": "Tutor assigned successfully",
  "tutorWard": {...}
}
```

## Permissions Required

### Faculty Master
- `CREATE FACULTY_QUALIFICATION` - Add qualifications
- `UPDATE FACULTY_QUALIFICATION` - Update qualifications
- `DELETE FACULTY_QUALIFICATION` - Delete qualifications
- `CREATE FACULTY_PUBLICATION` - Add publications
- `UPDATE FACULTY_PUBLICATION` - Update publications
- `CREATE FACULTY_FDP` - Add FDP programs
- `CREATE FACULTY_SEMINAR` - Add seminars
- `CREATE FACULTY_PHD` - Add PhD candidates
- `UPDATE FACULTY_PHD` - Update PhD progress
- `CREATE FACULTY_SKILL` - Add skills
- `CREATE FACULTY_EVIDENCE` - Add evidence
- `VERIFY FACULTY_EVIDENCE` - Verify evidence

### Student Master
- `CREATE STUDENT_PARENT` - Add parents
- `UPDATE STUDENT_PARENT` - Update parents
- `DELETE STUDENT_PARENT` - Delete parents
- `CREATE STUDENT_ACADEMIC_RECORD` - Add academic records
- `CREATE STUDENT_FEE` - Add fees
- `CREATE STUDENT_FEE_PAYMENT` - Record payments
- `CREATE STUDENT_TUTOR_WARD` - Assign tutors
- `UPDATE STUDENT_TUTOR_WARD` - Update tutor assignment
- `CREATE STUDENT_MEETING` - Record meetings

## Access Control

### Faculty Master
- Faculty can view/update their own data
- HOD can view/update their department's faculty data
- ADMIN and SUPER_ADMIN have full access
- IQAC has read-only access

### Student Master
- Students can view/update their own data
- Parents can view linked student data
- Faculty can view their advisees' data
- HOD can view their department's students
- ADMIN and SUPER_ADMIN have full access

## Best Practices

1. **Verification**: Always verify qualifications, publications, and evidence before marking as verified
2. **Fee Management**: Regularly update fee payments and send reminders for overdue fees
3. **PhD Tracking**: Update progress percentage regularly to track dissertation progress
4. **Tutor Ward**: Schedule regular meetings and maintain records for student development
5. **Academic Records**: Update academic standing after each semester
6. **Evidence**: Maintain proper documentation with expiry tracking for licenses and certifications

## Integration Notes

- All services use Prisma ORM for database operations
- Authentication is required for all endpoints
- Authorization checks based on user roles
- Timestamps are automatically managed
- Soft deletes for records (using isActive flags where applicable)

## Error Handling

All API endpoints return standardized responses:

```json
{
  "success": true/false,
  "message": "Description of result",
  "data": {...} // Present on success
}
```

Common error codes:
- 400: Bad request (validation error)
- 403: Unauthorized (insufficient permissions)
- 404: Resource not found
- 500: Internal server error
