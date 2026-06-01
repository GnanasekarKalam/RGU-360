# Master Data Management - API Quick Reference

## Faculty Master API Reference

### Qualifications API

#### Add Qualification
```
POST /api/faculty/{facultyId}/qualifications
Authorization: Bearer {token}
Content-Type: application/json

{
  "degreeType": "Ph.D",
  "specialization": "Mathematics",
  "university": "Stanford University",
  "yearOfPassing": 2020,
  "gradePercentage": 95.5,
  "certificateUrl": "https://example.com/cert.pdf",
  "certificateNumber": "CERT-2020-001"
}

Response: 201 Created
{
  "success": true,
  "message": "Qualification added successfully",
  "qualification": {
    "id": "qual_123",
    "facultyId": "fac_123",
    "degreeType": "Ph.D",
    ...
  }
}
```

#### Get All Qualifications
```
GET /api/faculty/{facultyId}/qualifications
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "qualifications": [...]
}
```

#### Update Qualification
```
PUT /api/faculty/qualifications/{qualificationId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "gradePercentage": 96.0,
  "isVerified": true
}

Response: 200 OK
{
  "success": true,
  "message": "Qualification updated successfully",
  "qualification": {...}
}
```

#### Delete Qualification
```
DELETE /api/faculty/qualifications/{qualificationId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Qualification deleted successfully"
}
```

### Publications API

#### Add Publication
```
POST /api/faculty/{facultyId}/publications
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Advanced Mathematical Techniques in Machine Learning",
  "authors": ["Dr. John Doe", "Dr. Jane Smith"],
  "publicationType": "JOURNAL",
  "journalName": "Journal of Mathematics and AI",
  "journalVolume": "25",
  "journalIssue": "3",
  "pageNumbers": "234-250",
  "publicationYear": 2024,
  "doi": "10.1234/jmai.2024.001",
  "impact": 3.5,
  "link": "https://example.com/publication",
  "documentUrl": "https://example.com/publication.pdf"
}

Response: 201 Created
{
  "success": true,
  "message": "Publication added successfully",
  "publication": {...}
}
```

#### Get All Publications
```
GET /api/faculty/{facultyId}/publications
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "publications": [...]
}
```

#### Update Citation Count
```
PUT /api/faculty/publications/{publicationId}/citations
Authorization: Bearer {token}
Content-Type: application/json

{
  "citationCount": 45
}

Response: 200 OK
{
  "success": true,
  "message": "Citation count updated",
  "publication": {...}
}
```

### FDP Programs API

#### Add FDP Program
```
POST /api/faculty/{facultyId}/fdp-programs
Authorization: Bearer {token}
Content-Type: application/json

{
  "programName": "Advanced Data Science Certification",
  "organizingInstitute": "Indian Institute of Technology",
  "startDate": "2024-06-01",
  "endDate": "2024-06-15",
  "level": "ADVANCED",
  "fieldOfStudy": "Data Science and Machine Learning",
  "certificateUrl": "https://example.com/fdp-cert.pdf",
  "certificateNumber": "FDP-2024-001"
}

Response: 201 Created
{
  "success": true,
  "message": "FDP program added successfully",
  "fdpProgram": {...}
}
```

#### Get All FDP Programs
```
GET /api/faculty/{facultyId}/fdp-programs
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "fdpPrograms": [...]
}
```

### Seminars API

#### Add Seminar
```
POST /api/faculty/{facultyId}/seminars
Authorization: Bearer {token}
Content-Type: application/json

{
  "seminarTitle": "Recent Advances in Pure Mathematics",
  "organizingBody": "Mathematics Department, XYZ University",
  "venue": "Main Auditorium",
  "city": "Delhi",
  "country": "India",
  "startDate": "2024-07-01",
  "endDate": "2024-07-03",
  "role": "SPEAKER",
  "description": "Keynote presentation on latest mathematical theories",
  "certificateUrl": "https://example.com/seminar-cert.pdf",
  "certificateNumber": "SEM-2024-001"
}

Response: 201 Created
{
  "success": true,
  "message": "Seminar added successfully",
  "seminar": {...}
}
```

#### Get All Seminars
```
GET /api/faculty/{facultyId}/seminars
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "seminars": [...]
}
```

### PhD Tracking API

#### Add PhD Candidate
```
POST /api/faculty/{facultyId}/phd-candidates
Authorization: Bearer {token}
Content-Type: application/json

{
  "studentName": "Rajesh Kumar",
  "enrollmentNumber": "PHD-2021-001",
  "researchTopic": "Applications of Topology in Modern Mathematics",
  "supervisorName": "Dr. John Doe",
  "coDoctorName": "Dr. Jane Smith",
  "enrollmentDate": "2021-06-15",
  "expectedCompletionDate": "2025-06-15"
}

Response: 201 Created
{
  "success": true,
  "message": "PhD candidate added successfully",
  "phd": {...}
}
```

