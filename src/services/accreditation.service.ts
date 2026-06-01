// src/services/accreditation.service.ts
// Accreditation Module Service - Enterprise Implementation

import { PrismaClient } from '@prisma/client';
import {
  CreateCriteriaMappingRequest,
  SubmitEvidenceRequest,
  VerifyEvidenceRequest,
  GenerateReportRequest,
  CreateAcademicYearRequest,
  BulkFacultyMappingRequest,
  BulkStudentMappingRequest,
  AccreditationFilters,
} from '../types/accreditation.types';

const prisma = new PrismaClient();

// ============================================================================
// ACCREDITATION BODY MANAGEMENT
// ============================================================================

export const getAccreditationBodies = async () => {
  try {
    const bodies = await prisma.accreditationBody.findMany({
      include: {
        criteria: {
          select: {
            id: true,
            criteriaCode: true,
            criteriaTitle: true,
            mappings: { select: { id: true } },
          },
        },
      },
    });

    return { success: true, bodies };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAccreditationBody = async (bodyId: string) => {
  try {
    const body = await prisma.accreditationBody.findUnique({
      where: { id: bodyId },
      include: {
        criteria: {
          include: {
            mappings: {
              include: {
                evidences: true,
                alerts: true,
              },
            },
          },
        },
      },
    });

    if (!body) {
      return { success: false, message: 'Accreditation body not found' };
    }

    return { success: true, body };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// CRITERIA MANAGEMENT
// ============================================================================

export const createCriteria = async (bodyId: string, data: any) => {
  try {
    const criteria = await prisma.accreditationCriteria.create({
      data: {
        bodyId,
        criteriaCode: data.criteriaCode,
        criteriaTitle: data.criteriaTitle,
        description: data.description,
        evidenceRequirements: data.evidenceRequirements,
      },
    });

    return { success: true, message: 'Criteria created successfully', criteria };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getCriteria = async (criteriaId: string) => {
  try {
    const criteria = await prisma.accreditationCriteria.findUnique({
      where: { id: criteriaId },
      include: {
        body: true,
        mappings: {
          include: {
            evidences: { select: { id: true, isVerified: true } },
            alerts: true,
          },
        },
      },
    });

    if (!criteria) {
      return { success: false, message: 'Criteria not found' };
    }

    return { success: true, criteria };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const listCriteria = async (bodyId?: string, limit = 50, offset = 0) => {
  try {
    const whereClause = bodyId ? { bodyId } : {};

    const criteria = await prisma.accreditationCriteria.findMany({
      where: whereClause,
      include: {
        body: { select: { name: true } },
        mappings: { select: { id: true } },
      },
      orderBy: { criteriaCode: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.accreditationCriteria.count({
      where: whereClause,
    });

    return { success: true, criteria, total, limit, offset };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// CRITERIA MAPPING
// ============================================================================

export const createCriteriaMapping = async (data: CreateCriteriaMappingRequest) => {
  try {
    const mapping = await prisma.accreditationCriteriaMapping.create({
      data: {
        criteriaId: data.criteriaId,
        academicYearId: data.academicYearId,
        facultyId: data.facultyId,
        studentId: data.studentId,
        departmentId: data.departmentId,
        mappingType: data.mappingType,
        description: data.description,
      },
      include: {
        criteria: { select: { criteriaCode: true, criteriaTitle: true } },
        evidences: true,
      },
    });

    return { success: true, message: 'Mapping created successfully', mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getCriteriaMapping = async (mappingId: string) => {
  try {
    const mapping = await prisma.accreditationCriteriaMapping.findUnique({
      where: { id: mappingId },
      include: {
        criteria: { select: { criteriaCode: true, criteriaTitle: true } },
        academicYear: true,
        faculty: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
        student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
        evidences: {
          include: {
            submittedBy: { select: { firstName: true, lastName: true } },
            verifier: { select: { firstName: true, lastName: true } },
          },
        },
        alerts: true,
      },
    });

    if (!mapping) {
      return { success: false, message: 'Mapping not found' };
    }

    return { success: true, mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const listCriteriaMappings = async (filters?: AccreditationFilters, limit = 50, offset = 0) => {
  try {
    const whereClause: any = {};

    if (filters?.mappingType) whereClause.mappingType = filters.mappingType;

    const mappings = await prisma.accreditationCriteriaMapping.findMany({
      where: whereClause,
      include: {
        criteria: { select: { criteriaCode: true, criteriaTitle: true } },
        evidences: { select: { id: true, isVerified: true } },
        alerts: { select: { id: true, severity: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.accreditationCriteriaMapping.count({
      where: whereClause,
    });

    return { success: true, mappings, total, limit, offset };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// ACADEMIC YEAR MANAGEMENT
// ============================================================================

export const createAcademicYear = async (data: CreateAcademicYearRequest) => {
  try {
    const academicYear = await prisma.accreditationAcademicYear.create({
      data: {
        academicYear: data.academicYear,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
      },
    });

    return { success: true, message: 'Academic year created successfully', academicYear };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAcademicYears = async () => {
  try {
    const years = await prisma.accreditationAcademicYear.findMany({
      include: {
        mappings: { select: { id: true } },
      },
      orderBy: { academicYear: 'desc' },
    });

    return { success: true, years };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getActiveAcademicYear = async () => {
  try {
    const year = await prisma.accreditationAcademicYear.findFirst({
      where: { isActive: true },
    });

    return { success: true, year };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// EVIDENCE MANAGEMENT
// ============================================================================

export const submitEvidence = async (
  mappingId: string,
  submittedByUserId: string,
  data: SubmitEvidenceRequest
) => {
  try {
    const mapping = await prisma.accreditationCriteriaMapping.findUnique({
      where: { id: mappingId },
    });

    if (!mapping) {
      return { success: false, message: 'Mapping not found' };
    }

    const evidence = await prisma.accreditationEvidence.create({
      data: {
        mappingId,
        title: data.title,
        description: data.description,
        evidenceType: data.evidenceType,
        fileUrl: data.fileUrl,
        externalLink: data.externalLink,
        documentType: data.documentType,
        academicYear: data.academicYear,
        submittedByUserId,
      },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
      },
    });

    // Clear alert if exists
    await prisma.accreditationAlert.updateMany({
      where: {
        mappingId,
        alertType: 'MISSING_EVIDENCE',
      },
      data: {
        status: 'ACKNOWLEDGED',
      },
    });

    return { success: true, message: 'Evidence submitted successfully', evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getEvidenceForMapping = async (mappingId: string) => {
  try {
    const evidence = await prisma.accreditationEvidence.findMany({
      where: { mappingId },
      include: {
        submittedBy: { select: { firstName: true, lastName: true, email: true } },
        verifier: { select: { firstName: true, lastName: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return { success: true, evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const verifyEvidence = async (
  evidenceId: string,
  verifiedByUserId: string,
  data: VerifyEvidenceRequest
) => {
  try {
    const evidence = await prisma.accreditationEvidence.update({
      where: { id: evidenceId },
      data: {
        isVerified: data.isVerified,
        verifiedByUserId: verifiedByUserId,
        verificationComments: data.verificationComments,
        verifiedAt: new Date(),
      },
      include: {
        verifier: { select: { firstName: true, lastName: true } },
      },
    });

    return { success: true, message: 'Evidence verified successfully', evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// FACULTY MAPPING
// ============================================================================

export const createFacultyMapping = async (data: any) => {
  try {
    const mapping = await prisma.accreditationFacultyMapping.create({
      data: {
        facultyId: data.facultyId,
        academicYear: data.academicYear,
        assignedCriteria: data.assignedCriteria || [],
        mappingStatus: data.mappingStatus || 'ACTIVE',
      },
    });

    return { success: true, message: 'Faculty mapping created', mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const bulkFacultyMapping = async (data: BulkFacultyMappingRequest) => {
  try {
    const mappings = [];

    for (const facultyId of data.facultyIds) {
      for (const criteriaId of data.criteriaIds) {
        const mapping = await prisma.accreditationCriteriaMapping.create({
          data: {
            criteriaId,
            facultyId,
            academicYearId: '', // To be filled from active year
            mappingType: 'FACULTY',
          },
        });
        mappings.push(mapping);
      }
    }

    return { success: true, message: `${mappings.length} faculty mappings created`, mappings };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getFacultyMapping = async (facultyId: string, academicYear: string) => {
  try {
    const mapping = await prisma.accreditationFacultyMapping.findUnique({
      where: {
        facultyId_academicYear: {
          facultyId,
          academicYear,
        },
      },
      include: {
        faculty: {
          select: {
            user: { select: { firstName: true, lastName: true, email: true } },
            departmentId: true,
          },
        },
      },
    });

    if (!mapping) {
      return { success: false, message: 'Faculty mapping not found' };
    }

    return { success: true, mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// STUDENT MAPPING
// ============================================================================

export const createStudentMapping = async (data: any) => {
  try {
    const mapping = await prisma.accreditationStudentMapping.create({
      data: {
        studentId: data.studentId,
        academicYear: data.academicYear,
        program: data.program,
        assignedCriteria: data.assignedCriteria || [],
        mappingStatus: data.mappingStatus || 'ACTIVE',
      },
    });

    return { success: true, message: 'Student mapping created', mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const bulkStudentMapping = async (data: BulkStudentMappingRequest) => {
  try {
    const mappings = [];

    for (const studentId of data.studentIds) {
      for (const criteriaId of data.criteriaIds) {
        const mapping = await prisma.accreditationCriteriaMapping.create({
          data: {
            criteriaId,
            studentId,
            mappingType: 'STUDENT',
          },
        });
        mappings.push(mapping);
      }
    }

    return { success: true, message: `${mappings.length} student mappings created`, mappings };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getStudentMapping = async (studentId: string, academicYear: string) => {
  try {
    const mapping = await prisma.accreditationStudentMapping.findUnique({
      where: {
        studentId_academicYear: {
          studentId,
          academicYear,
        },
      },
      include: {
        student: {
          select: {
            user: { select: { firstName: true, lastName: true, email: true } },
            degreeProgram: true,
          },
        },
      },
    });

    if (!mapping) {
      return { success: false, message: 'Student mapping not found' };
    }

    return { success: true, mapping };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// REPORT GENERATION
// ============================================================================

export const generateReport = async (
  generatedByUserId: string,
  data: GenerateReportRequest
) => {
  try {
    // Get all criteria for the body
    const body = await prisma.accreditationBody.findFirst({
      where: { name: data.bodyType },
    });

    if (!body) {
      return { success: false, message: 'Accreditation body not found' };
    }

    const criteria = await prisma.accreditationCriteria.findMany({
      where: { bodyId: body.id },
      include: {
        mappings: {
          include: {
            evidences: true,
          },
        },
      },
    });

    const totalCriteria = criteria.length;
    const mappedCriteria = criteria.filter((c) => c.mappings.length > 0).length;
    const evidenceCount = criteria.reduce((sum, c) => sum + c.mappings.reduce((s, m) => s + m.evidences.length, 0), 0);
    const verifiedEvidence = criteria.reduce(
      (sum, c) => sum + c.mappings.reduce((s, m) => s + m.evidences.filter((e) => e.isVerified).length, 0),
      0
    );

    const complianceRate = totalCriteria > 0 ? Math.round((mappedCriteria / totalCriteria) * 100) : 0;

    const report = await prisma.accreditationReport.create({
      data: {
        reportName: `${data.bodyType} Accreditation Report - ${data.academicYear}`,
        bodyType: data.bodyType,
        academicYear: data.academicYear,
        generatedByUserId,
        reportFormat: data.format,
        totalCriteria,
        mappedCriteria,
        evidenceCount,
        complianceRate,
        status: 'GENERATED',
      },
    });

    return { success: true, message: 'Report generated successfully', report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getReport = async (reportId: string) => {
  try {
    const report = await prisma.accreditationReport.findUnique({
      where: { id: reportId },
      include: {
        generatedBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!report) {
      return { success: false, message: 'Report not found' };
    }

    return { success: true, report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const listReports = async (filters?: AccreditationFilters, limit = 20, offset = 0) => {
  try {
    const whereClause: any = {};

    if (filters?.bodyType) whereClause.bodyType = filters.bodyType;
    if (filters?.academicYear) whereClause.academicYear = filters.academicYear;

    const reports = await prisma.accreditationReport.findMany({
      where: whereClause,
      include: {
        generatedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { generatedAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.accreditationReport.count({
      where: whereClause,
    });

    return { success: true, reports, total, limit, offset };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// ALERT MANAGEMENT
// ============================================================================

export const createAlert = async (mappingId: string, alertData: any) => {
  try {
    const alert = await prisma.accreditationAlert.create({
      data: {
        mappingId,
        alertType: alertData.alertType,
        severity: alertData.severity,
        message: alertData.message,
      },
      include: {
        mapping: {
          include: {
            criteria: { select: { criteriaCode: true } },
          },
        },
      },
    });

    return { success: true, alert };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAlerts = async (filters?: AccreditationFilters, limit = 50, offset = 0) => {
  try {
    const whereClause: any = { status: 'ACTIVE' };

    if (filters?.severity) whereClause.severity = filters?.severity;

    const alerts = await prisma.accreditationAlert.findMany({
      where: whereClause,
      include: {
        mapping: {
          include: {
            criteria: { select: { criteriaCode: true, criteriaTitle: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.accreditationAlert.count({
      where: whereClause,
    });

    return { success: true, alerts, total, limit, offset };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const resolveAlert = async (
  alertId: string,
  resolvedByUserId: string,
  resolutionNotes?: string
) => {
  try {
    const alert = await prisma.accreditationAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedByUserId,
        resolutionNotes,
        resolvedAt: new Date(),
      },
    });

    return { success: true, message: 'Alert resolved', alert };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const checkMissingEvidence = async () => {
  try {
    // Get all active mappings
    const mappings = await prisma.accreditationCriteriaMapping.findMany({
      include: {
        evidences: { where: { isVerified: true } },
      },
    });

    const missingEvidenceMappings = mappings.filter((m) => m.evidences.length === 0);

    // Create alerts for missing evidence
    for (const mapping of missingEvidenceMappings) {
      const existingAlert = await prisma.accreditationAlert.findFirst({
        where: {
          mappingId: mapping.id,
          alertType: 'MISSING_EVIDENCE',
          status: 'ACTIVE',
        },
      });

      if (!existingAlert) {
        await createAlert(mapping.id, {
          alertType: 'MISSING_EVIDENCE',
          severity: 'HIGH',
          message: `No verified evidence submitted for criteria mapping`,
        });
      }
    }

    return { success: true, message: `${missingEvidenceMappings.length} alerts checked/created` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

export const getAccreditationDashboardStats = async (filters?: AccreditationFilters) => {
  try {
    const bodies = await prisma.accreditationBody.findMany();
    const criteria = await prisma.accreditationCriteria.findMany();
    const mappings = await prisma.accreditationCriteriaMapping.findMany();
    const evidence = await prisma.accreditationEvidence.findMany();
    const verifiedEvidence = evidence.filter((e) => e.isVerified);
    const pendingVerification = evidence.filter((e) => !e.isVerified);
    const alerts = await prisma.accreditationAlert.findMany({
      where: { status: 'ACTIVE' },
    });
    const criticalAlerts = alerts.filter((a) => a.severity === 'CRITICAL');

    const facultyCount = await prisma.accreditationFacultyMapping.findMany();
    const studentCount = await prisma.accreditationStudentMapping.findMany();

    const stats = {
      totalBodies: bodies.length,
      activeBodies: bodies.length,
      totalCriteria: criteria.length,
      mappedCriteria: mappings.length,
      totalEvidence: evidence.length,
      verifiedEvidence: verifiedEvidence.length,
      pendingVerification: pendingVerification.length,
      complianceRate: criteria.length > 0 ? Math.round((mappings.length / criteria.length) * 100) : 0,
      activeAlerts: alerts.length,
      criticalAlerts: criticalAlerts.length,
      facultiesInvolved: new Set(facultyCount.map((f) => f.facultyId)).size,
      studentsInvolved: new Set(studentCount.map((s) => s.studentId)).size,
    };

    return { success: true, stats };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getComplianceMetrics = async (
  bodyType: string,
  academicYear: string
) => {
  try {
    const body = await prisma.accreditationBody.findFirst({
      where: { name: bodyType },
      include: {
        criteria: {
          include: {
            mappings: {
              include: {
                evidences: true,
              },
            },
          },
        },
      },
    });

    if (!body) {
      return { success: false, message: 'Body not found' };
    }

    const totalCriteria = body.criteria.length;
    const mappedCriteria = body.criteria.filter((c) => c.mappings.length > 0).length;
    const evidenceCount = body.criteria.reduce(
      (sum, c) => sum + c.mappings.reduce((s, m) => s + m.evidences.length, 0),
      0
    );
    const verifiedEvidenceCount = body.criteria.reduce(
      (sum, c) =>
        sum + c.mappings.reduce((s, m) => s + m.evidences.filter((e) => e.isVerified).length, 0),
      0
    );

    const criteriaBreakdown: any = {};
    body.criteria.forEach((c) => {
      criteriaBreakdown[c.criteriaCode] = {
        mapped: c.mappings.length > 0,
        evidenceCount: c.mappings.reduce((s, m) => s + m.evidences.length, 0),
        verified: c.mappings.reduce((s, m) => s + m.evidences.filter((e) => e.isVerified).length, 0),
        status: c.mappings.length > 0 ? 'MAPPED' : 'PENDING',
      };
    });

    const metrics = {
      bodyType,
      academicYear,
      totalCriteria,
      mappedCriteria,
      mappingPercentage: totalCriteria > 0 ? Math.round((mappedCriteria / totalCriteria) * 100) : 0,
      evidenceCount,
      verifiedEvidenceCount,
      compliancePercentage:
        evidenceCount > 0 ? Math.round((verifiedEvidenceCount / evidenceCount) * 100) : 0,
      criteriaBreakdown,
    };

    return { success: true, metrics };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAlertSummary = async (filters?: AccreditationFilters) => {
  try {
    const alerts = await prisma.accreditationAlert.findMany({
      where: { status: 'ACTIVE' },
    });

    const summary = {
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'CRITICAL').length,
      highAlerts: alerts.filter((a) => a.severity === 'HIGH').length,
      mediumAlerts: alerts.filter((a) => a.severity === 'MEDIUM').length,
      lowAlerts: alerts.filter((a) => a.severity === 'LOW').length,
      byType: {
        MISSING_EVIDENCE: alerts.filter((a) => a.alertType === 'MISSING_EVIDENCE').length,
        PENDING_VERIFICATION: alerts.filter((a) => a.alertType === 'PENDING_VERIFICATION').length,
        EXPIRED_EVIDENCE: alerts.filter((a) => a.alertType === 'EXPIRED_EVIDENCE').length,
        INCOMPLETE_MAPPING: alerts.filter((a) => a.alertType === 'INCOMPLETE_MAPPING').length,
      },
    };

    return { success: true, summary };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
