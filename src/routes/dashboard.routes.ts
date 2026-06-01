// src/routes/dashboard.routes.ts
// Dashboard Routes - API endpoints for Dashboard module

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth-complete.middleware';
import { DashboardService } from '../services/dashboard.service';

const router = Router();

/**
 * Base error response interface
 */
interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
}

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
const errorResponse = (message: string, error?: any): ErrorResponse => ({
  success: false,
  message,
  error: process.env.NODE_ENV === 'development' ? error : undefined,
});

// ============================================================================
// HOD DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/hod
 * Get complete HOD Dashboard data
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get('/hod', authenticate, authorize(['ROLE_HOD', 'ROLE_ADMIN']), async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { departmentId, academicYear } = req.query;

    const dashboardData = await DashboardService.getHODDashboardData(
      userId,
      departmentId as string,
      academicYear as string
    );

    res.status(200).json(successResponse(dashboardData, 'HOD Dashboard data retrieved successfully'));
  } catch (error) {
    console.error('Error fetching HOD dashboard:', error);
    res.status(500).json(errorResponse('Failed to fetch HOD dashboard data', error));
  }
});

/**
 * GET /api/dashboard/hod/faculty-performance
 * Get faculty performance metrics for HOD's department
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/faculty-performance',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      // Get HOD's department if not specified
      let deptId = departmentId as string;

      const dashboardData = await DashboardService.getHODDashboardData(userId, deptId);

      res.status(200).json(
        successResponse(
          dashboardData.facultyPerformance,
          'Faculty performance metrics retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Error fetching faculty performance:', error);
      res.status(500).json(errorResponse('Failed to fetch faculty performance metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/student-performance
 * Get student performance metrics
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/student-performance',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId, academicYear } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(
        userId,
        departmentId as string,
        academicYear as string
      );

      res.status(200).json(
        successResponse(dashboardData.studentPerformance, 'Student performance metrics retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching student performance:', error);
      res.status(500).json(errorResponse('Failed to fetch student performance metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/research-metrics
 * Get research metrics for the department
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/research-metrics',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(successResponse(dashboardData.researchMetrics, 'Research metrics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching research metrics:', error);
      res.status(500).json(errorResponse('Failed to fetch research metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/publications
 * Get publication statistics
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/publications',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(
        successResponse(dashboardData.publicationMetrics, 'Publication metrics retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching publication metrics:', error);
      res.status(500).json(errorResponse('Failed to fetch publication metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/fdp-metrics
 * Get FDP program metrics
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/fdp-metrics',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId, academicYear } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(
        userId,
        departmentId as string,
        academicYear as string
      );

      res.status(200).json(successResponse(dashboardData.fdpMetrics, 'FDP metrics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching FDP metrics:', error);
      res.status(500).json(errorResponse('Failed to fetch FDP metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/phd-status
 * Get PhD program status
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/phd-status',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(successResponse(dashboardData.phdStatus, 'PhD status retrieved successfully'));
    } catch (error) {
      console.error('Error fetching PhD status:', error);
      res.status(500).json(errorResponse('Failed to fetch PhD status', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/fee-collection
 * Get fee collection statistics
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/fee-collection',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId, academicYear } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(
        userId,
        departmentId as string,
        academicYear as string
      );

      res.status(200).json(
        successResponse(dashboardData.feeCollection, 'Fee collection stats retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching fee collection stats:', error);
      res.status(500).json(errorResponse('Failed to fetch fee collection statistics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/task-completion
 * Get task completion statistics
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/task-completion',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(
        successResponse(dashboardData.taskCompletion, 'Task completion stats retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching task completion stats:', error);
      res.status(500).json(errorResponse('Failed to fetch task completion statistics', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/pending-approvals
 * Get pending approvals
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/pending-approvals',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(
        successResponse(dashboardData.pendingApprovals, 'Pending approvals retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      res.status(500).json(errorResponse('Failed to fetch pending approvals', error));
    }
  }
);

/**
 * GET /api/dashboard/hod/risk-students
 * Get list of at-risk students
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/hod/risk-students',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      res.status(200).json(
        successResponse(dashboardData.riskStudents, 'Risk students list retrieved successfully')
      );
    } catch (error) {
      console.error('Error fetching risk students:', error);
      res.status(500).json(errorResponse('Failed to fetch risk students list', error));
    }
  }
);

// ============================================================================
// MANAGEMENT DASHBOARD ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/management
 * Get complete Management Dashboard data
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const dashboardData = await DashboardService.getManagementDashboardData();

      res.status(200).json(successResponse(dashboardData, 'Management Dashboard data retrieved successfully'));
    } catch (error) {
      console.error('Error fetching management dashboard:', error);
      res.status(500).json(errorResponse('Failed to fetch management dashboard data', error));
    }
  }
);

/**
 * GET /api/dashboard/management/kpis
 * Get department KPIs
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management/kpis',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const kpis = await DashboardService.getDepartmentKPIs();

      res.status(200).json(successResponse(kpis, 'Department KPIs retrieved successfully'));
    } catch (error) {
      console.error('Error fetching department KPIs:', error);
      res.status(500).json(errorResponse('Failed to fetch department KPIs', error));
    }
  }
);

/**
 * GET /api/dashboard/management/rankings
 * Get institution rankings
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management/rankings',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const rankings = await DashboardService.getRankingMetrics();

      res.status(200).json(successResponse(rankings, 'Ranking metrics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching ranking metrics:', error);
      res.status(500).json(errorResponse('Failed to fetch ranking metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/management/accreditation
 * Get accreditation readiness
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management/accreditation',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const accreditations = await DashboardService.getAccreditationReadiness();

      res
        .status(200)
        .json(successResponse(accreditations, 'Accreditation readiness retrieved successfully'));
    } catch (error) {
      console.error('Error fetching accreditation readiness:', error);
      res.status(500).json(errorResponse('Failed to fetch accreditation readiness', error));
    }
  }
);

/**
 * GET /api/dashboard/management/faculty-productivity
 * Get faculty productivity metrics
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management/faculty-productivity',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const productivity = await DashboardService.getFacultyProductivityMetrics();

      res.status(200).json(successResponse(productivity, 'Faculty productivity metrics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching faculty productivity:', error);
      res.status(500).json(errorResponse('Failed to fetch faculty productivity metrics', error));
    }
  }
);

/**
 * GET /api/dashboard/management/student-progression
 * Get student progression metrics
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/management/student-progression',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const progression = await DashboardService.getStudentProgressionMetrics();

      res.status(200).json(successResponse(progression, 'Student progression metrics retrieved successfully'));
    } catch (error) {
      console.error('Error fetching student progression:', error);
      res.status(500).json(errorResponse('Failed to fetch student progression metrics', error));
    }
  }
);

// ============================================================================
// ANALYTICS & REPORTING ENDPOINTS
// ============================================================================

/**
 * GET /api/dashboard/export/hod-excel
 * Export HOD Dashboard data to Excel
 * Permission: ROLE_HOD, ROLE_ADMIN
 */
