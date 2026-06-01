// src/types/accreditation.types.ts
// Accreditation Module Type Definitions

/**
 * Accreditation Body Types
 */
export type AccreditationBodyType = 'NBA' | 'NAAC' | 'UGC' | 'AICTE' | 'IQAC';

export interface AccreditationBody {
  id: string;
  name: AccreditationBodyType;
  fullName: string;
  description?: string;
  websiteUrl?: string;
  criteria?: AccreditationCriteria[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Accreditation Criteria
 */
export interface AccreditationCriteria {
  id: string;
  bodyId: string;
  body: AccreditationBody;
  criteriaCode: string; // e.g., "NBA-1.1", "NAAC-2.3"
  criteriaTitle: string;
  description?: string;
  evidenceRequirements?: string;
  mappings: AccreditationCriteriaMapping[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Academic Year Mapping
 */
export interface AccreditationAcademicYear {
  id: string;
  academicYear: string; // e.g., "2025-2026"
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  mappings: AccreditationCriteriaMapping[];
  createdAt: Date;
}

/**
 * Criteria to Faculty/Student/Academic Year Mapping
 */
export interface AccreditationCriteriaMapping {
  id: string;
  criteriaId: string;
  criteria: AccreditationCriteria;
  academicYearId?: string;
  academicYear?: AccreditationAcademicYear;
  facultyId?: string;
  faculty?: any; // Reference to Faculty master
  studentId?: string;
  student?: any; // Reference to Student master
  departmentId?: string;
  mappingType: 'FACULTY' | 'STUDENT' | 'DEPARTMENT' | 'PROGRAM';
  description?: string;
  evidences: AccreditationEvidence[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Evidence Submission
 */
export interface AccreditationEvidence {
  id: string;
  mappingId: string;
  mapping: AccreditationCriteriaMapping;
  title: string;
  description?: string;
  evidenceType: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'DATA';
  fileUrl?: string;
  externalLink?: string;
  documentType?: string; // e.g., "Syllabus", "Assessment", "Feedback"
  submittedByUserId: string;
  submittedBy: any; // Reference to User
  isVerified: boolean;
  verifiedByUserId?: string;
  verifier?: any; // Reference to User
  verificationComments?: string;
  uploadedAt: Date;
  verifiedAt?: Date;
  academicYear?: string;
}

/**
 * Faculty Mapping
 */
export interface AccreditationFacultyMapping {
  id: string;
  facultyId: string;
  faculty?: any;
  academicYear: string;
  assignedCriteria: string[]; // Array of criteria codes
  mappingStatus: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  compliancePercentage: number;
  evidenceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Student Mapping
 */
export interface AccreditationStudentMapping {
  id: string;
  studentId: string;
  student?: any;
  academicYear: string;
  program: string;
  assignedCriteria: string[];
  mappingStatus: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  compliancePercentage: number;
  evidenceCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Accreditation Report
 */
export interface AccreditationReport {
  id: string;
  reportName: string;
  bodyType: AccreditationBodyType;
  academicYear: string;
  generatedByUserId: string;
  generatedAt: Date;
  reportFormat: 'PDF' | 'EXCEL' | 'JSON';
  fileUrl?: string;
  totalCriteria: number;
  mappedCriteria: number;
  evidenceCount: number;
  complianceRate: number;
  status: 'DRAFT' | 'GENERATED' | 'APPROVED' | 'SUBMITTED';
  remarks?: string;
}

/**
 * Missing Evidence Alert
 */
export interface AccreditationAlert {
  id: string;
  mappingId: string;
  mapping: AccreditationCriteriaMapping;
  alertType: 'MISSING_EVIDENCE' | 'PENDING_VERIFICATION' | 'EXPIRED_EVIDENCE' | 'INCOMPLETE_MAPPING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ACKNOWLEDGED';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedByUserId?: string;
  resolutionNotes?: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateCriteriaMappingRequest {
  criteriaId: string;
  academicYearId?: string;
  facultyId?: string;
  studentId?: string;
  departmentId?: string;
  mappingType: 'FACULTY' | 'STUDENT' | 'DEPARTMENT' | 'PROGRAM';
  description?: string;
}

export interface SubmitEvidenceRequest {
  mappingId: string;
  title: string;
  description?: string;
  evidenceType: 'DOCUMENT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'DATA';
  fileUrl?: string;
  externalLink?: string;
  documentType?: string;
  academicYear?: string;
}

export interface VerifyEvidenceRequest {
  evidenceId: string;
  isVerified: boolean;
  verificationComments?: string;
}

export interface GenerateReportRequest {
  bodyType: AccreditationBodyType;
  academicYear: string;
  format: 'PDF' | 'EXCEL' | 'JSON';
  includeRemarks?: boolean;
}

export interface CreateAcademicYearRequest {
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface BulkFacultyMappingRequest {
  facultyIds: string[];
  criteriaIds: string[];
  academicYear: string;
}

export interface BulkStudentMappingRequest {
  studentIds: string[];
  criteriaIds: string[];
  academicYear: string;
  program: string;
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface AccreditationDashboardStats {
  totalBodies: number;
  activeBodies: number;
  totalCriteria: number;
  mappedCriteria: number;
  totalEvidence: number;
  verifiedEvidence: number;
  pendingVerification: number;
  complianceRate: number;
  activeAlerts: number;
  criticalAlerts: number;
  facultiesInvolved: number;
  studentsInvolved: number;
}

export interface AccreditationComplianceMetrics {
  bodyType: AccreditationBodyType;
  academicYear: string;
  totalCriteria: number;
  mappedCriteria: number;
  mappingPercentage: number;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  compliancePercentage: number;
  criteriaBreakdown: {
    [key: string]: {
      mapped: boolean;
      evidenceCount: number;
      verified: number;
      status: string;
    };
  };
}

export interface AlertSummary {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  byType: {
    [key in 'MISSING_EVIDENCE' | 'PENDING_VERIFICATION' | 'EXPIRED_EVIDENCE' | 'INCOMPLETE_MAPPING']: number;
  };
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface AccreditationFilters {
  bodyType?: AccreditationBodyType;
  academicYear?: string;
  mappingType?: 'FACULTY' | 'STUDENT' | 'DEPARTMENT' | 'PROGRAM';
  status?: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  verificationStatus?: 'VERIFIED' | 'PENDING' | 'ALL';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  fromDate?: Date;
  toDate?: Date;
}
