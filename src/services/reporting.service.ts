// src/services/reporting.service.ts
// Comprehensive Reporting Engine - Core service layer

import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

const prisma = new PrismaClient();

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ReportFilters {
  academicYear?: string;
  departmentId?: string;
  facultyId?: string;
  studentId?: string;
  startDate?: Date;
  endDate?: Date;
  includeInactive?: boolean;
  semester?: string;
  status?: string;
}

interface APIScoreBreakdown {
  teaching: number;
  research: number;
  development: number;
  contribution: number;
  total: number;
  category: string;
}

interface ReportData {
  metadata: {
    reportType: string;
    generatedAt: Date;
    generatedBy: string;
    academicYear?: string;
    department?: string;
    filtersCriteria?: ReportFilters;
  };
  data: any[];
  summary?: Record<string, any>;
  charts?: Record<string, any>;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Mask sensitive data for non-authorized users
 */
function maskSensitiveData(value: string, type: 'aadhaar' | 'pan' | 'phone' | 'email'): string {
  if (!value) return '';
  
  switch (type) {
    case 'aadhaar':
      // Show only last 4 digits: XXXX-XXXX-1234
      return `XXXX-XXXX-${value.slice(-4)}`;
    case 'pan':
      // Show only last 4: XXXXX2ABCD
      return `XXXXX${value.slice(-4)}`;
    case 'phone':
      // Show only last 4: XXXXXX7890
      return `XXXXXX${value.slice(-4)}`;
    case 'email':
      // Show first char and domain: j***@example.com
      return `${value[0]}***@${value.split('@')[1]}`;
    default:
      return value;
  }
}

/**
 * Calculate API Score for faculty
 */
function calculateAPIScore(faculty: any): APIScoreBreakdown {
  let teaching = 0;
  let research = 0;
  let development = 0;
  let contribution = 0;

  // Teaching (40 points max)
  teaching += Math.min((faculty.teachingHours || 0) / 20, 20); // Max 20 points for workload
  teaching += Math.min((faculty.studentFeedbackScore || 0) * 0.2, 20); // Max 20 points for feedback

  // Research (30 points max)
  const publicationCount = (faculty.publications || []).length;
  research += Math.min(publicationCount * 5, 15); // Max 15 points for publications
  research += Math.min((faculty.phdCandidates || []).length * 3, 15); // Max 15 points for PhD guidance

  // Development (20 points max)
  const fdpCount = (faculty.fdpPrograms || []).length;
  const seminarCount = (faculty.seminars || []).length;
  development += Math.min(fdpCount * 3, 10); // Max 10 points for FDP
  development += Math.min(seminarCount * 2, 10); // Max 10 points for seminars

  // Contribution (10 points max)
  contribution += Math.min((faculty.taskCompletionRate || 0) / 10, 5); // Max 5 points for tasks
  contribution += Math.min((faculty.mentorshipCount || 0) * 1, 5); // Max 5 points for mentoring

  const total = teaching + research + development + contribution;

  let category = 'Average';
  if (total >= 90) category = 'Excellent';
  else if (total >= 75) category = 'Very Good';
  else if (total >= 60) category = 'Good';
  else if (total >= 45) category = 'Below Average';

  return { teaching, research, development, contribution, total, category };
}

/**
 * Check student risk level
 */
function getStudentRiskLevel(student: any): string {
  let riskScore = 0;

  if ((student.currentGpa || 0) < 5.5) riskScore += 30;
  if ((student.attendance || 100) < 70) riskScore += 30;
  if (student.arrears && student.arrears.length > 0) riskScore += 25;
  if (student.feeStatus === 'OVERDUE') riskScore += 15;

  if (riskScore >= 60) return 'HIGH';
  if (riskScore >= 30) return 'MEDIUM';
  return 'LOW';
}

// ============================================================================
// FACULTY REPORTS
// ============================================================================

/**
 * Faculty Master Report - List of all faculty with basic details
 */
export async function generateFacultyMasterReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const faculties = await prisma.faculty.findMany({
      where: {
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.includeInactive !== true && { isActive: true }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            dateOfBirth: true,
          },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        qualifications: true,
        publications: true,
        fdpPrograms: true,
        seminars: true,
        tutorWards: true,
      },
      orderBy: { user: { firstName: 'asc' } },
    });

    const data = faculties.map(f => ({
      facultyId: f.id,
      employeeId: f.employeeId,
      name: `${f.user.firstName} ${f.user.lastName}`,
      email: f.user.email,
      phone: f.user.mobileNumber,
      department: f.department.name,
      specialization: f.specialization,
      academicDegree: f.academicDegree,
      employmentStatus: f.employmentStatus,
      tenureStatus: f.tenureStatus,
      publications: f.publications.length,
      fdpPrograms: f.fdpPrograms.length,
      seminars: f.seminars.length,
      mentorshipCount: f.tutorWards.length,
      hireDate: f.hireDate,
      isActive: f.isActive,
    }));

    return {
      metadata: {
        reportType: 'FACULTY_MASTER',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalFaculty: data.length,
        activeCount: data.filter(d => d.isActive).length,
        departmentCount: [...new Set(data.map(d => d.department))].length,
        totalPublications: data.reduce((sum, d) => sum + d.publications, 0),
      },
    };
  } catch (error) {
    console.error('Error generating Faculty Master Report:', error);
    throw error;
  }
}

