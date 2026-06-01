// src/routes/task-management.routes.ts
// Task Management Module Routes - Enterprise API

import { Router, Request, Response } from 'express';
import { authenticate, requirePermission } from '../middleware/auth-complete.middleware';
import * as taskService from '../services/task-management.service';

const router = Router();

// ============================================================================
// TASK MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks
 * Create a new task
 * Permissions: HOD, FACULTY, ADMIN
 */
router.post(
  '/',
  authenticate,
  requirePermission('CREATE', 'TASK'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.primaryRole;

      const result = await taskService.createTask(userId, userRole, req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/tasks/:id
 * Get task details
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await taskService.getTask(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/tasks/:id
 * Update task
 * Permissions: Creator, HOD, ADMIN
 */
router.put(
  '/:id',
  authenticate,
  requirePermission('UPDATE', 'TASK'),
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.updateTask(req.params.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/tasks
 * Get tasks with filters
 * Query params: status, priority, taskType, assignedTo, createdBy, fromDate, toDate
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      priority: req.query.priority as string,
      taskType: req.query.taskType as string,
      assignedTo: req.query.assignedTo as string,
      createdBy: req.query.createdBy as string,
      fromDate: req.query.fromDate ? new Date(req.query.fromDate as string) : undefined,
      toDate: req.query.toDate ? new Date(req.query.toDate as string) : undefined,
      isEscalated: req.query.isEscalated === 'true',
    };

    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await taskService.getTasks(filters, limit, offset);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================================================
// TASK ASSIGNMENT ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks/:id/assign
 * Assign task to user/student
 * Permissions: HOD, ADMIN, Task Creator
 */
router.post(
  '/:id/assign',
  authenticate,
  requirePermission('ASSIGN', 'TASK'),
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.assignTask(req.params.id, req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/tasks/:id/assign-group
 * Assign task to group
 */
router.post(
  '/:id/assign-group',
  authenticate,
  requirePermission('ASSIGN', 'TASK'),
  async (req: Request, res: Response) => {
    try {
      const { groupId } = req.body;
      const result = await taskService.assignTaskToGroup(req.params.id, groupId);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * PUT /api/tasks/assignments/:id
 * Update assignment status/progress
 */
router.put(
  '/assignments/:id',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.updateAssignment(req.params.id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/my-tasks
 * Get tasks assigned to current user
 * Query params: status, limit, offset
 */
router.get(
  '/my-tasks',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const result = await taskService.getAssignmentsForUser(
        userId,
        status,
        limit,
        offset
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// TASK GROUP ENDPOINTS
// ============================================================================

/**
 * POST /api/task-groups
 * Create task group
 * Permissions: HOD, ADMIN
 */
router.post(
  '/groups',
  authenticate,
  requirePermission('CREATE', 'TASK_GROUP'),
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.createTaskGroup(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/task-groups/:id
 * Get group details
 */
router.get('/groups/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await taskService.getTaskGroup(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/task-groups/:id/members
 * Add members to group
 */
router.post(
  '/groups/:id/members',
  authenticate,
  requirePermission('UPDATE', 'TASK_GROUP'),
  async (req: Request, res: Response) => {
    try {
      const { memberIds } = req.body;
      const result = await taskService.addMembersToGroup(req.params.id, memberIds);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// TASK EVIDENCE ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks/:id/evidence
 * Submit evidence/proof of work
 */
router.post(
  '/:id/evidence',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await taskService.submitEvidence(
        req.params.id,
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
 * GET /api/tasks/:id/evidence
 * Get all evidence for task
 */
router.get('/:id/evidence', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await taskService.getTaskEvidence(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/evidence/:id/verify
 * Verify evidence
 * Permissions: HOD, ADMIN, Approver
 */
router.post(
  '/evidence/:id/verify',
  authenticate,
  requirePermission('VERIFY', 'EVIDENCE'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { isVerified, comments } = req.body;

      const result = await taskService.verifyEvidence(
        req.params.id,
        userId,
        isVerified,
        comments
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// APPROVAL WORKFLOW ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks/:id/approval
 * Create approval request
 */
router.post(
  '/:id/approval',
  authenticate,
  requirePermission('CREATE', 'TASK_APPROVAL'),
  async (req: Request, res: Response) => {
    try {
      const { approverUserId } = req.body;
      const result = await taskService.createApprovalRequest(
        req.params.id,
        approverUserId
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * POST /api/approvals/:id/approve
 * Approve or reject task
 * Permissions: Assigned approver
 */
router.post(
  '/approvals/:id/approve',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await taskService.approveTask(req.params.id, userId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

/**
 * GET /api/my-approvals
 * Get pending approvals for current user
 */
router.get(
  '/my-approvals',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await taskService.getPendingApprovals(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// ESCALATION ENDPOINTS
// ============================================================================

/**
 * POST /api/tasks/:id/escalate
 * Escalate task
 * Permissions: HOD, FACULTY, ADMIN
 */
router.post(
  '/:id/escalate',
  authenticate,
  requirePermission('ESCALATE', 'TASK'),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const result = await taskService.escalateTask(
        req.params.id,
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
 * GET /api/tasks/:id/escalations
 * Get escalation history
 */
router.get(
  '/:id/escalations',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.getTaskEscalations(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// ============================================================================
// NOTIFICATION ENDPOINTS
// ============================================================================

/**
 * GET /api/notifications
 * Get notifications for current user
 * Query params: unreadOnly
 */
router.get('/notifications', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await taskService.getNotifications(userId, unreadOnly);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/notifications/:id/read
 * Mark notification as read
 */
router.post(
  '/notifications/:id/read',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const result = await taskService.markNotificationAsRead(req.params.id);
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
 * GET /api/tasks/dashboard/stats
 * Get task dashboard statistics
 */
router.get('/dashboard/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    const result = await taskService.getTaskDashboardStats(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/users/:id/task-stats
 * Get user task statistics
 */
router.get('/users/:id/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const result = await taskService.getUserTaskStats(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/tasks/metrics
 * Get task metrics and analytics
 */
router.get('/metrics', authenticate, async (req: Request, res: Response) => {
  try {
    const filters = {
      taskType: req.query.taskType as string,
      priority: req.query.priority as string,
    };

    const result = await taskService.getTaskMetrics(filters);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
