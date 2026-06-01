// src/routes/reporting.routes.ts
// Reporting Engine API Routes

import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticateToken, checkPermission } from '../middleware/auth.middleware';
import { ReportingService } from '../services/reporting.service';
import { ReportExportService } from '../services/report-export.service';
import { PrismaClient } from '@prisma/client';
import { getGraphClient } from '../config/graph.config';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// MIDDLEWARE & UTILITIES
// ============================================================================

/**
 * Success response wrapper
 */
const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data,
});

/**
 * Error response wrapper
 */
const errorResponse = (message: string, error?: any) => ({
  success: false,
  message,
  error: process.env.NODE_ENV === 'development' ? error : undefined,
});

/**
 * Save generated report to OneDrive and database
 */
async function saveReportToStorage(
  reportData: any,
  fileBuffer: Buffer,
  fileFormat: string,
  userId: string,
  reportType: string,
  filters?: any
): Promise<string> {
  try {
    // Save to database
    const reportHistory = await prisma.reportHistory.create({
      data: {
        reportType,
        generatedByUserId: userId,
        fileUrl: `file-${Date.now()}`,
        fileSize: BigInt(fileBuffer.length),
        fileName: `${reportType}-${Date.now()}.${fileFormat}`,
        fileFormat: fileFormat.toUpperCase(),
        filterCriteria: filters || {},
        summaryData: reportData.summary || {},
        generationStatus: 'GENERATED',
        totalRecords: reportData.data?.length || 0,
      },
    });

    // Create download log
    await prisma.downloadLog.create({
      data: {
        reportHistoryId: reportHistory.id,
        userId,
        reportType,
        fileFormat: fileFormat.toUpperCase(),
        downloadStatus: 'SUCCESS',
      },
    });

    return reportHistory.id;
  } catch (error) {
    console.error('Error saving report to storage:', error);
    throw error;
  }
}

// ============================================================================
// FACULTY REPORT ENDPOINTS
// ============================================================================

/**
 * GET /api/reports/faculty/master
 * Generate Faculty Master Report
 */
router.get(
  '/faculty/master',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateFacultyMasterReport({
        departmentId: departmentId as string,
      });

      // Export to requested format
      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Faculty Master Report',
            department: departmentId as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Faculty Master Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Faculty Master Report',
            department: departmentId as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Faculty Master Report',
            department: departmentId as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Faculty Master Report',
            department: departmentId as string,
            generatedBy: req.user?.email,
          });
          break;
      }

      // Save to history
      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'FACULTY_MASTER',
        { departmentId }
      );

      // Send response
      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="faculty-master-report.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating faculty master report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

/**
 * GET /api/reports/faculty/api-score
 * Generate Faculty API Score Report
 */