/**
 * Faculty API Score Report - Detailed API calculation for all faculty
 */
export async function generateFacultyAPIScoreReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const faculties = await prisma.faculty.findMany({
      where: {
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.includeInactive !== true && { isActive: true }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        department: true,
        publications: true,
        fdpPrograms: true,
        seminars: true,
        phdCandidates: true,
        tutorWards: true,
        createdTasks: true,
        apiScores: {
          where: {
            academicYear: filters.academicYear || new Date().getFullYear().toString(),
          },
        },
      },
    });

    const data = faculties.map(f => {
      const apiScore = calculateAPIScore({
        publications: f.publications,
        fdpPrograms: f.fdpPrograms,
        seminars: f.seminars,
        phdCandidates: f.phdCandidates,
        mentorshipCount: f.tutorWards.length,
        taskCompletionRate: ((f.createdTasks || []).length / 100) * 100,
        teachingHours: 25,
        studentFeedbackScore: 4.5,
      });

      return {
        facultyId: f.id,
        name: `${f.user.firstName} ${f.user.lastName}`,
        email: f.user.email,
        department: f.department.name,
        qualification: f.academicDegree,
        phdStatus: f.phdCandidates.length > 0 ? 'Guide' : 'N/A',
        teachingScore: apiScore.teaching.toFixed(2),
        researchScore: apiScore.research.toFixed(2),
        developmentScore: apiScore.development.toFixed(2),
        contributionScore: apiScore.contribution.toFixed(2),
        totalAPIScore: apiScore.total.toFixed(2),
        apiCategory: apiScore.category,
        publications: f.publications.length,
        fdpPrograms: f.fdpPrograms.length,
        seminars: f.seminars.length,
        phdStudents: f.phdCandidates.length,
        mentorships: f.tutorWards.length,
      };
    });

    return {
      metadata: {
        reportType: 'FACULTY_API_SCORE',
        generatedAt: new Date(),
        generatedBy: 'system',
        academicYear: filters.academicYear,
        filtersCriteria: filters,
      },
      data: data.sort((a, b) => parseFloat(b.totalAPIScore) - parseFloat(a.totalAPIScore)),
      summary: {
        totalFaculty: data.length,
        avgAPIScore: (data.reduce((sum, d) => sum + parseFloat(d.totalAPIScore), 0) / data.length).toFixed(2),
        excellentCount: data.filter(d => d.apiCategory === 'Excellent').length,
        veryGoodCount: data.filter(d => d.apiCategory === 'Very Good').length,
        goodCount: data.filter(d => d.apiCategory === 'Good').length,
      },
    };
  } catch (error) {
    console.error('Error generating Faculty API Score Report:', error);
    throw error;
  }
}

