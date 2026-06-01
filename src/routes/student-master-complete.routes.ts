// src/routes/student-master-complete.routes.ts
// Student Master Module Routes - Complete Implementation

import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth-complete.middleware';
import * as studentService from '../services/student-master-complete.service';

const router = Router();

// ============================================================================
// PARENT/GUARDIAN ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/parents
 * Add parent/guardian
 */
router.post(
  '/:id/parents',
  authenticate,
  requirePermission('CREATE', 'STUDENT_PARENT'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.addParent(studentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/parents
 * Get all parents/guardians
 */
router.get(
  '/:id/parents',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access: Student can view own, parents can view linked student, others need permission
      if (
        studentId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'HOD', 'IQAC'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getParents(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/student/parents/:id
 * Update parent details
 */
router.put(
  '/parents/:id',
  authenticate,
  requirePermission('UPDATE', 'STUDENT_PARENT'),
  async (req: Request, res: Response) => {
    try {
      const parentId = req.params.id;
      const result = await studentService.updateParent(parentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/student/parents/:id
 * Delete parent
 */
router.delete(
  '/parents/:id',
  authenticate,
  requirePermission('DELETE', 'STUDENT_PARENT'),
  async (req: Request, res: Response) => {
    try {
      const parentId = req.params.id;
      const result = await studentService.deleteParent(parentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// ACADEMIC RECORDS ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/academic-records
 * Add academic record
 */
router.post(
  '/:id/academic-records',
  authenticate,
  requirePermission('CREATE', 'STUDENT_ACADEMIC_RECORD'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.addAcademicRecord(
        studentId,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/academic-records
 * Get all academic records
 */
router.get(
  '/:id/academic-records',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access
      if (
        studentId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'IQAC'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getAcademicRecords(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/academic-records/:semester/:year
 * Get specific semester record
 */
router.get(
  '/:id/academic-records/:semester/:year',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const semester = req.params.semester;
      const academicYear = req.params.year;

      const result = await studentService.getAcademicRecordBySemester(
        studentId,
        semester,
        academicYear
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// FEE MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/fees
 * Add fee structure
 */
router.post(
  '/:id/fees',
  authenticate,
  requirePermission('CREATE', 'STUDENT_FEE'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.addFeeStructure(studentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/fees
 * Get all fees
 */
router.get(
  '/:id/fees',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access
      if (
        studentId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'HOD', 'ACCOUNTS'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getStudentFees(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/fees/summary
 * Get fee summary
 */
router.get(
  '/:id/fees/summary',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const semester = req.query.semester as string;
      const academicYear = req.query.academicYear as string;

      const result = await studentService.getFeeSummary(
        studentId,
        semester,
        academicYear
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * POST /api/student/fees/:id/payment
 * Record fee payment
 */
router.post(
  '/fees/:id/payment',
  authenticate,
  requirePermission('CREATE', 'STUDENT_FEE_PAYMENT'),
  async (req: Request, res: Response) => {
    try {
      const feeId = req.params.id;
      const result = await studentService.recordFeePayment(feeId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// TUTOR WARD ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/tutor-ward
 * Assign tutor/mentor
 */
router.post(
  '/:id/tutor-ward',
  authenticate,
  requirePermission('CREATE', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.assignTutorWard(studentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/tutor-ward
 * Get tutor assignment
 */
router.get(
  '/:id/tutor-ward',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access
      if (
        studentId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY', 'IQAC'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getTutorWard(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/student/tutor-ward/:id
 * Update tutor assignment
 */
router.put(
  '/tutor-ward/:id',
  authenticate,
  requirePermission('UPDATE', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const tutorWardId = req.params.id;
      const result = await studentService.updateTutorWard(
        tutorWardId,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * POST /api/student/tutor-ward/:id/meeting
 * Record meeting with tutor
 */
router.post(
  '/tutor-ward/:id/meeting',
  authenticate,
  requirePermission('CREATE', 'STUDENT_MEETING'),
  async (req: Request, res: Response) => {
    try {
      const tutorWardId = req.params.id;
      const result = await studentService.recordMeetingWithTutor(
        tutorWardId,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// STUDENT DASHBOARD ENDPOINT
// ============================================================================

/**
 * GET /api/student/:id/dashboard
 * Get complete student dashboard
 */
router.get(
  '/:id/dashboard',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access: Student can view own, others need permission
      if (
        studentId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'HOD', 'FACULTY', 'IQAC'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getStudentDashboard(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
