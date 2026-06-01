// src/types/faculty-master.types.ts
// Faculty Master Module Types and Interfaces

export interface FacultyProfile {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  departmentName: string;
  title: string;
  specialization: string;
  academicDegree: string;
  degreeInstitution: string;
  employmentStatus: EmploymentStatus;
  hireDate: Date;
  tenureStatus: TenureStatus;
  officeLocation: string;
  officePhone: string;
  officeHours: string;
  performanceRating: number;
  teachingEffectivenessScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyQualification {
  id: string;
  facultyId: string;
  degreeType: string;
  specialization: string;
  university: string;
  yearOfPassing: number;
  gradePercentage: number;
  certificateUrl: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyPublication {
  id: string;
  facultyId: string;
  title: string;
  authors: string[];
  publicationType: 'JOURNAL' | 'CONFERENCE' | 'BOOK' | 'BOOK_CHAPTER' | 'PATENT' | 'TECHNICAL_REPORT';
  journalName?: string;
  journalVolume?: string;
  journalIssue?: string;
  pageNumbers?: string;
  publicationYear: number;
  doi?: string;
  impact?: number;
  link?: string;
  documentUrl?: string;
  citationCount: number;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyFDP {
  id: string;
  facultyId: string;
  programName: string;
  organizingInstitute: string;
  startDate: Date;
  endDate: Date;
  duration: number;
  certificateUrl?: string;
  certificateNumber?: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  fieldOfStudy: string;
  certificateIssued: boolean;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultySeminar {
  id: string;
  facultyId: string;
  seminarTitle: string;
  organizingBody: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  role: 'ORGANIZER' | 'SPEAKER' | 'CHAIR' | 'PARTICIPANT' | 'INVITED_GUEST';
  description?: string;
  certificateUrl?: string;
  certificateNumber?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyPhd {
  id: string;
  facultyId: string;
  studentName: string;
  enrollmentNumber: string;
  researchTopic: string;
  supervisorName: string;
  coDoctorName?: string;
  enrollmentDate: Date;
  expectedCompletionDate: Date;
  actualCompletionDate?: Date;
  status: 'ENROLLED' | 'PROGRESS' | 'THESIS_SUBMITTED' | 'VIVA_SCHEDULED' | 'COMPLETED' | 'WITHDRAWN';
  progressPercentage: number;
  preSubmissionDone: boolean;
  viva1Date?: Date;
  viva2Date?: Date;
  finalThesisUrl?: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultySkill {
  id: string;
  facultyId: string;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT' | 'MASTER';
  yearsOfExperience?: number;
  certificateUrl?: string;
  endorsements: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FacultyEvidence {
  id: string;
  facultyId: string;
  title: string;
  description?: string;
  evidenceType: 'AWARD' | 'PATENT' | 'RESEARCH_GRANT' | 'CERTIFICATION' | 'LICENSE' | 'RECOGNITION' | 'ACHIEVEMENT' | 'OTHER';
  documentUrl?: string;
  imageUrl?: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationNumber?: string;
  issuingAuthority?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type EmploymentStatus = 'FULL_TIME' | 'PART_TIME' | 'ADJUNCT' | 'VISITING';
export type TenureStatus = 'TENURED' | 'TENURE_TRACK' | 'NON_TENURE_TRACK';

// Request/Response Types

export interface CreateQualificationRequest {
  degreeType: string;
  specialization: string;
  university: string;
  yearOfPassing: number;
  gradePercentage?: number;
  certificateUrl?: string;
}

export interface CreatePublicationRequest {
  title: string;
  authors: string[];
  publicationType: string;
  journalName?: string;
  journalVolume?: string;
  journalIssue?: string;
  pageNumbers?: string;
  publicationYear: number;
  doi?: string;
  impact?: number;
  link?: string;
  documentUrl?: string;
}

export interface CreateFDPRequest {
  programName: string;
  organizingInstitute: string;
  startDate: Date;
  endDate: Date;
  level: string;
  fieldOfStudy: string;
  certificateUrl?: string;
  certificateNumber?: string;
}

export interface CreateSeminarRequest {
  seminarTitle: string;
  organizingBody: string;
  venue: string;
  startDate: Date;
  endDate: Date;
  role: string;
  description?: string;
  certificateUrl?: string;
  certificateNumber?: string;
}

export interface CreatePhdRequest {
  studentName: string;
  enrollmentNumber: string;
  researchTopic: string;
  supervisorName: string;
  coDoctorName?: string;
  enrollmentDate: Date;
  expectedCompletionDate: Date;
}

export interface UpdatePhdRequest {
  status?: string;
  progressPercentage?: number;
  preSubmissionDone?: boolean;
  viva1Date?: Date;
  viva2Date?: Date;
  finalThesisUrl?: string;
}

export interface CreateSkillRequest {
  skillName: string;
  skillCategory: string;
  proficiencyLevel: string;
  yearsOfExperience?: number;
  certificateUrl?: string;
}

export interface CreateEvidenceRequest {
  title: string;
  description?: string;
  evidenceType: string;
  documentUrl?: string;
  imageUrl?: string;
  issueDate: Date;
  expiryDate?: Date;
  verificationNumber?: string;
  issuingAuthority?: string;
}

export interface FacultyDashboardResponse {
  profile: FacultyProfile;
  qualifications: FacultyQualification[];
  publications: FacultyPublication[];
  fdpPrograms: FacultyFDP[];
  seminars: FacultySeminar[];
  phdCandidates: FacultyPhd[];
  skills: FacultySkill[];
  evidence: FacultyEvidence[];
  stats: {
    totalPublications: number;
    totalFDPPrograms: number;
    totalSeminars: number;
    totalPhdCandidates: number;
    completedPhds: number;
    totalSkills: number;
    totalEvidenceItems: number;
  };
}
