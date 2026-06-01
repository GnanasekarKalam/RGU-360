// src/types/dashboard.types.ts
// Dashboard Module Type Definitions

// ============================================================================
// HOD DASHBOARD TYPES
// ============================================================================

export interface FacultyPerformance {
  facultyId: string;
  name: string;
  email: string;
  department: string;
  tasksCompleted: number;
  tasksOverdue: number;
  completionRate: number;
  approvalRate: number;
  researchOutput: number;
  publications: number;
  phdAdvisees: number;
  performanceScore: number;
  status: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT';
}

export interface StudentPerformance {
  studentId: string;
  name: string;
  enrollmentId: string;
  semester: number;
  cgpa: number;
  attendancePercentage: number;
  assignmentCompletionRate: number;
  examScore: number;
  projectStatus: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mentor: string;
}

export interface ResearchMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  ongoingPublications: number;
  completedPublications: number;
  fundingAmount: number;
  researchersInvolved: number;
  topicAreas: string[];
}

export interface FDPMetrics {
  totalFDP: number;
  completedFDP: number;
  upcomingFDP: number;
  attendanceRate: number;
  facultyParticipation: number;
  internalFDP: number;
  externalFDP: number;
  certificateIssuedCount: number;
}

export interface PublicationMetrics {
  totalPublications: number;
  nationalJournals: number;
  internationalJournals: number;
  conferences: number;
  books: number;
  patents: number;
  citationCount: number;
  h_index: number;
  topAuthors: FacultyWithPublications[];
}

export interface FacultyWithPublications {
  facultyName: string;
  publicationCount: number;
  citationCount: number;
}

export interface PhDStatus {
  totalPhDStudents: number;
  registered: number;
  courseworkCompleted: number;
  comprehensiveExamDone: number;
  ongoingResearch: number;
  thesisSubmitted: number;
  graduated: number;
  advisorName: string;
}

export interface FeeCollectionStats {
  totalStudents: number;
  feePaid: number;
  feePending: number;
  feeDue: number;
  collectionPercentage: number;
  totalCollected: number;
  totalOutstanding: number;
  paidOnTime: number;
  paymentTrend: DailyPayment[];
}

export interface DailyPayment {
  date: string;
  amount: number;
  count: number;
}

export interface TaskCompletionStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  inProgressTasks: number;
  completionRate: number;
  averageCompletionDays: number;
  tasksByPriority: TasksByPriority;
}

export interface TasksByPriority {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  URGENT: number;
}

export interface PendingApprovals {
  totalPending: number;
  byApprover: ApprovalByApprover[];
  byStatus: PendingByStatus;
  averageWaitingDays: number;
}

export interface ApprovalByApprover {
  approverName: string;
  pendingCount: number;
  averageTime: number;
}

export interface PendingByStatus {
  PENDING: number;
  IN_REVIEW: number;
  NEEDS_CLARIFICATION: number;
}

export interface RiskStudents {
  totalRiskStudents: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  riskFactors: RiskStudent[];
}

export interface RiskStudent {
  studentId: string;
  name: string;
  enrollmentId: string;
  riskLevel: string;
  riskReasons: string[];
  cgpa: number;
  attendance: number;
  lastCommunicated: Date;
  interventionPlan?: string;
}

export interface HODDashboardData {
  facultyPerformance: FacultyPerformance[];
  studentPerformance: StudentPerformance[];
  researchMetrics: ResearchMetrics;
  fdpMetrics: FDPMetrics;
  publicationMetrics: PublicationMetrics;
  phdStatus: PhDStatus[];
  feeCollection: FeeCollectionStats;
  taskCompletion: TaskCompletionStats;
  pendingApprovals: PendingApprovals;
  riskStudents: RiskStudents;
  lastUpdated: Date;
}

// ============================================================================
// MANAGEMENT DASHBOARD TYPES
// ============================================================================

export interface DepartmentKPIs {
  departmentId: string;
  departmentName: string;
  facultyCount: number;
  studentCount: number;
  avgFacultyPerformance: number;
  avgStudentCGPA: number;
  researchProjectsCount: number;
  publicationsCount: number;
  phdGraduatesCount: number;
  placementRate: number;
  allotmentAmount: number;
  utilizationPercentage: number;
}

export interface RankingMetrics {
  nirf_ranking?: number;
  nirf_category: string;
  worldRanking?: number;
  nationalRanking?: number;
  stateRanking?: number;
  researchScore: number;
  teachingScore: number;
  outreachScore: number;
  infrastructureScore: number;
  innovationScore: number;
}

export interface AccreditationReadiness {
  accreditationType: string;
  currentStatus: string;
  completionPercentage: number;
  criteriaCompleted: number;
  criteriaTotal: number;
  evidenceSubmitted: number;
  evidenceVerified: number;
  missingItems: number;
  daysUntilSubmission: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface FacultyProductivity {
  averagePublicationsPerYear: number;
  averageResearchProjectsPerFaculty: number;
  averageFDPAttendancePercentage: number;
  phdAdvisorsCount: number;
  totalPhDStudentsAdvisedPerFaculty: number;
  industryCollaborations: number;
  consultancyProjects: number;
  totalConsultancyRevenue: number;
  topProductiveFaculty: FacultyWithMetrics[];
}

export interface FacultyWithMetrics {
  facultyName: string;
  publications: number;
  researchProjects: number;
  phdStudents: number;
  consultancy: number;
}

export interface StudentProgression {
  totalStudents: number;
  byYear: StudentsByYear[];
  placementRate: number;
  avgPlacementPackage: number;
  highestPackage: number;
  lowestPackage: number;
  companiesVisited: number;
  graduateStudies: number;
  entrepreneurship: number;
  avgCGPA: number;
  topperCGPA: number;
}

export interface StudentsByYear {
  year: number;
  totalEnrolled: number;
  passed: number;
  failed: number;
  passPercentage: number;
}

export interface ManagementDashboardData {
  departmentKPIs: DepartmentKPIs[];
  rankingMetrics: RankingMetrics;
  accreditations: AccreditationReadiness[];
  facultyProductivity: FacultyProductivity;
  studentProgression: StudentProgression;
  lastUpdated: Date;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface DashboardFilters {
  departmentId?: string;
  academicYear?: string;
  semester?: number;
  dateRange?: [Date, Date];
}
