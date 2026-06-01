// src/routes/student-master.routes.ts
// Student Master Module Routes

import { Router, Request, Response } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth-complete.middleware';
import * as studentService from '../services/student-master.service';

const router = Router();

// ============================================================================
// STUDENT PROFILE ENDPOINTS
// ============================================================================

/**
 * GET /api/student/:id
 * Get complete student profile
 * Permissions: Student (own), ADMIN, HOD, Faculty (advisees), IQAC
 */
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access
      if (studentId !== userId && !['SUPER_ADMIN', 'ADMIN', 'HOD', 'IQAC'].some((r: any) => userRoles?.includes(r))) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
      }

      const result = await studentService.getStudentProfile(studentId);
      if (result.success) {
        res.json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/student/:id
 * Update student profile
 * Permissions: SUPER_ADMIN, ADMIN, Student (own)
 */
router.put(
  '/:id',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Only allow self-update or admin update
      if (studentId !== userId && !['SUPER_ADMIN', 'ADMIN'].some((r: any) => userRoles?.includes(r))) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      const result = await studentService.updateStudentProfile(studentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// PARENT DETAILS ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/parents
 * Add parent/guardian
 */
router.post(
  '/:id/parents',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.addParent(studentId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/parents
 * Get parent/guardian details
 */
router.get(
  '/:id/parents',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.getParents(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/student/:id/parents/:parentId
 * Update parent details
 */
router.put(
  '/:id/parents/:parentId',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.updateParent(req.params.parentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/student/:id/parents/:parentId
 * Delete parent entry
 */
router.delete(
  '/:id/parents/:parentId',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.deleteParent(req.params.parentId);
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
 * Create academic record
 */
router.post(
  '/:id/academic-records',
  authenticate,
  requirePermission('CREATE', 'STUDENT_ACADEMIC_RECORD'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.createAcademicRecord(studentId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/academic-records
 * Get academic records
 */
router.get(
  '/:id/academic-records',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.getAcademicRecords(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/student/:id/academic-records/:recordId
 * Delete academic record
 */
router.delete(
  '/:id/academic-records/:recordId',
  authenticate,
  requirePermission('DELETE', 'STUDENT_ACADEMIC_RECORD'),
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.deleteAcademicRecord(req.params.recordId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// FEES ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/fees
 * Create fee entry
 */
router.post(
  '/:id/fees',
  authenticate,
  requirePermission('CREATE', 'STUDENT_FEE'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.createFee(studentId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/fees
 * Get fees
 */
router.get(
  '/:id/fees',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.getFees(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * POST /api/student/:id/fees/:feeId/payment
 * Record fee payment
 */
router.post(
  '/:id/fees/:feeId/payment',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.recordFeePayment(req.params.feeId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/fees/summary
 * Get fee summary for semester
 */
router.get(
  '/:id/fees/summary',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const { semester, academicYear } = req.query;
      const result = await studentService.getFeeSummary(
        studentId,
        semester as string,
        academicYear as string
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// TUTOR WARD ASSIGNMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/student/:id/tutor-ward
 * Assign tutor to student
 */
router.post(
  '/:id/tutor-ward',
  authenticate,
  requirePermission('CREATE', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.assignTutorWard(studentId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/student/:id/tutor-ward
 * Get current tutor assignment
 */
router.get(
  '/:id/tutor-ward',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id;
      const result = await studentService.getTutorWard(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/student/:id/tutor-ward/:assignmentId
 * Update tutor ward assignment
 */
router.put(
  '/:id/tutor-ward/:assignmentId',
  authenticate,
  requirePermission('UPDATE', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.updateTutorWard(req.params.assignmentId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/student/:id/tutor-ward/:assignmentId
 * Terminate tutor assignment
 */
router.delete(
  '/:id/tutor-ward/:assignmentId',
  authenticate,
  requirePermission('DELETE', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const result = await studentService.terminateTutorWard(req.params.assignmentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// DASHBOARD ENDPOINTS
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
      const result = await studentService.getStudentDashboard(studentId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// TUTOR ENDPOINTS
// ============================================================================

/**
 * GET /api/tutor/:tutorId/tutees
 * Get list of tutees for a tutor (Faculty only)
 */
router.get(
  '/tutor/:tutorId/tutees',
  authenticate,
  requirePermission('READ', 'STUDENT_TUTOR_WARD'),
  async (req: Request, res: Response) => {
    try {
      const tutorId = req.params.tutorId;
      const result = await studentService.getTuteesList(tutorId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