router.get(
  '/export/hod-excel',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { departmentId } = req.query;

      const dashboardData = await DashboardService.getHODDashboardData(userId, departmentId as string);

      // Set response headers for Excel download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=hod_dashboard.xlsx');

      // TODO: Implement Excel generation using a library like xlsx or exceljs
      res.status(200).json(successResponse({ message: 'Export initiated' }, 'Excel export started'));
    } catch (error) {
      console.error('Error exporting HOD dashboard:', error);
      res.status(500).json(errorResponse('Failed to export HOD dashboard', error));
    }
  }
);

/**
 * GET /api/dashboard/export/management-pdf
 * Export Management Dashboard to PDF
 * Permission: ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.get(
  '/export/management-pdf',
  authenticate,
  authorize(['ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const dashboardData = await DashboardService.getManagementDashboardData();

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=management_dashboard.pdf');

      // TODO: Implement PDF generation using a library like pdfkit or puppeteer
      res.status(200).json(successResponse({ message: 'Export initiated' }, 'PDF export started'));
    } catch (error) {
      console.error('Error exporting management dashboard:', error);
      res.status(500).json(errorResponse('Failed to export management dashboard', error));
    }
  }
);

/**
 * POST /api/dashboard/subscribe-notifications
 * Subscribe to dashboard metric notifications
 * Permission: ROLE_HOD, ROLE_DIRECTOR, ROLE_PRINCIPAL, ROLE_ADMIN
 */
router.post(
  '/subscribe-notifications',
  authenticate,
  authorize(['ROLE_HOD', 'ROLE_DIRECTOR', 'ROLE_PRINCIPAL', 'ROLE_ADMIN']),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const { metrics, frequency, threshold } = req.body;

      // TODO: Implement notification subscription logic
      // Store subscription preferences in database
      // Set up background job for sending notifications

      res.status(201).json(
        successResponse(
          { subscriptionId: 'sub_' + Date.now(), metrics, frequency, threshold },
          'Notification subscription created'
        )
      );
    } catch (error) {
      console.error('Error creating notification subscription:', error);
      res.status(500).json(errorResponse('Failed to create notification subscription', error));
    }
  }
);

export default router;