/**
 * Faculty Publication Report - All publications with details
 */
export async function generateFacultyPublicationReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const publications = await prisma.facultyPublication.findMany({
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
      },
      orderBy: { publicationYear: 'desc' },
    });

    const filtered = publications.filter(p => {
      if (filters.departmentId && p.faculty.departmentId !== filters.departmentId) return false;
      if (filters.facultyId && p.facultyId !== filters.facultyId) return false;
      if (filters.startDate && new Date(p.publicationYear, 0) < filters.startDate) return false;
      return true;
    });

    const data = filtered.map(p => ({
      facultyId: p.facultyId,
      facultyName: `${p.faculty.user.firstName} ${p.faculty.user.lastName}`,
      department: p.faculty.department.name,
      publicationTitle: p.title,
      publicationType: p.publicationType,
      journalName: p.journalName || 'N/A',
      volume: p.journalVolume || 'N/A',
      issue: p.journalIssue || 'N/A',
      pages: p.pageNumbers || 'N/A',
      publicationYear: p.publicationYear,
      doi: p.doi || 'N/A',
      issn: p.issn || 'N/A',
      impactFactor: p.impactFactor || 0,
      citationCount: p.citationCount || 0,
      isVerified: p.isVerified ? 'Yes' : 'No',
    }));

    return {
      metadata: {
        reportType: 'FACULTY_PUBLICATION',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalPublications: data.length,
        byType: {
          JOURNAL: data.filter(d => d.publicationType === 'JOURNAL').length,
          CONFERENCE: data.filter(d => d.publicationType === 'CONFERENCE').length,
          BOOK: data.filter(d => d.publicationType === 'BOOK').length,
          BOOK_CHAPTER: data.filter(d => d.publicationType === 'BOOK_CHAPTER').length,
          PATENT: data.filter(d => d.publicationType === 'PATENT').length,
        },
        totalCitations: data.reduce((sum, d) => sum + d.citationCount, 0),
        verifiedCount: data.filter(d => d.isVerified === 'Yes').length,
      },
    };
  } catch (error) {
    console.error('Error generating Faculty Publication Report:', error);
    throw error;
  }
}

/**
 * Faculty FDP/Seminar Report - Development programs participation
 */
export async function generateFacultyFDPSeminarReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const fdpPrograms = await prisma.facultyFDP.findMany({
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    const seminars = await prisma.facultySeminar.findMany({
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    const fdpData = fdpPrograms
      .filter(f => !filters.departmentId || f.faculty.departmentId === filters.departmentId)
      .map(f => ({
        type: 'FDP',
        facultyName: `${f.faculty.user.firstName} ${f.faculty.user.lastName}`,
        department: f.faculty.department.name,
        programName: f.programName,
        organizingInstitute: f.organizingInstitute,
        startDate: f.startDate,
        endDate: f.endDate,
        duration: f.duration,
        level: f.level,
        fieldOfStudy: f.fieldOfStudy,
        certificateNumber: f.certificateNumber,
        isVerified: f.isVerified ? 'Yes' : 'No',
      }));

    const seminarData = seminars
      .filter(s => !filters.departmentId || s.faculty.departmentId === filters.departmentId)
      .map(s => ({
        type: 'Seminar',
        facultyName: `${s.faculty.user.firstName} ${s.faculty.user.lastName}`,
        department: s.faculty.department.name,
        eventName: s.seminarTitle,
        organizingBody: s.organizingBody,
        venue: s.venue,
        city: s.city,
        country: s.country,
        startDate: s.startDate,
        endDate: s.endDate,
        role: s.role,
        certificateNumber: s.certificateNumber,
        isVerified: s.isVerified ? 'Yes' : 'No',
      }));

    const data = [...fdpData, ...seminarData].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    return {
      metadata: {
        reportType: 'FACULTY_FDP_SEMINAR',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalPrograms: data.length,
        fdpCount: fdpData.length,
        seminarCount: seminarData.length,
        verifiedCount: data.filter(d => d.isVerified === 'Yes').length,
        byLevel: {
          BEGINNER: fdpData.filter(d => d.level === 'BEGINNER').length,
          INTERMEDIATE: fdpData.filter(d => d.level === 'INTERMEDIATE').length,
          ADVANCED: fdpData.filter(d => d.level === 'ADVANCED').length,
          EXPERT: fdpData.filter(d => d.level === 'EXPERT').length,
        },
      },
    };
  } catch (error) {
    console.error('Error generating Faculty FDP/Seminar Report:', error);
    throw error;
  }
}

/**
 * Faculty PhD Status Report - PhD guidance and supervision
 */
export async function generateFacultyPhDStatusReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const phdRecords = await prisma.facultyPhd.findMany({
      include: {
        faculty: {
          include: {
            user: true,
            department: true,
          },
        },
      },
    });

    const data = phdRecords
      .filter(p => !filters.departmentId || p.faculty.departmentId === filters.departmentId)
      .map(p => ({
        facultyId: p.facultyId,
        facultyName: `${p.faculty.user.firstName} ${p.faculty.user.lastName}`,
        department: p.faculty.department.name,
        studentName: p.phdStudentName,
        studentEmail: p.phdStudentEmail,
        researchTopic: p.researchTopic,
        enrollmentYear: p.enrollmentYear,
        status: p.status,
        expectedCompletionYear: p.expectedCompletionYear,
        completionYear: p.completionYear,
        publications: p.publicationsFromResearch || 0,
        isVerified: p.isVerified ? 'Yes' : 'No',
      }));

    return {
      metadata: {
        reportType: 'FACULTY_PHD_STATUS',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalGuidances: data.length,
        activeGuidances: data.filter(d => d.status === 'ONGOING').length,
        completedGuidances: data.filter(d => d.status === 'COMPLETED').length,
        totalPublications: data.reduce((sum, d) => sum + d.publications, 0),
        verifiedCount: data.filter(d => d.isVerified === 'Yes').length,
      },
    };
  } catch (error) {
    console.error('Error generating Faculty PhD Status Report:', error);
    throw error;
  }
}

/**
 * Faculty Task Completion Report - Task completion and status
 */
export async function generateFacultyTaskCompletionReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        createdById: filters.facultyId,
      },
      include: {
        createdBy: {
          include: {
            faculties: {
              include: {
                user: true,
                department: true,
              },
            },
          },
        },
        assignments: true,
        approvals: true,
        evidences: true,
      },
    });

    const data = tasks.map(t => ({
      taskId: t.id,
      taskTitle: t.title,
      taskType: t.taskType,
      priority: t.priority,
      status: t.status,
      createdDate: t.createdAt,
      dueDate: t.dueDate,
      completionDate: t.completionDate,
      assignmentCount: t.assignments.length,
      completedCount: t.assignments.filter(a => a.assignmentStatus === 'COMPLETED').length,
      overdueCount: t.assignments.filter(a => a.assignmentStatus === 'OVERDUE').length,
      pendingApprovals: t.approvals.filter(a => a.approvalStatus === 'PENDING').length,
      evidenceCount: t.evidences.length,
      progressPercentage: t.progressPercentage || 0,
      requiresApproval: t.requiresApproval ? 'Yes' : 'No',
      isEscalated: t.isEscalated ? 'Yes' : 'No',
    }));

    return {
      metadata: {
        reportType: 'FACULTY_TASK_COMPLETION',
        generatedAt: new Date(),
        generatedBy: 'system',
        academicYear: filters.academicYear,
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalTasks: data.length,
        completedTasks: data.filter(d => d.status === 'COMPLETED').length,
        completionRate: ((data.filter(d => d.status === 'COMPLETED').length / data.length) * 100).toFixed(2),
        overdueTasks: data.filter(d => d.overdueCount > 0).length,
        tasksRequiringApproval: data.filter(d => d.pendingApprovals > 0).length,
        avgProgressPercentage: (data.reduce((sum, d) => sum + d.progressPercentage, 0) / data.length).toFixed(2),
      },
    };
  } catch (error) {
    console.error('Error generating Faculty Task Completion Report:', error);
    throw error;
  }
}