#### Get All PhD Candidates
```
GET /api/faculty/{facultyId}/phd-candidates
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "candidates": [...],
  "stats": {
    "total": 5,
    "completed": 2,
    "inProgress": 2,
    "withdrawn": 1
  }
}
```

#### Update PhD Progress
```
PUT /api/faculty/phd-candidates/{phdId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "THESIS_SUBMITTED",
  "progressPercentage": 90,
  "preSubmissionDone": true,
  "viva1Date": "2025-04-15",
  "viva1Result": "PASS",
  "finalThesisUrl": "https://example.com/thesis.pdf",
  "thesisTitle": "Complete Thesis Title"
}

Response: 200 OK
{
  "success": true,
  "message": "PhD progress updated successfully",
  "phd": {...}
}
```

### Skills API

#### Add Skill
```
POST /api/faculty/{facultyId}/skills
Authorization: Bearer {token}
Content-Type: application/json

{
  "skillName": "Python Programming",
  "skillCategory": "Technical",
  "proficiencyLevel": "EXPERT",
  "yearsOfExperience": 10,
  "certificateUrl": "https://example.com/python-cert.pdf"
}

Response: 201 Created
{
  "success": true,
  "message": "Skill added successfully",
  "skill": {...}
}
```

#### Get All Skills
```
GET /api/faculty/{facultyId}/skills
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "skills": [...]
}
```

#### Endorse Skill
```
POST /api/faculty/skills/{skillId}/endorse
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Skill endorsed successfully",
  "skill": {
    "endorsements": 15
  }
}
```

### Evidence API

#### Add Evidence
```
POST /api/faculty/{facultyId}/evidence
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Best Faculty Award 2024",
  "description": "Recognition for outstanding teaching excellence",
  "evidenceType": "AWARD",
  "documentUrl": "https://example.com/award-doc.pdf",
  "imageUrl": "https://example.com/award.jpg",
  "issueDate": "2024-05-15",
  "issuingAuthority": "University Governing Body",
  "verificationNumber": "AWARD-2024-001"
}

Response: 201 Created
{
  "success": true,
  "message": "Evidence added successfully",
  "evidence": {...}
}
```

#### Get All Evidence
```
GET /api/faculty/{facultyId}/evidence
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "evidence": [...]
}
```

#### Verify Evidence
```
POST /api/faculty/evidence/{evidenceId}/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "VERIFIED"
}

Response: 200 OK
{
  "success": true,
  "message": "Evidence verified successfully",
  "evidence": {...}
}
```

### Faculty Dashboard API

#### Get Complete Dashboard
```
GET /api/faculty/{facultyId}/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "dashboard": {
    "profile": {...},
    "qualifications": [...],
    "publications": [...],
    "fdpPrograms": [...],
    "seminars": [...],
    "phdCandidates": [...],
    "skills": [...],
    "evidence": [...],
    "stats": {
      "totalPublications": 12,
      "totalFDPPrograms": 3,
      "totalSeminars": 8,
      "totalPhdCandidates": 5,
      "completedPhds": 2,
      "totalSkills": 10,
      "totalEvidenceItems": 6
    }
  }
}
```

---

## Student Master API Reference

### Parent/Guardian API

#### Add Parent
```
POST /api/student/{studentId}/parents
Authorization: Bearer {token}
Content-Type: application/json

{
  "parentName": "John Smith",
  "relationship": "FATHER",
  "email": "john.smith@example.com",
  "mobileNumber": "+1-555-0123",
  "profession": "Software Engineer",
  "organization": "Tech Solutions Inc",
  "addressLine1": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "aadharNumber": "XXXX-XXXX-1234",
  "panNumber": "ABCD1234E",
  "isEmergencyContact": true
}

Response: 201 Created
{
  "success": true,
  "message": "Parent/Guardian added successfully",
  "parent": {...}
}
```

#### Get All Parents
```
GET /api/student/{studentId}/parents
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "parents": [...]
}
```

#### Update Parent
```
PUT /api/student/parents/{parentId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "mobileNumber": "+1-555-0124",
  "email": "john.new@example.com"
}

Response: 200 OK
{
  "success": true,
  "message": "Parent updated successfully",
  "parent": {...}
}
```

#### Delete Parent
```
DELETE /api/student/parents/{parentId}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Parent deleted successfully"
}
```

### Academic Records API

#### Add Academic Record
```
POST /api/student/{studentId}/academic-records
Authorization: Bearer {token}
Content-Type: application/json

{
  "semester": "5",
  "academicYear": "2023-24",
  "semesterGpa": 3.85,
  "semesterCredits": 18,
  "creditsEarned": 18,
  "attemptedCredits": 18,
  "academicStanding": "GOOD",
  "notes": "Excellent performance, consistent grades"
}

Response: 201 Created
{
  "success": true,
  "message": "Academic record added successfully",
  "record": {...}
}
```

