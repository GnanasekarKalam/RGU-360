// src/routes/faculty-master-complete.routes.ts
// Faculty Master Module Routes - Complete Implementation

import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth-complete.middleware';
import * as facultyService from '../services/faculty-master-complete.service';

const router = Router();

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
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/qualifications
 * Get all qualifications
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
 * PUT /api/faculty/qualifications/:id
 * Update qualification
 */
router.put(
  '/qualifications/:id',
  authenticate,
  requirePermission('UPDATE', 'FACULTY_QUALIFICATION'),
  async (req: Request, res: Response) => {
    try {
      const qualificationId = req.params.id;
      const result = await facultyService.updateQualification(
        qualificationId,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/faculty/qualifications/:id
 * Delete qualification
 */
router.delete(
  '/qualifications/:id',
  authenticate,
  requirePermission('DELETE', 'FACULTY_QUALIFICATION'),
  async (req: Request, res: Response) => {
    try {
      const qualificationId = req.params.id;
      const result = await facultyService.deleteQualification(qualificationId);
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
 * Add publication
 */
router.post(
  '/:id/publications',
  authenticate,
  requirePermission('CREATE', 'FACULTY_PUBLICATION'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addPublication(facultyId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/publications
 * Get all publications
 */
router.get(
  '/:id/publications',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.getPublications(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * PUT /api/faculty/publications/:id/citations
 * Update publication citation count
 */
router.put(
  '/publications/:id/citations',
  authenticate,
  requirePermission('UPDATE', 'FACULTY_PUBLICATION'),
  async (req: Request, res: Response) => {
    try {
      const publicationId = req.params.id;
      const { citationCount } = req.body;
      const result = await facultyService.updatePublicationCitations(
        publicationId,
        citationCount
      );
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
 * POST /api/faculty/:id/fdp-programs
 * Add FDP program
 */
router.post(
  '/:id/fdp-programs',
  authenticate,
  requirePermission('CREATE', 'FACULTY_FDP'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addFDPProgram(facultyId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/fdp-programs
 * Get all FDP programs
 */
router.get(
  '/:id/fdp-programs',
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
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/seminars
 * Get all seminars
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

// ============================================================================
// PhD TRACKING ENDPOINTS
// ============================================================================

/**
 * POST /api/faculty/:id/phd-candidates
 * Add PhD candidate
 */
router.post(
  '/:id/phd-candidates',
  authenticate,
  requirePermission('CREATE', 'FACULTY_PHD'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addPhdCandidate(facultyId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/phd-candidates
 * Get all PhD candidates
 */
router.get(
  '/:id/phd-candidates',
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
 * PUT /api/faculty/phd-candidates/:id
 * Update PhD progress
 */
router.put(
  '/phd-candidates/:id',
  authenticate,
  requirePermission('UPDATE', 'FACULTY_PHD'),
  async (req: Request, res: Response) => {
    try {
      const phdId = req.params.id;
      const result = await facultyService.updatePhdProgress(phdId, req.body);
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
  requirePermission('CREATE', 'FACULTY_SKILL'),
  async (req: Request, res: Response) => {
    try {
      const facultyId = req.params.id;
      const result = await facultyService.addSkill(facultyId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/skills
 * Get all skills
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
 * POST /api/faculty/skills/:id/endorse
 * Endorse skill
 */
router.post(
  '/skills/:id/endorse',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const skillId = req.params.id;
      const result = await facultyService.endorseSkill(skillId);
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
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

/**
 * GET /api/faculty/:id/evidence
 * Get all evidence
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
 * POST /api/faculty/evidence/:id/verify
 * Verify evidence
 */
router.post(
  '/evidence/:id/verify',
  authenticate,
  requirePermission('VERIFY', 'FACULTY_EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const evidenceId = req.params.id;
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!['VERIFIED', 'REJECTED'].includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: 'Invalid status' });
      }

      const result = await facultyService.verifyEvidence(
        evidenceId,
        userId,
        status
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

// ============================================================================
// FACULTY DASHBOARD ENDPOINT
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
      const userId = (req as any).user?.id;
      const userRoles = (req as any).user?.roles;

      // Check access: Faculty can view own, others need permission
      if (
        facultyId !== userId &&
        !['SUPER_ADMIN', 'ADMIN', 'HOD', 'IQAC'].some((r: any) =>
          userRoles?.includes(r)
        )
      ) {
        return res
          .status(403)
          .json({ success: false, message: 'Unauthorized access' });
      }

      const result = await facultyService.getFacultyDashboard(facultyId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
);

export default router;