// ============================================================================
// STUDENT REPORTS
// ============================================================================

/**
 * Student Master Report - List of all students with basic details
 */
export async function generateStudentMasterReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const students = await prisma.student.findMany({
      where: {
        ...(filters.includeInactive !== true && { enrollmentStatus: 'ENROLLED' }),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
            dateOfBirth: true,
          },
        },
        primaryAdvisor: true,
        parents: true,
      },
      orderBy: { studentId: 'asc' },
    });

    const data = students.map(s => ({
      studentId: s.studentId,
      name: `${s.user.firstName} ${s.user.lastName}`,
      email: s.user.email,
      phone: maskSensitiveData(s.user.mobileNumber || '', 'phone'),
      dateOfBirth: s.user.dateOfBirth,
      program: s.degreeProgram,
      currentGPA: (s.currentGpa || 0).toFixed(2),
      cumulativeGPA: (s.cumulativeGpa || 0).toFixed(2),
      academicStanding: s.academicStanding,
      enrollmentStatus: s.enrollmentStatus,
      creditsEarned: s.creditsEarned,
      primaryAdvisor: s.primaryAdvisor ? `${s.primaryAdvisor.user?.firstName} ${s.primaryAdvisor.user?.lastName}` : 'N/A',
      enrollmentDate: s.enrollmentDate,
      expectedGraduationDate: s.expectedGraduationDate,
      hasFinancialHold: s.hasFinancialHold ? 'Yes' : 'No',
    }));

    return {
      metadata: {
        reportType: 'STUDENT_MASTER',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalStudents: data.length,
        enrolledCount: data.filter(d => d.enrollmentStatus === 'ENROLLED').length,
        graduatedCount: data.filter(d => d.enrollmentStatus === 'GRADUATED').length,
        avgGPA: (data.reduce((sum, d) => sum + parseFloat(d.currentGPA), 0) / data.length).toFixed(2),
        onFinancialHold: data.filter(d => d.hasFinancialHold === 'Yes').length,
      },
    };
  } catch (error) {
    console.error('Error generating Student Master Report:', error);
    throw error;
  }
}

/**
 * Student Progress Report - Term-wise and cumulative performance
 */
export async function generateStudentProgressReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const students = await prisma.student.findMany({
      where: {
        ...(filters.studentId && { id: filters.studentId }),
      },
      include: {
        user: true,
        enrollments: {
          include: {
            class: {
              include: {
                course: true,
                semester: true,
              },
            },
          },
        },
        grades: {
          include: {
            enrollment: {
              include: {
                class: true,
              },
            },
          },
        },
        academicRecords: true,
        tutorWards: true,
        fees: true,
      },
    });

    const data = students.map(s => {
      const riskLevel = getStudentRiskLevel(s);
      const totalEnrollments = s.enrollments.length;
      const completedEnrollments = s.grades.length;

      return {
        studentId: s.studentId,
        name: `${s.user.firstName} ${s.user.lastName}`,
        email: s.user.email,
        program: s.degreeProgram,
        currentGPA: (s.currentGpa || 0).toFixed(2),
        cumulativeGPA: (s.cumulativeGpa || 0).toFixed(2),
        creditsEarned: s.creditsEarned,
        creditsRequired: s.creditsRequired,
        completionPercentage: s.creditsRequired ? ((s.creditsEarned / s.creditsRequired) * 100).toFixed(2) : '0',
        enrollments: totalEnrollments,
        graded: completedEnrollments,
        academicStanding: s.academicStanding,
        riskLevel,
        tutorName: s.tutorWards.length > 0 ? `${s.tutorWards[0].tutor?.user?.firstName}` : 'N/A',
        feeStatus: s.fees.length > 0 ? s.fees[0].paymentStatus : 'N/A',
        lastUpdated: s.updatedAt,
      };
    });

    return {
      metadata: {
        reportType: 'STUDENT_PROGRESS',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalStudents: data.length,
        highRiskCount: data.filter(d => d.riskLevel === 'HIGH').length,
        mediumRiskCount: data.filter(d => d.riskLevel === 'MEDIUM').length,
        lowRiskCount: data.filter(d => d.riskLevel === 'LOW').length,
        avgGPA: (data.reduce((sum, d) => sum + parseFloat(d.currentGPA), 0) / data.length).toFixed(2),
        avgCompletionPercentage: (data.reduce((sum, d) => sum + parseFloat(d.completionPercentage), 0) / data.length).toFixed(2),
      },
    };
  } catch (error) {
    console.error('Error generating Student Progress Report:', error);
    throw error;
  }
}

