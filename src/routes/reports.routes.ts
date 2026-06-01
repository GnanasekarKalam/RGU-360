// src/routes/reports.routes.ts
// Reports Generation and Export API Routes

import { Router, Request, Response } from 'express';
import { authenticateToken, checkPermission } from '../middleware/auth.middleware';
import ReportsService from '../services/reports.service';
import { ExportFormat, ReportType } from '../types/reports.types';

const router = Router();

/**
 * Success response wrapper
 */
const successResponse = (data: any, message = 'Success') => ({
  success: true,
  message,
  data
});

/**
 * Error response wrapper
 */
const errorResponse = (message: string, error?: any) => ({
  success: false,
  message,
  error: process.env.NODE_ENV === 'development' ? error : undefined
});

// ============================================================================
// FACULTY API SCORE REPORT
// ============================================================================

/**
 * POST /api/reports/faculty-api-score
 * Generate Faculty API Score Report
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_DIRECTOR
 */
router.post(
  '/faculty-api-score',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { facultyId, exportFormat = ExportFormat.JSON } = req.body;

      if (!facultyId) {
        return res.status(400).json(errorResponse('Missing required field: facultyId'));
      }

      const report = await ReportsService.generateFacultyAPIScoreReport(facultyId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `Faculty_API_Score_${report.faculty.name.replace(/\s+/g, '_')}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.metrics);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating Faculty API Score report:', error);
      res.status(500).json(errorResponse('Failed to generate Faculty API Score report', error));
    }
  }
);

/**
 * GET /api/reports/faculty-api-score/:facultyId
 * Get Faculty API Score Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_DIRECTOR
 */
router.get(
  '/faculty-api-score/:facultyId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { facultyId } = req.params;
      const report = await ReportsService.generateFacultyAPIScoreReport(facultyId);
      res.status(200).json(successResponse(report, 'Faculty API Score report generated successfully'));
    } catch (error) {
      console.error('Error fetching Faculty API Score report:', error);
      res.status(500).json(errorResponse('Failed to fetch Faculty API Score report', error));
    }
  }
);

// ============================================================================
// STUDENT PROGRESS REPORT
// ============================================================================

/**
 * POST /api/reports/student-progress
 * Generate Student Progress Report
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY, ROLE_STUDENT
 */
router.post(
  '/student-progress',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY', 'ROLE_STUDENT']),
  async (req: Request, res: Response) => {
    try {
      const { studentId, exportFormat = ExportFormat.JSON } = req.body;

      if (!studentId) {
        return res.status(400).json(errorResponse('Missing required field: studentId'));
      }

      const report = await ReportsService.generateStudentProgressReport(studentId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `Student_Progress_${report.student.name.replace(/\s+/g, '_')}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.currentCourses);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating Student Progress report:', error);
      res.status(500).json(errorResponse('Failed to generate Student Progress report', error));
    }
  }
);

/**
 * GET /api/reports/student-progress/:studentId
 * Get Student Progress Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY, ROLE_STUDENT
 */
router.get(
  '/student-progress/:studentId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY', 'ROLE_STUDENT']),
  async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const report = await ReportsService.generateStudentProgressReport(studentId);
      res.status(200).json(successResponse(report, 'Student Progress report generated successfully'));
    } catch (error) {
      console.error('Error fetching Student Progress report:', error);
      res.status(500).json(errorResponse('Failed to fetch Student Progress report', error));
    }
  }
);

// ============================================================================
// TUTOR WARD REPORT
// ============================================================================

/**
 * POST /api/reports/tutor-ward
 * Generate Tutor Ward Report
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY
 */
router.post(
  '/tutor-ward',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY']),
  async (req: Request, res: Response) => {
    try {
      const { tutorId, academicYear, exportFormat = ExportFormat.JSON } = req.body;

      if (!tutorId || !academicYear) {
        return res
          .status(400)
          .json(errorResponse('Missing required fields: tutorId, academicYear'));
      }

      const report = await ReportsService.generateTutorWardReport(tutorId, academicYear);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `Tutor_Ward_${report.tutor.name.replace(/\s+/g, '_')}_${academicYear}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.wards);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating Tutor Ward report:', error);
      res.status(500).json(errorResponse('Failed to generate Tutor Ward report', error));
    }
  }
);

/**
 * GET /api/reports/tutor-ward/:tutorId/:academicYear
 * Get Tutor Ward Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_HOD, ROLE_FACULTY
 */
router.get(
  '/tutor-ward/:tutorId/:academicYear',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_HOD', 'ROLE_FACULTY']),
  async (req: Request, res: Response) => {
    try {
      const { tutorId, academicYear } = req.params;
      const report = await ReportsService.generateTutorWardReport(tutorId, academicYear);
      res.status(200).json(successResponse(report, 'Tutor Ward report generated successfully'));
    } catch (error) {
      console.error('Error fetching Tutor Ward report:', error);
      res.status(500).json(errorResponse('Failed to fetch Tutor Ward report', error));
    }
  }
);

// ============================================================================
// DEPARTMENT REPORT
// ============================================================================

/**
 * POST /api/reports/department
 * Generate Department Report
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR, ROLE_HOD
 */
router.post(
  '/department',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, exportFormat = ExportFormat.JSON } = req.body;

      if (!departmentId) {
        return res.status(400).json(errorResponse('Missing required field: departmentId'));
      }

      const report = await ReportsService.generateDepartmentReport(departmentId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `Department_Report_${report.department.name.replace(/\s+/g, '_')}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV({
          ...report.metrics,
          studentAnalysis: report.studentAnalysis,
          performanceMetrics: report.performanceMetrics
        });
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating Department report:', error);
      res.status(500).json(errorResponse('Failed to generate Department report', error));
    }
  }
);

