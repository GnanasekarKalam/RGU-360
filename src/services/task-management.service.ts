// src/services/task-management.service.ts
// Task Management Module Service - Enterprise Implementation

import { PrismaClient } from '@prisma/client';
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  AssignTaskRequest,
  UpdateAssignmentRequest,
  CreateTaskGroupRequest,
  SubmitTaskEvidenceRequest,
  ApproveTaskRequest,
  EscalateTaskRequest,
  TaskDashboardStats,
  TaskFilters,
  TaskMetrics,
  UserTaskStats,
} from '../types/task-management.types';

const prisma = new PrismaClient();

// ============================================================================
// TASK CREATION AND MANAGEMENT
// ============================================================================

export const createTask = async (
  createdById: string,
  createdByRole: string,
  data: CreateTaskRequest
) => {
  try {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        priority: data.priority,
        dueDate: new Date(data.dueDate),
        createdById,
        createdByRole,
        requiresApproval: data.requiresApproval || false,
        category: data.category,
        tags: data.tags || [],
      },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    return { success: true, message: 'Task created successfully', task };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTask = async (taskId: string) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        assignments: {
          include: {
            assignedTo: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        approvals: {
          include: {
            approver: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        evidence: {
          include: {
            submittedBy: { select: { firstName: true, lastName: true } },
            verifier: { select: { firstName: true, lastName: true } },
          },
        },
        comments: {
          include: {
            commentedBy: { select: { firstName: true, lastName: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        escalations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    return { success: true, task };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateTask = async (taskId: string, data: UpdateTaskRequest) => {
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        progressPercentage: data.progressPercentage,
      },
    });

    return { success: true, message: 'Task updated successfully', task };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTasks = async (filters: TaskFilters, limit = 20, offset = 0) => {
  try {
    const whereClause: any = {};

    if (filters.status) whereClause.status = filters.status;
    if (filters.priority) whereClause.priority = filters.priority;
    if (filters.taskType) whereClause.taskType = filters.taskType;
    if (filters.isEscalated !== undefined) whereClause.isEscalated = filters.isEscalated;

    if (filters.fromDate || filters.toDate) {
      whereClause.dueDate = {};
      if (filters.fromDate) whereClause.dueDate.gte = new Date(filters.fromDate);
      if (filters.toDate) whereClause.dueDate.lte = new Date(filters.toDate);
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        assignments: { take: 5 },
        escalations: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.task.count({ where: whereClause });

    return { success: true, tasks, total, limit, offset };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TASK ASSIGNMENT
// ============================================================================

export const assignTask = async (
  taskId: string,
  data: AssignTaskRequest
) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    const assignment = await prisma.taskAssignment.create({
      data: {
        taskId,
        assignedToId: data.assignedToId,
        assignedToType: data.assignedToType,
        individualDueDate: data.individualDueDate
          ? new Date(data.individualDueDate)
          : null,
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    // Create notification
    await createNotification(
      taskId,
      data.assignedToId,
      `Task "${task.title}" assigned to you`,
      `You have been assigned a new task: ${task.title}. Due date: ${task.dueDate.toDateString()}`,
      'ASSIGNMENT'
    );

    // Update task status
    await prisma.task.update({
      where: { id: taskId },
      data: { status: 'ASSIGNED' },
    });

    return { success: true, message: 'Task assigned successfully', assignment };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const assignTaskToGroup = async (taskId: string, groupId: string) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    const group = await prisma.taskGroup.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!task || !group) {
      return { success: false, message: 'Task or Group not found' };
    }

    const groupAssignment = await prisma.taskGroupAssignment.create({
      data: { taskId, groupId },
    });

    // Notify all group members
    for (const member of group.members) {
      await createNotification(
        taskId,
        member.memberId,
        `Group Task: "${task.title}"`,
        `Your group has been assigned a task: ${task.title}`,
        'ASSIGNMENT'
      );
    }

    return { success: true, message: 'Task assigned to group', groupAssignment };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateAssignment = async (
  assignmentId: string,
  data: UpdateAssignmentRequest
) => {
  try {
    const assignment = await prisma.taskAssignment.update({
      where: { id: assignmentId },
      data: {
        assignmentStatus: data.assignmentStatus,
        progressPercentage: data.progressPercentage,
        progressNotes: data.progressNotes,
      },
    });

    return { success: true, message: 'Assignment updated', assignment };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getAssignmentsForUser = async (
  userId: string,
  status?: string,
  limit = 20,
  offset = 0
) => {
  try {
    const whereClause: any = { assignedToId: userId };
    if (status) whereClause.assignmentStatus = status;

    const assignments = await prisma.taskAssignment.findMany({
      where: whereClause,
      include: {
        task: {
          include: {
            createdBy: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { task: { dueDate: 'asc' } },
      take: limit,
      skip: offset,
    });

    const total = await prisma.taskAssignment.count({ where: whereClause });

    return { success: true, assignments, total };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TASK GROUPS
// ============================================================================

export const createTaskGroup = async (data: CreateTaskGroupRequest) => {
  try {
    const group = await prisma.taskGroup.create({
      data: {
        name: data.name,
        description: data.description,
        groupType: data.groupType,
        departmentId: data.departmentId,
        createdById: 'system', // Should be current user ID
      },
    });

    // Add members if provided
    if (data.memberIds && data.memberIds.length > 0) {
      await prisma.taskGroupMember.createMany({
        data: data.memberIds.map((memberId) => ({
          groupId: group.id,
          memberId,
          memberType: 'FACULTY', // Can be dynamic
        })),
      });
    }

    return { success: true, message: 'Task group created', group };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTaskGroup = async (groupId: string) => {
  try {
    const group = await prisma.taskGroup.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            member: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!group) {
      return { success: false, message: 'Group not found' };
    }

    return { success: true, group };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const addMembersToGroup = async (groupId: string, memberIds: string[]) => {
  try {
    await prisma.taskGroupMember.createMany({
      data: memberIds.map((memberId) => ({
        groupId,
        memberId,
        memberType: 'FACULTY',
      })),
      skipDuplicates: true,
    });

    return { success: true, message: 'Members added to group' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TASK EVIDENCE AND SUBMISSION
// ============================================================================

export const submitEvidence = async (
  taskId: string,
  submittedById: string,
  data: SubmitTaskEvidenceRequest
) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    const evidence = await prisma.taskEvidence.create({
      data: {
        taskId,
        submittedById,
        title: data.title,
        description: data.description,
        evidenceType: data.evidenceType,
        fileUrl: data.fileUrl,
        externalLink: data.externalLink,
        textContent: data.textContent,
      },
    });

    // Update task status if all evidence submitted
    if (task.requiresApproval) {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    return { success: true, message: 'Evidence submitted successfully', evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTaskEvidence = async (taskId: string) => {
  try {
    const evidence = await prisma.taskEvidence.findMany({
      where: { taskId },
      include: {
        submittedBy: { select: { firstName: true, lastName: true } },
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
  verifiedBy: string,
  isVerified: boolean,
  comments?: string
) => {
  try {
    const evidence = await prisma.taskEvidence.update({
      where: { id: evidenceId },
      data: {
        isVerified,
        verifiedBy,
        verifiedAt: new Date(),
        verificationComments: comments,
      },
    });

    return { success: true, message: 'Evidence verified', evidence };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TASK APPROVAL WORKFLOW
// ============================================================================

export const createApprovalRequest = async (
  taskId: string,
  approverUserId: string,
  approvalType = 'MANUAL'
) => {
  try {
    const approval = await prisma.taskApproval.create({
      data: {
        taskId,
        approverUserId,
        approvalType,
      },
    });

    const task = await prisma.task.findUnique({ where: { id: taskId } });

    // Create notification
    await createNotification(
      taskId,
      approverUserId,
      'Task Approval Required',
      `Please review and approve task: ${task?.title}`,
      'APPROVAL'
    );

    return { success: true, message: 'Approval request created', approval };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const approveTask = async (
  approvalId: string,
  approverUserId: string,
  data: ApproveTaskRequest
) => {
  try {
    const approval = await prisma.taskApproval.update({
      where: { id: approvalId },
      data: {
        approvalStatus: data.approvalStatus,
        approvalComments: data.approvalComments,
        approvedAt: new Date(),
      },
    });

    const task = await prisma.task.findUnique({ where: { id: approval.taskId } });

    // Update task approval status
    await prisma.task.update({
      where: { id: approval.taskId },
      data: {
        approvalStatus: data.approvalStatus,
      },
    });

    // Notify creator
    if (task) {
      await createNotification(
        approval.taskId,
        task.createdById,
        `Task ${data.approvalStatus.toLowerCase()}`,
        `Your task "${task.title}" has been ${data.approvalStatus.toLowerCase()}. ${
          data.approvalComments ? `Comments: ${data.approvalComments}` : ''
        }`,
        'APPROVAL'
      );
    }

    return { success: true, message: `Task ${data.approvalStatus.toLowerCase()}`, approval };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getPendingApprovals = async (userId: string) => {
  try {
    const approvals = await prisma.taskApproval.findMany({
      where: {
        approverUserId: userId,
        approvalStatus: 'PENDING',
      },
      include: {
        task: {
          include: {
            createdBy: { select: { firstName: true, lastName: true } },
            evidence: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return { success: true, approvals };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// TASK ESCALATION
// ============================================================================

export const escalateTask = async (
  taskId: string,
  escalatedById: string,
  data: EscalateTaskRequest
) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return { success: false, message: 'Task not found' };
    }

    // Get escalation matrix
    const matrix = await prisma.taskEscalationMatrix.findFirst({
      where: {
        taskType: task.taskType,
        priority: task.priority,
      },
    });

    const escalationLevel = task.escalationLevel + 1;
    let targetUserId = data.targetUserId;

    if (!targetUserId && matrix) {
      if (escalationLevel === 1) targetUserId = matrix.level1UserId || undefined;
      else if (escalationLevel === 2) targetUserId = matrix.level2UserId || undefined;
      else if (escalationLevel === 3) targetUserId = matrix.level3UserId || undefined;
    }

    const escalation = await prisma.taskEscalation.create({
      data: {
        taskId,
        escalatedById,
        escalationReason: data.escalationReason,
        escalationLevel,
        targetUserId,
      },
    });

    // Update task
    await prisma.task.update({
      where: { id: taskId },
      data: {
        isEscalated: true,
        escalationLevel,
      },
    });

    // Create notification
    if (targetUserId) {
      await createNotification(
        taskId,
        targetUserId,
        'Task Escalated',
        `Task "${task.title}" has been escalated. Reason: ${data.escalationReason}`,
        'ESCALATION'
      );
    }

    return { success: true, message: 'Task escalated successfully', escalation };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTaskEscalations = async (taskId: string) => {
  try {
    const escalations = await prisma.taskEscalation.findMany({
      where: { taskId },
      include: {
        escalatedBy: { select: { firstName: true, lastName: true } },
        targetUser: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, escalations };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const createNotification = async (
  taskId: string,
  recipientId: string,
  title: string,
  message: string,
  notificationType: string
) => {
  try {
    const notification = await prisma.taskNotification.create({
      data: {
        taskId,
        recipientId,
        title,
        message,
        notificationType,
      },
    });

    return { success: true, notification };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getNotifications = async (userId: string, unreadOnly = false) => {
  try {
    const whereClause: any = { recipientId: userId };
    if (unreadOnly) whereClause.isRead = false;

    const notifications = await prisma.taskNotification.findMany({
      where: whereClause,
      include: {
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, notifications };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await prisma.taskNotification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    });

    return { success: true, message: 'Notification marked as read' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// DASHBOARD ANALYTICS
// ============================================================================

export const getTaskDashboardStats = async (
  userId?: string
): Promise<TaskDashboardStats | any> => {
  try {
    const whereClause: any = {};
    if (userId) whereClause.createdById = userId;

    const tasks = await prisma.task.findMany({ where: whereClause });

    const stats: TaskDashboardStats = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((t) => t.status === 'PENDING').length,
      inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      completedTasks: tasks.filter((t) => t.status === 'COMPLETED').length,
      overdueTasks: tasks.filter(
        (t) => t.dueDate < new Date() && t.status !== 'COMPLETED'
      ).length,
      escalatedTasks: tasks.filter((t) => t.isEscalated).length,
      averageCompletionTime: 0,
      taskCompletionRate: 0,
      approvalPendingCount: 0,
      evidenceSubmitted: 0,
    };

    // Calculate completion rate
    if (stats.totalTasks > 0) {
      stats.taskCompletionRate = Math.round(
        (stats.completedTasks / stats.totalTasks) * 100
      );
    }

    // Get pending approvals
    const pendingApprovals = await prisma.taskApproval.count({
      where: { approvalStatus: 'PENDING' },
    });
    stats.approvalPendingCount = pendingApprovals;

    // Get evidence submissions
    const evidenceCount = await prisma.taskEvidence.count({});
    stats.evidenceSubmitted = evidenceCount;

    return { success: true, stats };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getUserTaskStats = async (userId: string): Promise<UserTaskStats | any> => {
  try {
    const assignments = await prisma.taskAssignment.findMany({
      where: { assignedToId: userId },
      include: { task: true },
    });

    const stats: UserTaskStats = {
      userId,
      tasksAssigned: assignments.length,
      tasksCompleted: assignments.filter((a) => a.assignmentStatus === 'COMPLETED').length,
      tasksInProgress: assignments.filter((a) => a.assignmentStatus === 'IN_PROGRESS').length,
      overdueTasks: assignments.filter(
        (a) =>
          (a.individualDueDate || a.task.dueDate) < new Date() &&
          a.assignmentStatus !== 'COMPLETED'
      ).length,
      averageCompletionTime: 0,
      acceptanceRate: 0,
    };

    if (stats.tasksAssigned > 0) {
      stats.acceptanceRate = Math.round(
        (assignments.filter((a) => a.acceptanceStatus === 'ACCEPTED').length /
          stats.tasksAssigned) *
          100
      );
    }

    return { success: true, stats };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const getTaskMetrics = async (filters?: TaskFilters): Promise<TaskMetrics | any> => {
  try {
    const whereClause: any = {};
    if (filters?.taskType) whereClause.taskType = filters.taskType;
    if (filters?.priority) whereClause.priority = filters.priority;

    const tasks = await prisma.task.findMany({ where: whereClause });
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

    const metrics: TaskMetrics = {
      totalAssigned: tasks.length,
      totalCompleted: completedTasks.length,
      averageCompletionDays: 0,
      onTimeCompletionRate: 0,
      tasksByPriority: {},
      tasksByStatus: {},
      tasksByType: {},
      escalationRate: 0,
      approvalApprovedRate: 0,
    };

    // Calculate by priority
    tasks.forEach((task) => {
      metrics.tasksByPriority[task.priority] =
        (metrics.tasksByPriority[task.priority] || 0) + 1;
      metrics.tasksByStatus[task.status] = (metrics.tasksByStatus[task.status] || 0) + 1;
      metrics.tasksByType[task.taskType] = (metrics.tasksByType[task.taskType] || 0) + 1;
    });

    // Calculate on-time completion
    if (completedTasks.length > 0) {
      const onTimeTasks = completedTasks.filter(
        (t) => t.completionDate && t.completionDate <= t.dueDate
      ).length;
      metrics.onTimeCompletionRate = Math.round(
        (onTimeTasks / completedTasks.length) * 100
      );
    }

    // Calculate escalation rate
    const escalatedTasks = tasks.filter((t) => t.isEscalated).length;
    metrics.escalationRate = Math.round((escalatedTasks / tasks.length) * 100) || 0;

    return { success: true, metrics };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
