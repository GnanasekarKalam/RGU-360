// src/types/reports.types.ts
// Report Type Definitions for Mathematics Dashboard

// ============================================================================
// REPORT ENUMS
// ============================================================================

export enum ReportType {
  FACULTY_API_SCORE = 'faculty_api_score',
  STUDENT_PROGRESS = 'student_progress',
  TUTOR_WARD = 'tutor_ward',
  DEPARTMENT = 'department',
  NBA_SAR = 'nba_sar',
  NAAC = 'naac',
  AICTE = 'aicte',
  EXCEL = 'excel',
  PDF = 'pdf'
}

export enum ExportFormat {
  EXCEL = 'excel',
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json'
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// ============================================================================
// COMMON REPORT TYPES
// ============================================================================

export interface ReportBase {
  reportId: string;
  reportType: ReportType;
  generatedAt: Date;
  generatedBy: string;
  departmentId?: string;
  academicYear?: string;
  semester?: string;
  filters?: Record<string, any>;
}

export interface ReportMetadata {
  title: string;
  description: string;
  generatedDate: Date;
  generatedBy: string;
  department?: string;
  academicYear?: string;
  semester?: string;
  filtersCriteria?: string;
}

export interface ReportExportOptions {
  format: ExportFormat;
  includeCharts?: boolean;
  includeFootnotes?: boolean;
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  fileName?: string;
}

// ============================================================================
// FACULTY API SCORE REPORT
// ============================================================================

export interface FacultyPerformanceMetric {
  metricName: string;
  score: number;
  maxScore: number;
  weight: number;
  percentageScore: number;
}

export interface FacultyAPIScoreData extends ReportBase {
  reportType: ReportType.FACULTY_API_SCORE;
  faculty: {
    id: string;
    name: string;
    employeeId: string;
    department: string;
    specialization: string;
    designation: string;
  };
  metrics: {
    publications: FacultyPerformanceMetric;
    researchProjects: FacultyPerformanceMetric;
    fdhours: FacultyPerformanceMetric;
    phdStudents: FacultyPerformanceMetric;
    consultingWork: FacultyPerformanceMetric;
    teachingLoad: FacultyPerformanceMetric;
    accreditationContributions: FacultyPerformanceMetric;
  };
  overallAPIScore: number;
  apiGrade: 'A' | 'B' | 'C' | 'D' | 'E';
  trends: {
    previousYear: number;
    currentYear: number;
    growthPercentage: number;
  };
  recommendations: string[];
  auditTrail: {
    evaluatedBy: string;
    evaluationDate: Date;
    nextReviewDate: Date;
  };
}

// ============================================================================
// STUDENT PROGRESS REPORT
// ============================================================================

export interface StudentAcademicMetric {
  subject: string;
  courseCode: string;
  credits: number;
  grade: string;
  score: number;
}

export interface StudentProgressData extends ReportBase {
  reportType: ReportType.STUDENT_PROGRESS;
  student: {
    id: string;
    name: string;
    studentId: string;
    email: string;
    enrollmentStatus: string;
    expectedGraduationDate: Date;
  };
  academicMetrics: {
    currentSemesterGPA: number;
    cumulativeGPA: number;
    academicStanding: string;
    creditsEarned: number;
    creditsRequired: number;
    creditsRemaining: number;
    completionPercentage: number;
  };
  currentCourses: StudentAcademicMetric[];
  projectStatus: {
    projectTitle: string;
    supervisor: string;
    progressPercentage: number;
    submissionDate: Date;
    status: string;
  }[];
  placementStatus: {
    isPlaced: boolean;
    placedWith?: string;
    placementDate?: Date;
    salaryPackage?: number;
  };
  certifications: {
    name: string;
    issuedDate: Date;
    expiryDate?: Date;
  }[];
  researchWork: {
    title: string;
    status: string;
    contributionType: string;
  }[];
  assignmentSubmissions: {
    assignmentName: string;
    submissionDate: Date;
    scoreObtained: number;
    maxScore: number;
    status: string;
  }[];
  riskAssessment: {
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    riskFactors: string[];
    interventions: string[];
    recommendedActions: string[];
  };
  advisor: {
    name: string;
    email: string;
    lastInteractionDate: Date;
  };
}

// ============================================================================
// TUTOR WARD REPORT
// ============================================================================

export interface WardInfo {
  studentId: string;
  name: string;
  email: string;
  currentGPA: number;
  academicStanding: string;
  lastCheckDate: Date;
  needsIntervention: boolean;
  interventionReason?: string;
}

export interface TutorWardData extends ReportBase {
  reportType: ReportType.TUTOR_WARD;
  tutor: {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    department: string;
  };
  academicYear: string;
  wardCount: number;
  wards: WardInfo[];
  wardsSummary: {
    excellentStanding: number;
    goodStanding: number;
    warningStanding: number;
    probationStanding: number;
    needingIntervention: number;
  };
  interventionSummary: {
    academicSupport: string[];
    mentoring: string[];
    counseling: string[];
  };
  lastReviewDate: Date;
  nextReviewDate: Date;
}

// ============================================================================
// DEPARTMENT REPORT
// ============================================================================

export interface DepartmentMetrics {
  totalFaculty: number;
  activeFaculty: number;
  totalStudents: number;
  enrolledStudents: number;
  totalCourses: number;
  averageFacultyScore: number;
  averageStudentGPA: number;
  placementRate: number;
}

export interface DepartmentReportData extends ReportBase {
  reportType: ReportType.DEPARTMENT;
  department: {
    id: string;
    name: string;
    code: string;
    headOfDepartment: string;
    totalBudget: number;
  };
  metrics: DepartmentMetrics;
  facultyAnalysis: {
    totalFaculty: number;
    highPerformers: string[];
    developmentNeeded: string[];
    averageAPIScore: number;
  };
  studentAnalysis: {
    totalStudents: number;
    byAcademicStanding: Record<string, number>;
    averageGPA: number;
    studentsAtRisk: number;
  };
  performanceMetrics: {
    researchPublications: number;
    phdsProduced: number;
    studentPlacements: number;
    accreditationCompliance: number;
  };
  financialMetrics: {
    budgetUtilization: number;
    costPerStudent: number;
    researchFunding: number;
  };
  trends: {
    enrollmentTrend: number[];
    placementTrend: number[];
    academicPerformanceTrend: number[];
  };
}

// ============================================================================
// ACCREDITATION REPORTS (NBA, NAAC, AICTE)
// ============================================================================

export interface AccreditationCriterion {
  criteriaId: string;
  criteriaName: string;
  description: string;
  complianceStatus: 'COMPLIANT' | 'PARTIALLY_COMPLIANT' | 'NON_COMPLIANT' | 'PENDING';
  evidenceSubmitted: number;
  requiredEvidence: number;
  completionPercentage: number;
  documents: {
    fileName: string;
    uploadDate: Date;
    verificationStatus: string;
  }[];
  remarks: string;
}

export interface NBAReportData extends ReportBase {
  reportType: ReportType.NBA_SAR;
  accreditationType: 'NBA';
  institution: {
    name: string;
    code: string;
  };
  program: {
    name: string;
    courseCode: string;
    level: 'UG' | 'PG';
  };
  accreditationCycle: {
    startDate: Date;
    endDate: Date;
    status: string;
  };
  criteria: AccreditationCriterion[];
  overallCompliance: number;
  criticalGaps: string[];
  actionPlan: {
    action: string;
    targetDate: Date;
    responsibility: string;
  }[];
  evidenceSummary: {
    totalDocumentsSubmitted: number;
    documentsVerified: number;
    documentsRejected: number;
    pendingDocuments: number;
  };
  recommendations: string[];
}

export interface NAACReportData extends ReportBase {
  reportType: ReportType.NAAC;
  institution: {
    name: string;
    code: string;
    accreditationStatus: string;
  };
  criteriaWiseAnalysis: {
    criteria: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
  strengthsAnalysis: string[];
  areasForImprovement: string[];
  cumulativeScore: number;
  grade: 'A++' | 'A+' | 'A' | 'B++' | 'B+' | 'B' | 'C';
  recommendations: string[];
  implementationPlan: {
    suggestion: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    implementationDate: Date;
  }[];
}

export interface AICTEReportData extends ReportBase {
  reportType: ReportType.AICTE;
  institution: {
    name: string;
    code: string;
    approvalStatus: string;
  };
  complianceChecks: {
    checkPoint: string;
    requirement: string;
    status: 'COMPLIANT' | 'NON_COMPLIANT' | 'IN_PROGRESS';
    remarks: string;
  }[];
  facultyCompliance: {
    requiredFaculty: number;
    currentFaculty: number;
    qualifications: string[];
    deficiencies: string[];
  };
  infrastructureCompliance: {
    laboratories: number;
    computerLabs: number;
    libraryBooks: number;
    journals: number;
    status: string;
  };
  academicCompliance: {
    curricula: string;
    pedagogy: string;
    assessment: string;
  };
  actionItems: {
    item: string;
    dueDate: Date;
    owner: string;
  }[];
  certificationStatus: string;
  nextAuditDate: Date;
}

export type AccreditationReport = NBAReportData | NAACReportData | AICTEReportData;

// ============================================================================
// REPORT GENERATION REQUEST
// ============================================================================

export interface ReportGenerationRequest {
  reportType: ReportType;
  exportFormat: ExportFormat;
  filters?: {
    departmentId?: string;
    facultyId?: string;
    studentId?: string;
    academicYear?: string;
    semester?: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
  options?: ReportExportOptions;
}

export interface ReportGenerationResponse {
  success: boolean;
  reportId: string;
  status: ReportStatus;
  generatedAt: Date;
  fileSize: number;
  downloadUrl: string;
  expiresAt: Date;
  fileName: string;
}

export interface ReportHistory {
  reportId: string;
  reportType: ReportType;
  exportFormat: ExportFormat;
  generatedAt: Date;
  generatedBy: string;
  downloadUrl: string;
  status: ReportStatus;
  expiresAt: Date;
}

// ============================================================================
// BATCH REPORT GENERATION
// ============================================================================

export interface BatchReportRequest {
  reportTypes: ReportType[];
  exportFormat: ExportFormat;
  recipientEmail?: string;
  schedule?: {
    frequency: 'ONCE' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
    time: string; // HH:mm format
    dayOfWeek?: number; // For weekly
    dayOfMonth?: number; // For monthly
  };
}

export interface BatchReportResponse {
  batchId: string;
  requestedReports: number;
  completedReports: number;
  failedReports: number;
  status: ReportStatus;
  estimatedCompletionTime: Date;
}
