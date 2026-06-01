// src/services/dashboard.service.ts
// Dashboard Service - Data Aggregation from multiple modules

import { PrismaClient } from '@prisma/client';
import {
  HODDashboardData,
  ManagementDashboardData,
  FacultyPerformance,
  StudentPerformance,
  ResearchMetrics,
  FDPMetrics,
  PublicationMetrics,
  PhDStatus,
  FeeCollectionStats,
  TaskCompletionStats,
  PendingApprovals,
  RiskStudent,
  DepartmentKPIs,
  RankingMetrics,
  AccreditationReadiness,
  FacultyProductivity,
  StudentProgression,
} from '../types/dashboard.types';

const prisma = new PrismaClient();

// ============================================================================
// HOD DASHBOARD SERVICE FUNCTIONS
// ============================================================================

/**
 * Get comprehensive HOD Dashboard Data with all metrics and analytics
 */
export async function getHODDashboardData(
  hodUserId: string,
  departmentId?: string,
  academicYear?: string,
  filters?: any
): Promise<HODDashboardData> {
  try {
    // Get department from HOD's faculty record or use provided departmentId
    let deptId = departmentId;
    if (!deptId) {
      const hodFaculty = await prisma.faculty.findUnique({
        where: { facultyId: hodUserId },
        select: { departmentId: true },
      });
      deptId = hodFaculty?.departmentId || '';
    }

    // Parallel execution of all dashboard data fetching
    const [
      facultyPerformance,
      studentPerformance,
      researchMetrics,
      fdpMetrics,
      publicationMetrics,
      phdStatus,
      feeCollection,
      taskCompletion,
      pendingApprovals,
      riskStudents,
    ] = await Promise.all([
      getFacultyPerformanceMetrics(deptId),
      getStudentPerformanceMetrics(deptId, academicYear),
      getResearchMetrics(deptId),
      getFDPMetrics(deptId, academicYear),
      getPublicationMetrics(deptId),
      getPhDMetrics(deptId),
      getFeeCollectionStats(deptId, academicYear),
      getTaskCompletionStats(deptId),
      getPendingApprovalsStats(deptId),
      getRiskStudentsList(deptId),
    ]);

    return {
      facultyPerformance,
      studentPerformance,
      researchMetrics,
      fdpMetrics,
      publicationMetrics,
      phdStatus,
      feeCollection,
      taskCompletion,
      pendingApprovals,
      riskStudents,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching HOD dashboard data:', error);
    throw new Error('Failed to fetch dashboard data');
  }
}

/**
 * Get Faculty Performance metrics for a department
 */
async function getFacultyPerformanceMetrics(departmentId: string): Promise<FacultyPerformance[]> {
  try {
    const faculty = await prisma.faculty.findMany({
      where: { departmentId },
      select: {
        facultyId: true,
        name: true,
        email: true,
        designation: true,
      },
    });

    // Enrich with performance data from tasks and research
    return Promise.all(
      faculty.map(async (f) => {
        const completedTasks = await prisma.task.count({
          where: {
            assignedToId: f.facultyId,
            status: 'COMPLETED',
          },
        });

        const totalTasks = await prisma.task.count({
          where: {
            assignedToId: f.facultyId,
          },
        });

        const researchProjects = await prisma.research.count({
          where: {
            facultyId: f.facultyId,
          },
        });

        const publications = await prisma.publication.count({
          where: {
            facultyId: f.facultyId,
          },
        });

        const phdAdvisees = await prisma.phdStudent.count({
          where: {
            advisorId: f.facultyId,
          },
        });

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const performanceScore = Math.min(
          ((completionRate * 0.3 + researchProjects * 5 + publications * 3 + phdAdvisees * 2) / 10) * 10,
          100
        );

        return {
          facultyId: f.facultyId,
          name: f.name,
          email: f.email,
          designation: f.designation,
          tasksCompleted: completedTasks,
          completionRate,
          researchOutput: researchProjects,
          publications,
          phdAdvisees,
          performanceScore: parseFloat(performanceScore.toFixed(1)),
          status: performanceScore >= 80 ? 'GOOD' : performanceScore >= 60 ? 'AVERAGE' : 'NEEDS_IMPROVEMENT',
        };
      })
    );
  } catch (error) {
    console.error('Error fetching faculty performance metrics:', error);
    return [];
  }
}

/**
 * Get Student Performance metrics for a department
 */
async function getStudentPerformanceMetrics(departmentId: string, academicYear?: string): Promise<StudentPerformance[]> {
  try {
    const students = await prisma.student.findMany({
      where: { departmentId },
      select: {
        studentId: true,
        name: true,
        enrollmentId: true,
        academicYear: true,
      },
    });

    return Promise.all(
      students.map(async (s) => {
        // Get academic records
        const academicRecords = await prisma.academicRecord.findMany({
          where: { studentId: s.studentId },
          select: { gpa: true, sgpa: true, attendancePercentage: true },
        });

        const avgCGPA =
          academicRecords.length > 0
            ? academicRecords.reduce((sum, r) => sum + r.gpa, 0) / academicRecords.length
            : 0;

        const avgAttendance =
          academicRecords.length > 0
            ? academicRecords.reduce((sum, r) => sum + r.attendancePercentage, 0) / academicRecords.length
            : 0;

        // Determine risk level
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (avgCGPA < 5.5 || avgAttendance < 70) riskLevel = 'CRITICAL';
        else if (avgCGPA < 6.0 || avgAttendance < 75) riskLevel = 'HIGH';
        else if (avgCGPA < 6.5 || avgAttendance < 80) riskLevel = 'MEDIUM';

        return {
          studentId: s.studentId,
          name: s.name,
          enrollmentId: s.enrollmentId,
          academicYear: s.academicYear,
          cgpa: parseFloat(avgCGPA.toFixed(2)),
          attendancePercentage: Math.round(avgAttendance),
          riskLevel,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching student performance metrics:', error);
    return [];
  }
}

/**
 * Get Research metrics for a department
 */
async function getResearchMetrics(departmentId: string): Promise<ResearchMetrics> {
  try {
    const activeProjects = await prisma.research.count({
      where: {
        faculty: { departmentId },
        status: 'ONGOING',
      },
    });

    const completedProjects = await prisma.research.count({
      where: {
        faculty: { departmentId },
        status: 'COMPLETED',
      },
    });

    const totalFunding = await prisma.research.aggregate({
      where: { faculty: { departmentId } },
      _sum: { fundingAmount: true },
    });

    return {
      activeProjects,
      completedProjects,
      totalProjects: activeProjects + completedProjects,
      totalFunding: totalFunding._sum.fundingAmount || 0,
    };
  } catch (error) {
    console.error('Error fetching research metrics:', error);
    return {
      activeProjects: 0,
      completedProjects: 0,
      totalProjects: 0,
      totalFunding: 0,
    };
  }
}

/**
 * Get FDP metrics for a department
 */
async function getFDPMetrics(departmentId: string, academicYear?: string): Promise<FDPMetrics> {
  try {
    const totalFDP = await prisma.fdpProgram.count({
      where: { departmentId },
    });

    const completedFDP = await prisma.fdpProgram.count({
      where: {
        departmentId,
        status: 'COMPLETED',
      },
    });

    const upcomingFDP = await prisma.fdpProgram.count({
      where: {
        departmentId,
        status: 'UPCOMING',
      },
    });

    const attendanceRecords = await prisma.fdpAttendance.findMany({
      where: { fdpProgram: { departmentId } },
      select: { attended: true },
    });

    const certificateRecords = await prisma.fdpCertificate.findMany({
      where: { fdpProgram: { departmentId } },
    });

    const attendanceRate =
      attendanceRecords.length > 0
        ? Math.round(
            (attendanceRecords.filter((r) => r.attended).length / attendanceRecords.length) * 100
          )
        : 0;

    return {
      totalFDP,
      completedFDP,
      upcomingFDP,
      attendanceRate,
      certificateIssuedCount: certificateRecords.length,
    };
  } catch (error) {
    console.error('Error fetching FDP metrics:', error);
    return {
      totalFDP: 0,
      completedFDP: 0,
      upcomingFDP: 0,
      attendanceRate: 0,
      certificateIssuedCount: 0,
    };
  }
}

/**
 * Get Publication metrics for a department
 */
async function getPublicationMetrics(departmentId: string): Promise<PublicationMetrics> {
  try {
    const publications = await prisma.publication.findMany({
      where: { faculty: { departmentId } },
      select: { publicationType: true },
    });

    const nationalJournals = publications.filter((p) => p.publicationType === 'NATIONAL_JOURNAL').length;
    const internationalJournals = publications.filter((p) => p.publicationType === 'INTERNATIONAL_JOURNAL').length;
    const conferences = publications.filter((p) => p.publicationType === 'CONFERENCE').length;
    const books = publications.filter((p) => p.publicationType === 'BOOK').length;
    const patents = publications.filter((p) => p.publicationType === 'PATENT').length;

    const totalCitations = await prisma.publication.aggregate({
      where: { faculty: { departmentId } },
      _sum: { citations: true },
    });

    return {
      nationalJournals,
      internationalJournals,
      conferences,
      books,
      patents,
      totalPublications: publications.length,
      totalCitations: totalCitations._sum.citations || 0,
    };
  } catch (error) {
    console.error('Error fetching publication metrics:', error);
    return {
      nationalJournals: 0,
      internationalJournals: 0,
      conferences: 0,
      books: 0,
      patents: 0,
      totalPublications: 0,
      totalCitations: 0,
    };
  }
}

/**
 * Get PhD Status metrics for a department
 */
async function getPhDMetrics(departmentId: string): Promise<PhDStatus[]> {
  try {
    const advisors = await prisma.faculty.findMany({
      where: { departmentId },
      select: { facultyId: true, name: true },
    });

    return Promise.all(
      advisors.map(async (advisor) => {
        const registered = await prisma.phdStudent.count({
          where: {
            advisorId: advisor.facultyId,
            status: 'REGISTERED',
          },
        });

        const ongoingResearch = await prisma.phdStudent.count({
          where: {
            advisorId: advisor.facultyId,
            status: 'ONGOING_RESEARCH',
          },
        });

        const graduated = await prisma.phdStudent.count({
          where: {
            advisorId: advisor.facultyId,
            status: 'GRADUATED',
          },
        });

        return {
          advisorId: advisor.facultyId,
          advisorName: advisor.name,
          registered,
          ongoingResearch,
          graduated,
          totalPhDStudents: registered + ongoingResearch + graduated,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching PhD metrics:', error);
    return [];
  }
}

/**
 * Get Fee Collection statistics
 */
async function getFeeCollectionStats(departmentId: string, academicYear?: string): Promise<FeeCollectionStats> {
  try {
    const students = await prisma.student.findMany({
      where: { departmentId },
      select: { studentId: true },
    });

    const feeRecords = await prisma.feeTransaction.findMany({
      where: {
        student: { departmentId },
        status: 'PAID',
      },
    });

    const feePaid = new Set(feeRecords.map((f) => f.studentId)).size;
    const feePending = students.length - feePaid;
    const collectionPercentage = Math.round((feePaid / students.length) * 100);
    const totalCollected = feeRecords.reduce((sum, f) => sum + f.amount, 0);

    return {
      collectionPercentage,
      totalCollected,
      feePaid,
      feePending,
      totalStudents: students.length,
    };
  } catch (error) {
    console.error('Error fetching fee collection stats:', error);
    return {
      collectionPercentage: 0,
      totalCollected: 0,
      feePaid: 0,
      feePending: 0,
      totalStudents: 0,
    };
  }
}

/**
 * Get Task Completion statistics
 */
async function getTaskCompletionStats(departmentId: string): Promise<TaskCompletionStats> {
  try {
    const completedTasks = await prisma.task.count({
      where: {
        assignedToFaculty: { departmentId },
        status: 'COMPLETED',
      },
    });

    const pendingTasks = await prisma.task.count({
      where: {
        assignedToFaculty: { departmentId },
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
    });

    const overdueTasks = await prisma.task.count({
      where: {
        assignedToFaculty: { departmentId },
        dueDate: { lt: new Date() },
        status: { not: 'COMPLETED' },
      },
    });

    const totalTasks = completedTasks + pendingTasks + overdueTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      completedTasks,
      pendingTasks,
      overdueTasks,
      totalTasks,
      completionRate,
    };
  } catch (error) {
    console.error('Error fetching task completion stats:', error);
    return {
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      totalTasks: 0,
      completionRate: 0,
    };
  }
}

/**
 * Get Pending Approvals statistics
 */
async function getPendingApprovalsStats(departmentId: string): Promise<PendingApprovals> {
  try {
    const pendingApprovals = await prisma.approval.findMany({
      where: {
        status: 'PENDING',
        entity: { departmentId: departmentId },
      },
      select: { createdAt: true },
    });

    const now = new Date();
    let totalWaitingDays = 0;

    pendingApprovals.forEach((approval) => {
      const daysWaiting = Math.floor((now.getTime() - approval.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      totalWaitingDays += daysWaiting;
    });

    const averageWaitingDays =
      pendingApprovals.length > 0 ? Math.round(totalWaitingDays / pendingApprovals.length) : 0;

    return {
      totalPending: pendingApprovals.length,
      averageWaitingDays,
    };
  } catch (error) {
    console.error('Error fetching pending approvals stats:', error);
    return {
      totalPending: 0,
      averageWaitingDays: 0,
    };
  }
}

/**
 * Get list of at-risk students
 */
async function getRiskStudentsList(departmentId: string): Promise<any> {
  try {
    const riskStudents = await prisma.student.findMany({
      where: { departmentId },
      select: {
        studentId: true,
        name: true,
        enrollmentId: true,
        academicRecords: { select: { gpa: true, attendancePercentage: true } },
      },
    });

    const riskFactors: RiskStudent[] = [];
    let criticalRisk = 0,
      highRisk = 0,
      mediumRisk = 0;

    riskStudents.forEach((student) => {
      const avgCGPA =
        student.academicRecords.length > 0
          ? student.academicRecords.reduce((sum, r) => sum + r.gpa, 0) / student.academicRecords.length
          : 0;

      const avgAttendance =
        student.academicRecords.length > 0
          ? student.academicRecords.reduce((sum, r) => sum + r.attendancePercentage, 0) /
            student.academicRecords.length
          : 0;

      const riskReasons: string[] = [];
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';

      if (avgCGPA < 5.5) {
        riskReasons.push('Low CGPA');
        riskLevel = 'CRITICAL';
        criticalRisk++;
      } else if (avgCGPA < 6.0) {
        riskReasons.push('Below Average CGPA');
        riskLevel = 'HIGH';
        highRisk++;
      } else if (avgCGPA < 6.5) {
        riskReasons.push('Below Expected CGPA');
        riskLevel = 'MEDIUM';
        mediumRisk++;
      }

      if (avgAttendance < 70) {
        riskReasons.push('Low Attendance');
        if (riskLevel === 'LOW') riskLevel = 'CRITICAL';
      } else if (avgAttendance < 75) {
        riskReasons.push('Attendance Warning');
        if (riskLevel === 'LOW') riskLevel = 'HIGH';
      }

      if (riskReasons.length > 0) {
        riskFactors.push({
          studentId: student.studentId,
          name: student.name,
          enrollmentId: student.enrollmentId,
          cgpa: parseFloat(avgCGPA.toFixed(2)),
          attendance: Math.round(avgAttendance),
          riskLevel,
          riskReasons,
        });
      }
    });

    return {
      riskFactors: riskFactors.sort((a, b) => {
        const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }),
      totalRiskStudents: riskFactors.length,
      criticalRisk,
      highRisk,
      mediumRisk,
    };
  } catch (error) {
    console.error('Error fetching risk students list:', error);
    return {
      riskFactors: [],
      totalRiskStudents: 0,
      criticalRisk: 0,
      highRisk: 0,
      mediumRisk: 0,
    };
  }
}

// ============================================================================
// MANAGEMENT DASHBOARD SERVICE FUNCTIONS
// ============================================================================

/**
 * Get comprehensive Management Dashboard Data
 */
export async function getManagementDashboardData(filters?: any): Promise<ManagementDashboardData> {
  try {
    const [
      departmentKPIs,
      rankingMetrics,
      accreditations,
      facultyProductivity,
      studentProgression,
    ] = await Promise.all([
      getDepartmentKPIs(),
      getRankingMetrics(),
      getAccreditationReadiness(),
      getFacultyProductivityMetrics(),
      getStudentProgressionMetrics(),
    ]);

    return {
      departmentKPIs,
      rankingMetrics,
      accreditations,
      facultyProductivity,
      studentProgression,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error('Error fetching management dashboard data:', error);
    throw new Error('Failed to fetch management dashboard data');
  }
}

/**
 * Get KPIs for all departments
 */
async function getDepartmentKPIs(): Promise<DepartmentKPIs[]> {
  try {
    const departments = await prisma.department.findMany({
      select: { departmentId: true, departmentName: true },
    });

    return Promise.all(
      departments.map(async (dept) => {
        const facultyCount = await prisma.faculty.count({
          where: { departmentId: dept.departmentId },
        });

        const studentCount = await prisma.student.count({
          where: { departmentId: dept.departmentId },
        });

        // Average faculty performance
        const facultyPerformance = await getFacultyPerformanceMetrics(dept.departmentId);
        const avgFacultyPerformance =
          facultyPerformance.length > 0
            ? Math.round(
                facultyPerformance.reduce((sum, f) => sum + f.performanceScore, 0) / facultyPerformance.length
              )
            : 0;

        // Average student CGPA
        const studentPerformance = await getStudentPerformanceMetrics(dept.departmentId);
        const avgStudentCGPA =
          studentPerformance.length > 0
            ? parseFloat(
                (
                  studentPerformance.reduce((sum, s) => sum + s.cgpa, 0) / studentPerformance.length
                ).toFixed(2)
              )
            : 0;

        // Placement rate
        const placedStudents = await prisma.placementRecord.count({
          where: {
            student: { departmentId: dept.departmentId },
            status: 'PLACED',
          },
        });
        const placementRate = studentCount > 0 ? Math.round((placedStudents / studentCount) * 100) : 0;

        // Research projects and publications
        const researchProjectsCount = await prisma.research.count({
          where: { faculty: { departmentId: dept.departmentId } },
        });

        const publicationsCount = await prisma.publication.count({
          where: { faculty: { departmentId: dept.departmentId } },
        });

        return {
          departmentId: dept.departmentId,
          departmentName: dept.departmentName,
          facultyCount,
          studentCount,
          avgFacultyPerformance,
          avgStudentCGPA,
          placementRate,
          researchProjectsCount,
          publicationsCount,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching department KPIs:', error);
    return [];
  }
}

/**
 * Get institution ranking metrics
 */
async function getRankingMetrics(): Promise<RankingMetrics> {
  try {
    // Placeholder - In real scenario, fetch from institution rankings table
    return {
      nirf_ranking: 'Tier 1',
      nirf_category: 'Overall',
      nationalRanking: '42',
      worldRanking: '3850',
      researchScore: 78,
      teachingScore: 82,
      outreachScore: 76,
      infrastructureScore: 81,
      innovationScore: 79,
    };
  } catch (error) {
    console.error('Error fetching ranking metrics:', error);
    return {
      nirf_ranking: 'N/A',
      nirf_category: 'N/A',
      nationalRanking: 'N/A',
      worldRanking: 'N/A',
      researchScore: 0,
      teachingScore: 0,
      outreachScore: 0,
      infrastructureScore: 0,
      innovationScore: 0,
    };
  }
}

/**
 * Get accreditation readiness information
 */
async function getAccreditationReadiness(): Promise<AccreditationReadiness[]> {
  try {
    const accreditations = await prisma.accreditation.findMany({
      select: {
        accreditationId: true,
        accreditationType: true,
        status: true,
        completionPercentage: true,
      },
    });

    return Promise.all(
      accreditations.map(async (acc) => {
        const criteria = await prisma.accreditationCriteria.findMany({
          where: { accreditationId: acc.accreditationId },
          select: { criteriaId: true },
        });

        const evidenceRecords = await prisma.accreditationEvidence.findMany({
          where: { accreditation: { accreditationId: acc.accreditationId } },
          select: { status: true },
        });

        const criteriaCompleted = criteria.length; // Simplified - should check actual completion
        const evidenceSubmitted = evidenceRecords.length;
        const evidenceVerified = evidenceRecords.filter((e) => e.status === 'VERIFIED').length;

        // Calculate days until submission
        const submissionDate = new Date();
        submissionDate.setDate(submissionDate.getDate() + 90); // Mock: 90 days
        const daysUntilSubmission = Math.ceil(
          (submissionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const riskLevel =
          acc.completionPercentage < 50 ? 'CRITICAL' : acc.completionPercentage < 75 ? 'HIGH' : 'LOW';

        return {
          accreditationId: acc.accreditationId,
          accreditationType: acc.accreditationType,
          currentStatus: acc.status,
          completionPercentage: acc.completionPercentage,
          criteriaCompleted,
          criteriaTotal: criteria.length,
          evidenceSubmitted,
          evidenceVerified,
          daysUntilSubmission,
          riskLevel,
        };
      })
    );
  } catch (error) {
    console.error('Error fetching accreditation readiness:', error);
    return [];
  }
}

/**
 * Get faculty productivity metrics
 */
async function getFacultyProductivityMetrics(): Promise<FacultyProductivity> {
  try {
    const facultyCount = await prisma.faculty.count();

    const publicationsTotal = await prisma.publication.count();
    const averagePublicationsPerYear = facultyCount > 0 ? Math.round(publicationsTotal / facultyCount) : 0;

    const researchProjectsTotal = await prisma.research.count();
    const averageResearchProjectsPerFaculty = facultyCount > 0 ? Math.round(researchProjectsTotal / facultyCount) : 0;

    const phdAdvisorsCount = await prisma.faculty.count({
      where: {
        phdStudents: {
          some: {}, // Has at least one PhD student
        },
      },
    });

    const phdStudentsTotal = await prisma.phdStudent.count();
    const totalPhDStudentsAdvisedPerFaculty =
      phdAdvisorsCount > 0 ? Math.round(phdStudentsTotal / phdAdvisorsCount) : 0;

    const consultancyRecords = await prisma.consultancy.findMany({
      select: { amount: true },
    });
    const totalConsultancyRevenue = consultancyRecords.reduce((sum, c) => sum + c.amount, 0);

    const collaborations = await prisma.industryCollaboration.count();

    return {
      totalFaculty: facultyCount,
      averagePublicationsPerYear,
      averageResearchProjectsPerFaculty,
      phdAdvisorsCount,
      totalPhDStudentsAdvisedPerFaculty,
      totalConsultancyRevenue,
      industryCollaborations: collaborations,
    };
  } catch (error) {
    console.error('Error fetching faculty productivity metrics:', error);
    return {
      totalFaculty: 0,
      averagePublicationsPerYear: 0,
      averageResearchProjectsPerFaculty: 0,
      phdAdvisorsCount: 0,
      totalPhDStudentsAdvisedPerFaculty: 0,
      totalConsultancyRevenue: 0,
      industryCollaborations: 0,
    };
  }
}

/**
 * Get student progression metrics
 */
async function getStudentProgressionMetrics(): Promise<StudentProgression> {
  try {
    const students = await prisma.student.findMany({
      select: { studentId: true, academicYear: true },
    });

    const totalStudents = students.length;

    // Group by year
    const byYear: any[] = [];
    const yearGroups = new Map<number, any[]>();

    students.forEach((s) => {
      if (!yearGroups.has(s.academicYear)) {
        yearGroups.set(s.academicYear, []);
      }
      yearGroups.get(s.academicYear)!.push(s);
    });

    for (let [year, yearStudents] of yearGroups) {
      const academicRecords = await prisma.academicRecord.findMany({
        where: { studentId: { in: yearStudents.map((s) => s.studentId) } },
        select: { gpa: true, status: true },
      });

      const passed = academicRecords.filter((r) => r.status === 'PASSED').length;
      const failed = academicRecords.filter((r) => r.status === 'FAILED').length;
      const passPercentage = academicRecords.length > 0 ? Math.round((passed / academicRecords.length) * 100) : 0;

      byYear.push({
        year,
        totalEnrolled: yearStudents.length,
        passed,
        failed,
        passPercentage,
      });
    }

    // Average CGPA
    const allRecords = await prisma.academicRecord.findMany({
      select: { gpa: true },
    });
    const avgCGPA =
      allRecords.length > 0 ? parseFloat((allRecords.reduce((sum, r) => sum + r.gpa, 0) / allRecords.length).toFixed(2)) : 0;

    // Placement data
    const placementRecords = await prisma.placementRecord.findMany({
      select: { packageOffered: true, status: true },
    });

    const placedStudents = placementRecords.filter((p) => p.status === 'PLACED').length;
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    const avgPackage =
      placedStudents > 0
        ? parseFloat((placementRecords.filter((p) => p.status === 'PLACED').reduce((sum, p) => sum + p.packageOffered, 0) /
            placedStudents).toFixed(2))
        : 0;

    const highestPackage = placementRecords.length > 0 ? Math.max(...placementRecords.map((p) => p.packageOffered)) : 0;

    const companiesVisited = await prisma.companyVisit.count();
    const graduateStudies = 0; // Would need additional tracking
    const entrepreneurship = 0; // Would need additional tracking

    return {
      totalStudents,
      avgCGPA,
      placementRate,
      avgPlacementPackage: avgPackage,
      highestPackage: parseFloat(highestPackage.toFixed(1)),
      companiesVisited,
      graduateStudies,
      entrepreneurship,
      topperCGPA: 9.8, // Mock value
      byYear,
    };
  } catch (error) {
    console.error('Error fetching student progression metrics:', error);
    return {
      totalStudents: 0,
      avgCGPA: 0,
      placementRate: 0,
      avgPlacementPackage: 0,
      highestPackage: 0,
      companiesVisited: 0,
      graduateStudies: 0,
      entrepreneurship: 0,
      topperCGPA: 0,
      byYear: [],
    };
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

export const DashboardService = {
  getHODDashboardData,
  getManagementDashboardData,
  getDepartmentKPIs,
  getRankingMetrics,
  getAccreditationReadiness,
  getFacultyProductivityMetrics,
  getStudentProgressionMetrics,
};