/**
 * GET /api/reports/department/:departmentId
 * Get Department Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR, ROLE_HOD
 */
router.get(
  '/department/:departmentId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_HOD']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const report = await ReportsService.generateDepartmentReport(departmentId);
      res.status(200).json(successResponse(report, 'Department report generated successfully'));
    } catch (error) {
      console.error('Error fetching Department report:', error);
      res.status(500).json(errorResponse('Failed to fetch Department report', error));
    }
  }
);

// ============================================================================
// ACCREDITATION REPORTS
// ============================================================================

/**
 * POST /api/reports/nba-sar
 * Generate NBA SAR Report
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.post(
  '/nba-sar',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, exportFormat = ExportFormat.JSON } = req.body;

      if (!departmentId) {
        return res.status(400).json(errorResponse('Missing required field: departmentId'));
      }

      const report = await ReportsService.generateNBASARReport(departmentId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `NBA_SAR_Report_${new Date().getFullYear()}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.criteria);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating NBA SAR report:', error);
      res.status(500).json(errorResponse('Failed to generate NBA SAR report', error));
    }
  }
);

/**
 * GET /api/reports/nba-sar/:departmentId
 * Get NBA SAR Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.get(
  '/nba-sar/:departmentId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const report = await ReportsService.generateNBASARReport(departmentId);
      res.status(200).json(successResponse(report, 'NBA SAR report generated successfully'));
    } catch (error) {
      console.error('Error fetching NBA SAR report:', error);
      res.status(500).json(errorResponse('Failed to fetch NBA SAR report', error));
    }
  }
);

/**
 * POST /api/reports/naac
 * Generate NAAC Report
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.post(
  '/naac',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, exportFormat = ExportFormat.JSON } = req.body;

      if (!departmentId) {
        return res.status(400).json(errorResponse('Missing required field: departmentId'));
      }

      const report = await ReportsService.generateNAACReport(departmentId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `NAAC_Report_${new Date().getFullYear()}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.criteriaWiseAnalysis);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating NAAC report:', error);
      res.status(500).json(errorResponse('Failed to generate NAAC report', error));
    }
  }
);

/**
 * GET /api/reports/naac/:departmentId
 * Get NAAC Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.get(
  '/naac/:departmentId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const report = await ReportsService.generateNAACReport(departmentId);
      res.status(200).json(successResponse(report, 'NAAC report generated successfully'));
    } catch (error) {
      console.error('Error fetching NAAC report:', error);
      res.status(500).json(errorResponse('Failed to fetch NAAC report', error));
    }
  }
);

/**
 * POST /api/reports/aicte
 * Generate AICTE Report
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.post(
  '/aicte',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId, exportFormat = ExportFormat.JSON } = req.body;

      if (!departmentId) {
        return res.status(400).json(errorResponse('Missing required field: departmentId'));
      }

      const report = await ReportsService.generateAICTEReport(departmentId);

      let exportedData: any = report;
      let contentType = 'application/json';
      let fileName = `AICTE_Report_${new Date().getFullYear()}.json`;

      if (exportFormat === ExportFormat.CSV) {
        exportedData = ReportsService.exportAsCSV(report.complianceChecks);
        contentType = 'text/csv';
        fileName = fileName.replace('.json', '.csv');
      } else if (exportFormat === ExportFormat.JSON) {
        exportedData = ReportsService.exportAsJSON(report);
      }

      res.status(200)
        .set('Content-Type', contentType)
        .set('Content-Disposition', `attachment; filename="${fileName}"`)
        .send(exportedData);
    } catch (error) {
      console.error('Error generating AICTE report:', error);
      res.status(500).json(errorResponse('Failed to generate AICTE report', error));
    }
  }
);

/**
 * GET /api/reports/aicte/:departmentId
 * Get AICTE Report (JSON)
 * Permission: ROLE_ADMIN, ROLE_DIRECTOR
 */
router.get(
  '/aicte/:departmentId',
  authenticateToken,
  checkPermission(['ROLE_ADMIN', 'ROLE_DIRECTOR']),
  async (req: Request, res: Response) => {
    try {
      const { departmentId } = req.params;
      const report = await ReportsService.generateAICTEReport(departmentId);
      res.status(200).json(successResponse(report, 'AICTE report generated successfully'));
    } catch (error) {
      console.error('Error fetching AICTE report:', error);
      res.status(500).json(errorResponse('Failed to fetch AICTE report', error));
    }
  }
);

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * GET /api/reports/health
 * Check if reports service is running
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json(successResponse({ status: 'OK' }, 'Reports service is running'));
});

export default router;