/**
 * Student Attendance Report
 */
export async function generateStudentAttendanceReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: true,
        enrollments: {
          include: {
            attendances: true,
            class: {
              include: {
                course: true,
                semester: true,
              },
            },
          },
        },
      },
    });

    const data = students.map(s => {
      const totalEnrollments = s.enrollments.length;
      const avgAttendance = totalEnrollments > 0
        ? (s.enrollments.reduce((sum, e) => {
            const attendancePercentage = e.attendances?.length > 0 
              ? (e.attendances.filter(a => a.status === 'PRESENT').length / e.attendances.length) * 100
              : 0;
            return sum + attendancePercentage;
          }, 0) / totalEnrollments)
        : 0;

      return {
        studentId: s.studentId,
        name: `${s.user.firstName} ${s.user.lastName}`,
        enrollments: totalEnrollments,
        averageAttendance: avgAttendance.toFixed(2),
        attendanceStatus: avgAttendance >= 75 ? 'Good' : avgAttendance >= 65 ? 'Warning' : 'Critical',
        riskLevel: avgAttendance < 70 ? 'HIGH' : 'LOW',
      };
    });

    return {
      metadata: {
        reportType: 'STUDENT_ATTENDANCE',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalStudents: data.length,
        goodAttendance: data.filter(d => d.attendanceStatus === 'Good').length,
        warningAttendance: data.filter(d => d.attendanceStatus === 'Warning').length,
        criticalAttendance: data.filter(d => d.attendanceStatus === 'Critical').length,
        avgAttendance: (data.reduce((sum, d) => sum + parseFloat(d.averageAttendance), 0) / data.length).toFixed(2),
      },
    };
  } catch (error) {
    console.error('Error generating Student Attendance Report:', error);
    throw error;
  }
}

/**
 * Student Fee Pending Report - Fee status and collection
 */