#### Get All Academic Records
```
GET /api/student/{studentId}/academic-records
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "records": [...]
}
```

#### Get Specific Semester Record
```
GET /api/student/{studentId}/academic-records/5/2023-24
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "record": {...}
}
```

### Fee Management API

#### Add Fee Structure
```
POST /api/student/{studentId}/fees
Authorization: Bearer {token}
Content-Type: application/json

{
  "semester": "5",
  "academicYear": "2023-24",
  "feeCategory": "TUITION",
  "feeDescription": "Semester tuition fee",
  "totalFeeAmount": 100000,
  "dueDate": "2023-09-01",
  "installments": 2
}

Response: 201 Created
{
  "success": true,
  "message": "Fee structure added successfully",
  "fee": {...}
}
```

#### Get All Fees
```
GET /api/student/{studentId}/fees
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "fees": [...]
}
```

#### Get Fee Summary
```
GET /api/student/{studentId}/fees/summary?semester=5&academicYear=2023-24
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "summary": {
    "studentId": "std_123",
    "semester": "5",
    "academicYear": "2023-24",
    "totalFeesDue": 100000,
    "totalFeesPaid": 50000,
    "remainingBalance": 50000,
    "categories": [...]
  }
}
```

#### Record Fee Payment
```
POST /api/student/fees/{feeId}/payment
Authorization: Bearer {token}
Content-Type: application/json

{
  "paidAmount": 50000,
  "paymentDate": "2023-09-15",
  "transactionId": "TXN-2023-001",
  "paymentMethod": "BANK_TRANSFER",
  "bankDetails": "HDFC Bank, Delhi Branch",
  "remarks": "First installment paid"
}

Response: 201 Created
{
  "success": true,
  "message": "Payment recorded successfully",
  "payment": {...},
  "fee": {...}
}
```

### Tutor Ward API

#### Assign Tutor
```
POST /api/student/{studentId}/tutor-ward
Authorization: Bearer {token}
Content-Type: application/json

{
  "tutorId": "{facultyId}",
  "startDate": "2024-06-01",
  "assignmentReason": "Academic mentoring for mathematics",
  "mentorshipPlan": "{JSON formatted mentorship goals}",
  "frequencyOfMeeting": 2
}

Response: 201 Created
{
  "success": true,
  "message": "Tutor assigned successfully",
  "tutorWard": {...}
}
```

#### Get Tutor Assignment
```
GET /api/student/{studentId}/tutor-ward
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "tutorWard": {
    "id": "tw_123",
    "studentId": "std_123",
    "tutor": {
      "id": "fac_123",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      }
    },
    "status": "ACTIVE",
    "meetingRecords": [...]
  }
}
```

#### Update Tutor Assignment
```
PUT /api/student/tutor-ward/{tutorWardId}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "COMPLETED",
  "performanceNotes": "Student showed significant improvement"
}

Response: 200 OK
{
  "success": true,
  "message": "Tutor ward updated successfully",
  "tutorWard": {...}
}
```

#### Record Meeting
```
POST /api/student/tutor-ward/{tutorWardId}/meeting
Authorization: Bearer {token}
Content-Type: application/json

{
  "meetingDate": "2024-06-15T14:00:00Z",
  "duration": 60,
  "topics": ["Linear Algebra", "Problem Solving Techniques"],
  "notes": "Discussed chapter 5 in detail",
  "studentProgress": "Good understanding of concepts",
  "discussionPoints": "Need to practice more exercises",
  "nextActionItems": "Complete homework by next meeting",
  "nextMeetingScheduled": "2024-06-22T14:00:00Z"
}

Response: 201 Created
{
  "success": true,
  "message": "Meeting recorded successfully",
  "meeting": {...}
}
```

### Student Dashboard API

#### Get Complete Dashboard
```
GET /api/student/{studentId}/dashboard
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "dashboard": {
    "profile": {...},
    "parents": [...],
    "academicRecords": [...],
    "fees": [...],
    "tutorWard": {...},
    "stats": {
      "totalParents": 2,
      "currentGpa": 3.85,
      "creditsEarned": 72,
      "creditsRequired": 120,
      "totalFeesDue": 100000,
      "totalFeesPaid": 50000,
      "pendingFees": 50000,
      "academicStanding": "GOOD",
      "tutorAssigned": true
    }
  }
}
```

---

## Error Response Format

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### Common HTTP Status Codes
- 201: Created (successful POST)
- 200: OK (successful GET/PUT)
- 400: Bad Request (validation error)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {jwt_token}
```

## Rate Limiting

- Recommended: 100 requests per minute per user
- Implement exponential backoff for retries

## Pagination (Future Enhancement)

```
GET /api/faculty/{id}/publications?page=1&limit=20
GET /api/student/{id}/fees?page=1&limit=10
```
