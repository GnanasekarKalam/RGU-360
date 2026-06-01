// src/types/task-management.types.ts
// Task Management Module Types and Interfaces

export interface Task {
  id: string;
  title: string;
  description?: string;
  taskType: 'GENERAL' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'RESEARCH';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  createdById: string;
  createdByRole: string;
  dueDate: Date;
  completionDate?: Date;
  progressPercentage: number;
  requiresApproval: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isEscalated: boolean;
  escalationLevel: number;
  category?: string;
  tags: string[];
  isTemplate: boolean;
  templateName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  assignedToId: string;
  assignedToType: 'FACULTY' | 'STUDENT' | 'GROUP';
  assignmentDate: Date;
  acceptanceDate?: Date;
  completionDate?: Date;
  assignmentStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  acceptanceStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  progressPercentage: number;
  progressNotes?: string;
  individualDueDate?: Date;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskGroup {
  id: string;
  name: string;
  description?: string;
  groupType: 'FACULTY_GROUP' | 'STUDENT_GROUP' | 'CLASS_GROUP' | 'DEPARTMENT_GROUP';
  departmentId?: string;
  createdById: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskGroupMember {
  id: string;
  groupId: string;
  memberId: string;
  memberType: 'FACULTY' | 'STUDENT';
  createdAt: Date;
}

export interface TaskApproval {
  id: string;
  taskId: string;
  approverUserId: string;
  approvalRequired: boolean;
  approvalType: 'AUTOMATIC' | 'MANUAL' | 'CONDITIONAL';
  approvalLevel: number;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AWAITING_REVISION';
  approvedAt?: Date;
  approvalComments?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskEvidence {
  id: string;
  taskId: string;
  submittedById: string;
  title: string;
  description?: string;
  evidenceType: 'FILE' | 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  externalLink?: string;
  textContent?: string;
  uploadedAt: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationComments?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  commentedById: string;
  content: string;
  commentType: 'GENERAL' | 'UPDATE' | 'FEEDBACK' | 'QUESTION';
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskNotification {
  id: string;
  taskId: string;
  recipientId: string;
  title: string;
  message: string;
  notificationType: 'ASSIGNMENT' | 'APPROVAL' | 'COMPLETION' | 'OVERDUE' | 'ESCALATION' | 'COMMENT';
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface TaskEscalation {
  id: string;
  taskId: string;
  escalatedById: string;
  escalationReason: string;
  escalationLevel: number;
  targetUserId?: string;
  escalationStatus: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'REJECTED';
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskEscalationMatrix {
  id: string;
  taskType: string;
  priority: string;
  departmentId?: string;
  level1UserId?: string;
  level2UserId?: string;
  level3UserId?: string;
  escalateAfterDaysOverdue: number;
  escalateOnProgressZero: boolean;
  escalateOnNoUpdate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  taskType: string;
  priority: string;
  defaultDuration?: number;
  requiresApproval: boolean;
  requiresEvidence: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response Types

export interface CreateTaskRequest {
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  dueDate: Date;
  requiresApproval?: boolean;
  category?: string;
  tags?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date;
  progressPercentage?: number;
}

export interface AssignTaskRequest {
  assignedToId: string;
  assignedToType: 'FACULTY' | 'STUDENT' | 'GROUP';
  individualDueDate?: Date;
}

export interface UpdateAssignmentRequest {
  assignmentStatus?: string;
  progressPercentage?: number;
  progressNotes?: string;
}

export interface CreateTaskGroupRequest {
  name: string;
  description?: string;
  groupType: string;
  departmentId?: string;
  memberIds?: string[];
}

export interface SubmitTaskEvidenceRequest {
  title: string;
  description?: string;
  evidenceType: string;
  fileUrl?: string;
  externalLink?: string;
  textContent?: string;
}

export interface ApproveTaskRequest {
  approvalStatus: 'APPROVED' | 'REJECTED';
  approvalComments?: string;
}

export interface EscalateTaskRequest {
  escalationReason: string;
  targetUserId?: string;
}

export interface TaskDashboardStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  escalatedTasks: number;
  averageCompletionTime: number;
  taskCompletionRate: number;
  approvalPendingCount: number;
  evidenceSubmitted: number;
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  taskType?: string;
  assignedTo?: string;
  createdBy?: string;
  fromDate?: Date;
  toDate?: Date;
  isEscalated?: boolean;
}

export interface TaskMetrics {
  totalAssigned: number;
  totalCompleted: number;
  averageCompletionDays: number;
  onTimeCompletionRate: number;
  tasksByPriority: { [key: string]: number };
  tasksByStatus: { [key: string]: number };
  tasksByType: { [key: string]: number };
  escalationRate: number;
  approvalApprovedRate: number;
}

export interface UserTaskStats {
  userId: string;
  tasksAssigned: number;
  tasksCompleted: number;
  tasksInProgress: number;
  overdueTasks: number;
  averageCompletionTime: number;
  acceptanceRate: number;
}

export interface TaskNotificationPayload {
  title: string;
  message: string;
  notificationType: string;
  taskId: string;
  recipients: string[];
}