export async function generateStudentFeePendingReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const fees = await prisma.studentFee.findMany({
      where: {
        ...(filters.studentId && { studentId: filters.studentId }),
        paymentStatus: { in: ['PENDING', 'PARTIAL_PAID', 'OVERDUE'] },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    const data = fees.map(f => ({
      studentId: f.student.studentId,
      studentName: `${f.student.user.firstName} ${f.student.user.lastName}`,
      semester: f.semester,
      academicYear: f.academicYear,
      feeCategory: f.feeCategory,
      totalFeeAmount: f.totalFeeAmount,
      paidAmount: f.paidAmount,
      balanceAmount: f.totalFeeAmount - f.paidAmount,
      paymentStatus: f.paymentStatus,
      dueDate: f.dueDate,
      daysPending: Math.floor((new Date().getTime() - new Date(f.dueDate).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return {
      metadata: {
        reportType: 'STUDENT_FEE_PENDING',
        generatedAt: new Date(),
        generatedBy: 'system',
        filtersCriteria: filters,
      },
      data: data.sort((a, b) => b.daysPending - a.daysPending),
      summary: {
        totalPendingRecords: data.length,
        totalPendingAmount: data.reduce((sum, d) => sum + d.balanceAmount, 0).toFixed(2),
        overdueRecords: data.filter(d => d.daysPending > 0).length,
        totalOverdueAmount: data.filter(d => d.daysPending > 0)
          .reduce((sum, d) => sum + d.balanceAmount, 0).toFixed(2),
        partiallyPaid: data.filter(d => d.paymentStatus === 'PARTIAL_PAID').length,
        completePending: data.filter(d => d.paymentStatus === 'PENDING').length,
      },
    };
  } catch (error) {
    console.error('Error generating Student Fee Pending Report:', error);
    throw error;
  }
}

// ============================================================================
// ACCREDITATION REPORTS
// ============================================================================

/**
 * NBA Evidence Report - NBA accreditation evidence tracking
 */
export async function generateNBAEvidenceReport(filters: ReportFilters): Promise<ReportData> {
  try {
    const mappings = await prisma.accreditationCriteriaMapping.findMany({
      where: {
        accreditationCriteria: {
          accreditationBody: {
            name: 'NBA',
          },
        },
        ...(filters.academicYear && { academicYear: filters.academicYear }),
      },
      include: {
        accreditationCriteria: {
          include: {
            accreditationBody: true,
          },
        },
        evidences: {
          include: {
            submittedBy: true,
            verifiedBy: true,
          },
        },
      },
    });

    const data = mappings.map(m => ({
      criteriaCode: m.accreditationCriteria.criteriaCode,
      criteriaTitle: m.accreditationCriteria.criteriaTitle,
      mappingType: m.mappingType,
      requiredEvidence: m.accreditationCriteria.evidenceRequirements,
      uploadedCount: m.evidences.length,
      verifiedCount: m.evidences.filter(e => e.isVerified).length,
      pendingCount: m.evidences.filter(e => !e.isVerified).length,
      compliancePercentage: m.evidences.length > 0 
        ? ((m.evidences.filter(e => e.isVerified).length / m.evidences.length) * 100).toFixed(2)
        : '0',
      lastUpdated: m.evidences.length > 0 
        ? m.evidences[m.evidences.length - 1].createdAt
        : null,
    }));

    return {
      metadata: {
        reportType: 'ACCREDITATION_NBA',
        generatedAt: new Date(),
        generatedBy: 'system',
        academicYear: filters.academicYear,
        filtersCriteria: filters,
      },
      data,
      summary: {
        totalCriteria: data.length,
        totalEvidence: data.reduce((sum, d) => sum + d.uploadedCount, 0),
        verifiedEvidence: data.reduce((sum, d) => sum + d.verifiedCount, 0),
        pendingEvidence: data.reduce((sum, d) => sum + d.pendingCount, 0),
        overallCompliance: data.length > 0
          ? (data.reduce((sum, d) => sum + parseFloat(d.compliancePercentage), 0) / data.length).toFixed(2)
          : '0',
      },
    };
  } catch (error) {
    console.error('Error generating NBA Evidence Report:', error);
    throw error;
  }
}

// ============================================================================
// Export all report functions
// ============================================================================

export const ReportingService = {
  // Faculty Reports
  generateFacultyMasterReport,
  generateFacultyAPIScoreReport,
  generateFacultyPublicationReport,
  generateFacultyFDPSeminarReport,
  generateFacultyPhDStatusReport,
  generateFacultyTaskCompletionReport,

  // Student Reports
  generateStudentMasterReport,
  generateStudentProgressReport,
  generateStudentAttendanceReport,
  generateStudentFeePendingReport,

  // Accreditation Reports (NBA as sample)
  generateNBAEvidenceReport,

  // Utility functions
  maskSensitiveData,
  calculateAPIScore,
  getStudentRiskLevel,
};

export default ReportingService;
