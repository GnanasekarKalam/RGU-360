// src/types/student-master.types.ts
// Student Master Module Types and Interfaces

export interface StudentProfile {
  id: string;
  userId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date;
  gender?: string;
  degreeProgram: string;
  majorId: string;
  minorId?: string;
  concentrationId?: string;
  enrollmentStatus: string;
  enrollmentDate: Date;
  expectedGraduationDate?: Date;
  graduationDate?: Date;
  currentGpa?: number;
  cumulativeGpa?: number;
  academicStanding: string;
  creditsEarned: number;
  creditsRequired?: number;
  hasFinancialHold: boolean;
  primaryAdvisorId?: string;
  primaryAdvisorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentParent {
  id: string;
  studentId: string;
  parentName: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN' | 'UNCLE' | 'AUNT' | 'GRAND_FATHER' | 'GRAND_MOTHER';
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  profession?: string;
  organization?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  aadharNumber?: string;
  panNumber?: string;
  isEmergencyContact: boolean;
  isVerified: boolean;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentAcademicRecord {
  id: string;
  studentId: string;
  semester: string;
  academicYear: string;
  semesterGpa?: number;
  semesterCredits: number;
  creditsEarned: number;
  attemptedCredits: number;
  totalCreditsEarned: number;
  totalAttemptedCredits: number;
  cumulativeGpa?: number;
  academicStanding: string;
  notes?: string;
  recordVerifiedAt?: Date;
  recordVerifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentFee {
  id: string;
  studentId: string;
  semester: string;
  academicYear: string;
  feeCategory: 'TUITION' | 'HOSTEL' | 'TRANSPORTATION' | 'ACTIVITY' | 'LIBRARY' | 'LABORATORY' | 'OTHER';
  totalFeeAmount: number;
  dueDate: Date;
  paidAmount: number;
  balance: number;
  paymentStatus: 'PENDING' | 'PARTIAL_PAID' | 'PAID' | 'OVERDUE' | 'WAIVED';
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  installments: number;
  installmentsPaid: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentTutorWard {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName?: string;
  tutorEmail?: string;
  assignmentDate: Date;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TERMINATED' | 'PAUSED';
  assignmentReason?: string;
  mentorshipPlan?: string;
  frequencyOfMeeting?: number;
  lastMeetingDate?: Date;
  nextMeetingDate?: Date;
  performanceNotes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types

export interface CreateParentRequest {
  parentName: string;
  relationship: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  profession?: string;
  organization?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  aadharNumber?: string;
  panNumber?: string;
  isEmergencyContact?: boolean;
}

export interface UpdateParentRequest {
  parentName?: string;
  email?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  profession?: string;
  organization?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface CreateAcademicRecordRequest {
  semester: string;
  academicYear: string;
  semesterGpa?: number;
  semesterCredits: number;
  creditsEarned: number;
  attemptedCredits: number;
  academicStanding?: string;
  notes?: string;
}

export interface CreateFeeRequest {
  semester: string;
  academicYear: string;
  feeCategory: string;
  totalFeeAmount: number;
  dueDate: Date;
  installments?: number;
}

export interface RecordFeePaymentRequest {
  paidAmount: number;
  paymentDate: Date;
  transactionId?: string;
  remarks?: string;
}

export interface AssignTutorWardRequest {
  tutorId: string;
  startDate: Date;
  assignmentReason?: string;
  mentorshipPlan?: string;
  frequencyOfMeeting?: number;
}

export interface UpdateTutorWardRequest {
  status?: string;
  performanceNotes?: string;
  nextMeetingDate?: Date;
}

export interface StudentDashboardResponse {
  profile: StudentProfile;
  parents: StudentParent[];
  academicRecords: StudentAcademicRecord[];
  fees: StudentFee[];
  tutorWard?: StudentTutorWard;
  stats: {
    totalParents: number;
    currentGpa: number;
    creditsEarned: number;
    creditsRequired: number;
    totalFeesDue: number;
    totalFeesPaid: number;
    pendingFees: number;
    academicStanding: string;
    tutorAssigned: boolean;
  };
}

export interface StudentFeeSummary {
  studentId: string;
  semester: string;
  academicYear: string;
  totalFeesDue: number;
  totalFeesPaid: number;
  remainingBalance: number;
  categories: StudentFee[];
}
