// src/routes/accreditation.routes.ts
// Accreditation Module Routes

import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth-complete.middleware';
import * as accreditationService from '../services/accreditation.service';

const router = Router();

// ============================================================================
// ACCREDITATION BODY ENDPOINTS
// ============================================================================

/**
 * GET /api/accreditation/bodies
 * Get all accreditation bodies
 */
router.get('/bodies', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getAccreditationBodies();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/bodies/:id
 * Get accreditation body details
 */
router.get('/bodies/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getAccreditationBody(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// CRITERIA ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/criteria
 * Create criteria
 */
router.post(
  '/criteria',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const { bodyId, ...data } = req.body;
      const result = await accreditationService.createCriteria(bodyId, data);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/criteria/:id
 * Get criteria details
 */
router.get('/criteria/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getCriteria(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/criteria
 * List criteria
 */
router.get('/criteria', authenticate, async (req: Request, res: Response) => {
  try {
    const bodyId = req.query.bodyId as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await accreditationService.listCriteria(bodyId, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// CRITERIA MAPPING ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/mappings
 * Create criteria mapping
 */
router.post(
  '/mappings',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.createCriteriaMapping(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/mappings/:id
 * Get mapping details
 */
router.get('/mappings/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getCriteriaMapping(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/mappings
 * List mappings with filters
 */
router.get('/mappings', authenticate, async (req: Request, res: Response) => {
  try {
    const filters = {
      mappingType: req.query.mappingType as string,
      status: req.query.status as string,
    };

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await accreditationService.listCriteriaMappings(filters, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ACADEMIC YEAR ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/academic-years
 * Create academic year
 */
router.post(
  '/academic-years',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.createAcademicYear(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/academic-years
 * Get all academic years
 */
router.get('/academic-years', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getAcademicYears();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/academic-years/active
 * Get active academic year
 */
router.get('/academic-years/active', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getActiveAcademicYear();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// EVIDENCE ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/evidence
 * Submit evidence
 */
router.post(
  '/evidence',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await accreditationService.submitEvidence(
        req.body.mappingId,
        userId,
        req.body
      );
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/evidence/:mappingId
 * Get evidence for mapping
 */
router.get('/evidence/:mappingId', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getEvidenceForMapping(req.params.mappingId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/accreditation/evidence/:id/verify
 * Verify evidence
 */
router.post(
  '/evidence/:id/verify',
  authenticate,
  requirePermission('VERIFY', 'EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await accreditationService.verifyEvidence(
        req.params.id,
        userId,
        req.body
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// FACULTY MAPPING ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/faculty-mapping
 * Create faculty mapping
 */
router.post(
  '/faculty-mapping',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.createFacultyMapping(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/accreditation/faculty-mapping/bulk
 * Bulk faculty mapping
 */
router.post(
  '/faculty-mapping/bulk',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.bulkFacultyMapping(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/faculty-mapping/:facultyId/:academicYear
 * Get faculty mapping
 */
router.get(
  '/faculty-mapping/:facultyId/:academicYear',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.getFacultyMapping(
        req.params.facultyId,
        req.params.academicYear
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// STUDENT MAPPING ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/student-mapping
 * Create student mapping
 */
router.post(
  '/student-mapping',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.createStudentMapping(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/accreditation/student-mapping/bulk
 * Bulk student mapping
 */
router.post(
  '/student-mapping/bulk',
  authenticate,
  requirePermission('CREATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.bulkStudentMapping(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/student-mapping/:studentId/:academicYear
 * Get student mapping
 */
router.get(
  '/student-mapping/:studentId/:academicYear',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.getStudentMapping(
        req.params.studentId,
        req.params.academicYear
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// REPORT ENDPOINTS
// ============================================================================

/**
 * POST /api/accreditation/reports/generate
 * Generate accreditation report
 */
router.post(
  '/reports/generate',
  authenticate,
  requirePermission('CREATE', 'REPORT'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await accreditationService.generateReport(userId, req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/reports/:id
 * Get report
 */
router.get('/reports/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getReport(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/reports
 * List reports
 */
router.get('/reports', authenticate, async (req: Request, res: Response) => {
  try {
    const filters = {
      bodyType: req.query.bodyType as string,
      academicYear: req.query.academicYear as string,
    };

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await accreditationService.listReports(filters, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// ALERT ENDPOINTS
// ============================================================================

/**
 * GET /api/accreditation/alerts
 * Get active alerts
 */
router.get('/alerts', authenticate, async (req: Request, res: Response) => {
  try {
    const filters = {
      severity: req.query.severity as string,
    };

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await accreditationService.getAlerts(filters, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/accreditation/alerts/:id/resolve
 * Resolve alert
 */
router.post(
  '/alerts/:id/resolve',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await accreditationService.resolveAlert(
        req.params.id,
        userId,
        req.body.resolutionNotes
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/accreditation/alerts/check-missing-evidence
 * Check for missing evidence and create alerts
 */
router.post(
  '/alerts/check-missing-evidence',
  authenticate,
  requirePermission('UPDATE', 'ACCREDITATION'),
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.checkMissingEvidence();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// DASHBOARD & ANALYTICS ENDPOINTS
// ============================================================================

/**
 * GET /api/accreditation/dashboard/stats
 * Get dashboard statistics
 */
router.get('/dashboard/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getAccreditationDashboardStats();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/accreditation/metrics/:bodyType/:academicYear
 * Get compliance metrics
 */
router.get(
  '/metrics/:bodyType/:academicYear',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await accreditationService.getComplianceMetrics(
        req.params.bodyType,
        req.params.academicYear
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/accreditation/alerts/summary
 * Get alert summary
 */
router.get('/alerts/summary', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await accreditationService.getAlertSummary();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
