// src/routes/faculty-master.routes.ts
// Faculty Master Module Routes

import { Router, Request, Response } from 'express';
import { authenticate, authorize, requirePermission } from '../middleware/auth-complete.middleware';
import * as facultyService from '../services/faculty-master.service';

const router = Router();

// ============================================================================
// FACULTY PROFILE ENDPOINTS
// ============================================================================

/**
 * GET /api/faculty/:id
 * Get complete faculty profile
 * Permissions: SUPER_ADMIN, ADMIN, HOD, Faculty (own profile), IQAC
 */
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access: Faculty can view own profile, others need permission
      if (facultyId !== userId && !['SUPER_ADMIN', 'ADMIN', 'HOD', 'IQAC'].some((r: any) => userRoles?.includes(r))) {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
      }

      const result = await facultyService.getFacultyProfile(facultyId);
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
 * PUT /api/faculty/:id
 * Update faculty profile
 * Permissions: SUPER_ADMIN, ADMIN, Faculty (own profile)
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('UPDATE', 'FACULTY'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.updateFacultyProfile(facultyId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// QUALIFICATIONS ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/qualifications
 * Add faculty qualification
 */
router.post(
  '/:id/qualifications',
  authenticate,
  requirePermission('CREATE', 'FACULTY_QUALIFICATION'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addQualification(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/qualifications
 * Get faculty qualifications
 */
router.get(
  '/:id/qualifications',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getQualifications(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/qualifications/:qualificationId
 * Delete faculty qualification
 */
router.delete(
  '/:id/qualifications/:qualificationId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_QUALIFICATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deleteQualification(req.params.qualificationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// PUBLICATIONS ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/publications
 * Add faculty publication
 */
router.post(
  '/:id/publications',
  authenticate,
  requirePermission('CREATE', 'FACULTY_PUBLICATION'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addPublication(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/publications
 * Get faculty publications with pagination
 */
router.get(
  '/:id/publications',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const result = await facultyService.getPublications(facultyId, limit);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/publications/:publicationId
 * Delete faculty publication
 */
router.delete(
  '/:id/publications/:publicationId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_PUBLICATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deletePublication(req.params.publicationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// FDP PROGRAMS ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/fdp
 * Add FDP program
 */
router.post(
  '/:id/fdp',
  authenticate,
  requirePermission('CREATE', 'FACULTY_FDP'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addFDP(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/fdp
 * Get FDP programs
 */
router.get(
  '/:id/fdp',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getFDPPrograms(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/fdp/:fdpId
 * Delete FDP program
 */
router.delete(
  '/:id/fdp/:fdpId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_FDP'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deleteFDP(req.params.fdpId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// SEMINARS ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/seminars
 * Add seminar
 */
router.post(
  '/:id/seminars',
  authenticate,
  requirePermission('CREATE', 'FACULTY_SEMINAR'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addSeminar(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/seminars
 * Get seminars
 */
router.get(
  '/:id/seminars',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getSeminars(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/seminars/:seminarId
 * Delete seminar
 */
router.delete(
  '/:id/seminars/:seminarId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_SEMINAR'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deleteSeminar(req.params.seminarId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// PhD TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/phd
 * Add PhD candidate
 */
router.post(
  '/:id/phd',
  authenticate,
  requirePermission('CREATE', 'FACULTY_PHD'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addPhdCandidate(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/phd
 * Get PhD candidates
 */
router.get(
  '/:id/phd',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getPhdCandidates(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/faculty/:id/phd/:phdId
 * Update PhD progress
 */
router.put(
  '/:id/phd/:phdId',
  authenticate,
  requirePermission('UPDATE', 'FACULTY_PHD'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.updatePhdProgress(req.params.phdId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/phd/:phdId
 * Delete PhD candidate
 */
router.delete(
  '/:id/phd/:phdId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_PHD'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deletePhdCandidate(req.params.phdId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// SKILLS ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/skills
 * Add skill
 */
router.post(
  '/:id/skills',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addSkill(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/skills
 * Get skills
 */
router.get(
  '/:id/skills',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getSkills(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/skills/:skillId
 * Delete skill
 */
router.delete(
  '/:id/skills/:skillId',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deleteSkill(req.params.skillId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// EVIDENCE ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/evidence
 * Add evidence
 */
router.post(
  '/:id/evidence',
  authenticate,
  requirePermission('CREATE', 'FACULTY_EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addEvidence(facultyId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/evidence
 * Get evidence
 */
router.get(
  '/:id/evidence',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getEvidence(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PATCH /api/faculty/:id/evidence/:evidenceId/verify
 * Verify evidence (Admin only)
 */
router.patch(
  '/:id/evidence/:evidenceId/verify',
  authenticate,
  requirePermission('UPDATE', 'FACULTY_EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const verifiedBy = (req as any).user?.id;
      const result = await facultyService.verifyEvidence(req.params.evidenceId, verifiedBy);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/:id/evidence/:evidenceId
 * Delete evidence
 */
router.delete(
  '/:id/evidence/:evidenceId',
  authenticate,
  requirePermission('DELETE', 'FACULTY_EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const result = await facultyService.deleteEvidence(req.params.evidenceId);
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
 * GET /api/faculty/:id/dashboard
 * Get complete faculty dashboard
 */
router.get(
  '/:id/dashboard',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getFacultyDashboard(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
