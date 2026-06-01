// src/services/task-reports.service.ts
// Task Analytics and Reporting Service

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// TASK ANALYTICS REPORTS
// ============================================================================

/**
 * Generate comprehensive task completion report
 */
export const generateTaskCompletionReport = async (filters?: {
  departmentId?: string;
  fromDate?: Date;
  toDate?: Date;
  taskType?: string;
}) => {
  try {
    const whereClause: any = {};

    if (filters?.fromDate || filters?.toDate) {
      whereClause.dueDate = {};
      if (filters.fromDate) whereClause.dueDate.gte = filters.fromDate;
      if (filters.toDate) whereClause.dueDate.lte = filters.toDate;
    }

    if (filters?.taskType) whereClause.taskType = filters.taskType;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignments: { include: { assignedTo: true } },
      },
    });

    // Calculate metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const onTimeTasks = tasks.filter(
      (t) =>
        t.status === 'COMPLETED' &&
        t.completionDate &&
        t.completionDate <= t.dueDate
    ).length;

    const report = {
      generatedAt: new Date(),
      period: {
        from: filters?.fromDate,
        to: filters?.toDate,
      },
      summary: {
        totalTasks,
        completedTasks,
        pendingTasks: tasks.filter((t) => t.status !== 'COMPLETED').length,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        onTimeCompletionRate:
          completedTasks > 0 ? Math.round((onTimeTasks / completedTasks) * 100) : 0,
      },
      byStatus: tasks.reduce((acc: any, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc: any, task) => {
        acc[task.priority] = (acc[task.priority] || 0) + 1;
        return acc;
      }, {}),
      byType: tasks.reduce((acc: any, task) => {
        acc[task.taskType] = (acc[task.taskType] || 0) + 1;
        return acc;
      }, {}),
      byCreator: tasks.reduce((acc: any, task) => {
        const creatorName = `${task.createdBy.firstName} ${task.createdBy.lastName}`;
        if (!acc[creatorName]) {
          acc[creatorName] = { total: 0, completed: 0 };
        }
        acc[creatorName].total++;
        if (task.status === 'COMPLETED') acc[creatorName].completed++;
        return acc;
      }, {}),
    };

    return { success: true, report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Generate escalation analysis report
 */
export const generateEscalationReport = async (filters?: {
  fromDate?: Date;
  toDate?: Date;
}) => {
  try {
    const whereClause: any = { isEscalated: true };

    if (filters?.fromDate || filters?.toDate) {
      whereClause.createdAt = {};
      if (filters.fromDate) whereClause.createdAt.gte = filters.fromDate;
      if (filters.toDate) whereClause.createdAt.lte = filters.toDate;
    }

    const escalatedTasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        escalations: {
          include: {
            escalatedBy: { select: { firstName: true, lastName: true } },
            targetUser: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const escalations = await prisma.taskEscalation.findMany({
      where: filters?.fromDate || filters?.toDate
        ? {
            createdAt: {
              gte: filters.fromDate,
              lte: filters.toDate,
            },
          }
        : {},
      include: {
        task: { select: { title: true, priority: true } },
        escalatedBy: { select: { firstName: true, lastName: true } },
      },
    });

    const report = {
      generatedAt: new Date(),
      summary: {
        totalEscalations: escalations.length,
        escalatedTasks: escalatedTasks.length,
        averageEscalationLevel:
          escalations.length > 0
            ? (escalations.reduce((sum, e) => sum + e.escalationLevel, 0) /
                escalations.length)
                .toFixed(2)
            : 0,
      },
      byLevel: escalations.reduce((acc: any, e) => {
        acc[e.escalationLevel] = (acc[e.escalationLevel] || 0) + 1;
        return acc;
      }, {}),
      byReason: escalations.reduce((acc: any, e) => {
        const reason = e.escalationReason || 'Not specified';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {}),
      topEscalators: escalations
        .map((e) => `${e.escalatedBy.firstName} ${e.escalatedBy.lastName}`)
        .reduce((acc: any, name) => {
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {}),
    };

    return { success: true, report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Generate approval bottleneck report
 */
export const generateApprovalReport = async (filters?: {
  fromDate?: Date;
  toDate?: Date;
}) => {
  try {
    const approvals = await prisma.taskApproval.findMany({
      where: filters?.fromDate || filters?.toDate
        ? {
            createdAt: {
              gte: filters.fromDate,
              lte: filters.toDate,
            },
          }
        : {},
      include: {
        approver: { select: { firstName: true, lastName: true } },
        task: { select: { title: true } },
      },
    });

    const pendingApprovals = approvals.filter((a) => a.approvalStatus === 'PENDING');

    const report = {
      generatedAt: new Date(),
      summary: {
        totalApprovals: approvals.length,
        approved: approvals.filter((a) => a.approvalStatus === 'APPROVED').length,
        rejected: approvals.filter((a) => a.approvalStatus === 'REJECTED').length,
        pending: pendingApprovals.length,
        averageApprovalTime: calculateAverageApprovalTime(approvals),
      },
      bottlenecks: approvals
        .map((a) => `${a.approver.firstName} ${a.approver.lastName}`)
        .reduce((acc: any, name) => {
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {}),
      pendingApprovals: pendingApprovals.map((a) => ({
        taskTitle: a.task.title,
        approver: `${a.approver.firstName} ${a.approver.lastName}`,
        pendingDays: Math.floor(
          (new Date().getTime() - a.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    };

    return { success: true, report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Generate performance report by user/department
 */
export const generatePerformanceReport = async (filters?: {
  departmentId?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
}) => {
  try {
    const whereClause: any = {};

    if (filters?.userId) whereClause.createdById = filters.userId;

    if (filters?.fromDate || filters?.toDate) {
      whereClause.dueDate = {};
      if (filters.fromDate) whereClause.dueDate.gte = filters.fromDate;
      if (filters.toDate) whereClause.dueDate.lte = filters.toDate;
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        assignments: { include: { assignedTo: true } },
      },
    });

    const userPerformance = tasks.reduce((acc: any, task) => {
      const creatorName = `${task.createdBy.firstName} ${task.createdBy.lastName}`;

      if (!acc[creatorName]) {
        acc[creatorName] = {
          tasksCreated: 0,
          tasksCompleted: 0,
          tasksOverdue: 0,
          averageCompletionDays: 0,
          escalationCount: 0,
        };
      }

      acc[creatorName].tasksCreated++;

      if (task.status === 'COMPLETED') {
        acc[creatorName].tasksCompleted++;
        if (task.completionDate && task.dueDate) {
          const days = Math.floor(
            (task.completionDate.getTime() - task.dueDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          acc[creatorName].averageCompletionDays += days;
        }
      }

      if (task.dueDate < new Date() && task.status !== 'COMPLETED') {
        acc[creatorName].tasksOverdue++;
      }

      if (task.isEscalated) {
        acc[creatorName].escalationCount++;
      }

      return acc;
    }, {});

    // Calculate averages
    Object.keys(userPerformance).forEach((user) => {
      if (userPerformance[user].tasksCompleted > 0) {
        userPerformance[user].averageCompletionDays = Math.round(
          userPerformance[user].averageCompletionDays / userPerformance[user].tasksCompleted
        );
      }
    });

    const report = {
      generatedAt: new Date(),
      userPerformance,
      topPerformers: Object.entries(userPerformance)
        .sort(
          (a: any, b: any) =>
            (b[1].tasksCompleted / b[1].tasksCreated || 0) -
            (a[1].tasksCompleted / a[1].tasksCreated || 0)
        )
        .slice(0, 5),
      needsSupport: Object.entries(userPerformance)
        .filter(
          ([_, perf]: any) =>
            perf.tasksOverdue > 0 || perf.escalationCount > (perf.tasksCreated * 0.2)
        )
        .slice(0, 5),
    };

    return { success: true, report };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

/**
 * Export report to CSV format
 */
export const exportReportToCSV = (report: any, reportType: string): string => {
  try {
    let csvContent = '';

    switch (reportType) {
      case 'completion':
        csvContent = formatCompletionReportCSV(report);
        break;
      case 'escalation':
        csvContent = formatEscalationReportCSV(report);
        break;
      case 'approval':
        csvContent = formatApprovalReportCSV(report);
        break;
      case 'performance':
        csvContent = formatPerformanceReportCSV(report);
        break;
    }

    return csvContent;
  } catch (error) {
    throw new Error('Failed to export report');
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const calculateAverageApprovalTime = (approvals: any[]): number => {
  const approvedApprovals = approvals.filter((a) => a.approvedAt);
  if (approvedApprovals.length === 0) return 0;

  const totalTime = approvedApprovals.reduce((sum, approval) => {
    return sum + (approval.approvedAt.getTime() - approval.createdAt.getTime());
  }, 0);

  return Math.round(totalTime / approvedApprovals.length / (1000 * 60 * 60 * 24)); // Convert to days
};

const formatCompletionReportCSV = (report: any): string => {
  let csv = 'Task Completion Report\n\n';
  csv += `Generated: ${report.generatedAt}\n\n`;
  csv += 'Summary\n';
  csv += `Total Tasks,${report.summary.totalTasks}\n`;
  csv += `Completed,${report.summary.completedTasks}\n`;
  csv += `Pending,${report.summary.pendingTasks}\n`;
  csv += `Completion Rate,${report.summary.completionRate}%\n`;
  csv += `On-Time Rate,${report.summary.onTimeCompletionRate}%\n\n`;

  csv += 'By Status\n';
  Object.entries(report.byStatus).forEach(([status, count]) => {
    csv += `${status},${count}\n`;
  });

  csv += '\nBy Priority\n';
  Object.entries(report.byPriority).forEach(([priority, count]) => {
    csv += `${priority},${count}\n`;
  });

  csv += '\nBy Type\n';
  Object.entries(report.byType).forEach(([type, count]) => {
    csv += `${type},${count}\n`;
  });

  return csv;
};

const formatEscalationReportCSV = (report: any): string => {
  let csv = 'Escalation Report\n\n';
  csv += `Generated: ${report.generatedAt}\n\n`;
  csv += 'Summary\n';
  csv += `Total Escalations,${report.summary.totalEscalations}\n`;
  csv += `Escalated Tasks,${report.summary.escalatedTasks}\n`;
  csv += `Avg Escalation Level,${report.summary.averageEscalationLevel}\n\n`;

  csv += 'Top Escalators\n';
  Object.entries(report.topEscalators).forEach(([name, count]) => {
    csv += `${name},${count}\n`;
  });

  return csv;
};

const formatApprovalReportCSV = (report: any): string => {
  let csv = 'Approval Report\n\n';
  csv += `Generated: ${report.generatedAt}\n\n`;
  csv += 'Summary\n';
  csv += `Total Approvals,${report.summary.totalApprovals}\n`;
  csv += `Approved,${report.summary.approved}\n`;
  csv += `Rejected,${report.summary.rejected}\n`;
  csv += `Pending,${report.summary.pending}\n`;
  csv += `Avg Approval Time (days),${report.summary.averageApprovalTime}\n`;

  return csv;
};

const formatPerformanceReportCSV = (report: any): string => {
  let csv = 'Performance Report\n\n';
  csv += `Generated: ${report.generatedAt}\n\n`;
  csv += 'User Performance\n';
  csv +=
    'Name,Tasks Created,Tasks Completed,Tasks Overdue,Avg Completion Days,Escalations\n';

  Object.entries(report.userPerformance).forEach(([name, perf]: any) => {
    csv += `${name},${perf.tasksCreated},${perf.tasksCompleted},${perf.tasksOverdue},${perf.averageCompletionDays},${perf.escalationCount}\n`;
  });

  return csv;
};
