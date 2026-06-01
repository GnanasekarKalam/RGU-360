// src/components/TaskManagement/index.ts
// Task Management Components Export

export { default as TaskBoard } from './TaskBoard';
export { default as TaskForm } from './TaskForm';
export { default as TaskDashboard } from './TaskDashboard';
export { default as TaskAssignment } from './TaskAssignment';
export { default as TaskApproval } from './TaskApproval';
export { default as EvidenceUpload } from './EvidenceUpload';
export { default as TaskNotificationCenter } from './TaskNotificationCenter';

// Export types
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  dueDate: Date;
  progressPercentage: number;
  isEscalated: boolean;
}

export interface TaskDashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  escalatedTasks: number;
  taskCompletionRate: number;
  approvalPendingCount: number;
}