router.get(
  '/faculty/api-score',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, academicYear, format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateFacultyAPIScoreReport({
        departmentId: departmentId as string,
        academicYear: academicYear as string,
      });

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Faculty API Score Report',
            department: departmentId as string,
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Faculty API Score Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Faculty API Score Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Faculty API Score Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Faculty API Score Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'FACULTY_API_SCORE',
        { departmentId, academicYear }
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="faculty-api-score.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating faculty API score report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

/**
 * GET /api/reports/faculty/publications
 * Generate Faculty Publication Report
 */
router.get(
  '/faculty/publications',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, facultyId, format = 'pdf' } = req.query;

      // Faculty can only view their own
      const queryFacultyId = req.user?.role === 'ROLE_FACULTY' ? req.user?.facultyId : facultyId;

      const reportData = await ReportingService.generateFacultyPublicationReport({
        departmentId: departmentId as string,
        facultyId: queryFacultyId as string,
      });

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Faculty Publication Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Faculty Publication Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Faculty Publication Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Faculty Publication Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Faculty Publication Report',
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'FACULTY_PUBLICATION',
        { departmentId, facultyId: queryFacultyId }
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="faculty-publications.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating publication report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

// ============================================================================
// STUDENT REPORT ENDPOINTS
// ============================================================================

/**
 * GET /api/reports/student/master
 * Generate Student Master Report
 */
router.get(
  '/student/master',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateStudentMasterReport({});

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Student Master Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Student Master Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Student Master Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Student Master Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Student Master Report',
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'STUDENT_MASTER',
        {}
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="student-master.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating student master report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

/**
 * GET /api/reports/student/progress
 * Generate Student Progress Report
 */
router.get(
  '/student/progress',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_STUDENT']),
  async (req: Request, res: Response) => {
    try {
      const { studentId, format = 'pdf' } = req.query;

      // Students can only view their own
      const queryStudentId = req.user?.role === 'ROLE_STUDENT' ? req.user?.studentId : studentId;

      const reportData = await ReportingService.generateStudentProgressReport({
        studentId: queryStudentId as string,
      });

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Student Progress Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Student Progress Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Student Progress Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Student Progress Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Student Progress Report',
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'STUDENT_PROGRESS',
        { studentId: queryStudentId }
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="student-progress.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating student progress report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

/**
 * GET /api/reports/student/attendance
 * Generate Student Attendance Report
 */
router.get(
  '/student/attendance',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateStudentAttendanceReport({});

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Student Attendance Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Student Attendance Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Student Attendance Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Student Attendance Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Student Attendance Report',
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'STUDENT_ATTENDANCE',
        {}
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="student-attendance.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating attendance report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

/**
 * GET /api/reports/student/fee-pending
 * Generate Student Fee Pending Report
 */
router.get(
  '/student/fee-pending',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateStudentFeePendingReport({});

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'Student Fee Pending Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'Student Fee Pending Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'Student Fee Pending Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'Student Fee Pending Report',
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'Student Fee Pending Report',
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'STUDENT_FEE_PENDING',
        {}
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="student-fee-pending.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating fee pending report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

// ============================================================================
// ACCREDITATION REPORT ENDPOINTS
// ============================================================================

/**
 * GET /api/reports/accreditation/nba
 * Generate NBA Evidence Report
 */
router.get(
  '/accreditation/nba',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { academicYear, format = 'pdf' } = req.query;

      const reportData = await ReportingService.generateNBAEvidenceReport({
        academicYear: academicYear as string,
      });

      let fileBuffer: Buffer;
      let contentType = 'application/pdf';

      switch (format) {
        case 'excel':
          fileBuffer = await ReportExportService.exportToExcel(reportData, {
            reportName: 'NBA Evidence Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          const csvData = await ReportExportService.exportToCSV(reportData, {
            reportName: 'NBA Evidence Report',
            generatedBy: req.user?.email,
          });
          fileBuffer = Buffer.from(csvData);
          contentType = 'text/csv';
          break;
        case 'word':
          fileBuffer = await ReportExportService.exportToWord(reportData, {
            reportName: 'NBA Evidence Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'ppt':
          fileBuffer = await ReportExportService.exportToPPT(reportData, {
            reportName: 'NBA Evidence Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'pdf':
        default:
          fileBuffer = await ReportExportService.exportToPDF(reportData, {
            reportName: 'NBA Evidence Report',
            academicYear: academicYear as string,
            generatedBy: req.user?.email,
          });
          break;
      }

      const reportHistoryId = await saveReportToStorage(
        reportData,
        fileBuffer,
        format as string,
        req.user!.id,
        'ACCREDITATION_NBA',
        { academicYear }
      );

      res.set({
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="nba-evidence-report.${format}"`,
        'X-Report-ID': reportHistoryId,
      });
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error generating NBA report:', error);
      res.status(500).json(errorResponse('Failed to generate report', error));
    }
  }
);

// ============================================================================
// REPORT HISTORY & MANAGEMENT
// ============================================================================

/**
 * GET /api/reports/history
 * Get report generation history
 */
router.get(
  '/history',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { limit = 10, offset = 0, reportType } = req.query;

      const where: any = {
        generatedByUserId: req.user!.id,
      };

      if (reportType) {
        where.reportType = reportType;
      }

      const history = await prisma.reportHistory.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { generatedAt: 'desc' },
        include: {
          generatedBy: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      const total = await prisma.reportHistory.count({ where });

      res.json(
        successResponse(
          {
            reports: history,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
          'Report history retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Error fetching report history:', error);
      res.status(500).json(errorResponse('Failed to fetch report history', error));
    }
  }
);

/**
 * GET /api/reports/history/:reportId/download
 * Download previously generated report
 */
router.get(
  '/history/:reportId/download',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;
      const { format = 'pdf' } = req.query;

      const reportHistory = await prisma.reportHistory.findUnique({
        where: { id: reportId },
      });

      if (!reportHistory) {
        return res.status(404).json(errorResponse('Report not found'));
      }

      // Check permissions
      if (reportHistory.generatedByUserId !== req.user!.id && req.user?.role !== 'ROLE_ADMIN') {
        return res.status(403).json(errorResponse('Access denied'));
      }

      // Create download log
      await prisma.downloadLog.create({
        data: {
          reportHistoryId: reportHistory.id,
          userId: req.user!.id,
          reportType: reportHistory.reportType,
          fileFormat: format as string,
          downloadStatus: 'SUCCESS',
        },
      });

      // Return file (in real scenario, fetch from OneDrive)
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${reportHistory.fileName}"`,
      });

      res.json(
        successResponse(
          { fileUrl: reportHistory.fileUrl, fileName: reportHistory.fileName },
          'Report download initiated'
        )
      );
    } catch (error) {
      console.error('Error downloading report:', error);
      res.status(500).json(errorResponse('Failed to download report', error));
    }
  }
);

/**
 * DELETE /api/reports/history/:reportId
 * Delete report from history
 */
router.delete(
  '/history/:reportId',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { reportId } = req.params;

      const reportHistory = await prisma.reportHistory.findUnique({
        where: { id: reportId },
      });

      if (!reportHistory) {
        return res.status(404).json(errorResponse('Report not found'));
      }

      // Check permissions
      if (reportHistory.generatedByUserId !== req.user!.id && req.user?.role !== 'ROLE_ADMIN') {
        return res.status(403).json(errorResponse('Access denied'));
      }

      // Delete report
      await prisma.reportHistory.update({
        where: { id: reportId },
        data: { deletedAt: new Date() },
      });

      res.json(successResponse(null, 'Report deleted successfully'));
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json(errorResponse('Failed to delete report', error));
    }
  }
);

/**
 * GET /api/reports/download-logs
 * Get download logs for audit trail
 */
router.get(
  '/download-logs',
  authenticateToken,
  checkPermission(['ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0, userId, reportType } = req.query;

      const where: any = {};

      if (userId) where.userId = userId;
      if (reportType) where.reportType = reportType;

      const logs = await prisma.downloadLog.findMany({
        where,
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
        orderBy: { downloadedAt: 'desc' },
        include: {
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
      });

      const total = await prisma.downloadLog.count({ where });

      res.json(
        successResponse(
          {
            logs,
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
          },
          'Download logs retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Error fetching download logs:', error);
      res.status(500).json(errorResponse('Failed to fetch download logs', error));
    }
  }
);

export default router;
