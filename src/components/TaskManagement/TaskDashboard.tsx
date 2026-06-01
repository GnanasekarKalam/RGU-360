// src/components/TaskManagement/TaskDashboard.tsx
// Task management dashboard with analytics and overview

import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Chart, Tabs } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import TaskBoard from './TaskBoard';

interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  escalatedTasks: number;
  taskCompletionRate: number;
  approvalPendingCount: number;
}

interface TaskDashboardProps {
  stats: DashboardStats;
  recentTasks: any[];
  metrics?: any;
  onTaskClick?: (taskId: string) => void;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({
  stats,
  recentTasks,
  metrics,
  onTaskClick,
}) => {
  const columns = [
    {
      title: 'Task',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const colors: { [key: string]: string } = {
          LOW: 'blue',
          MEDIUM: 'orange',
          HIGH: 'red',
          URGENT: 'volcano',
        };
        return <span style={{ color: colors[priority] }}>{priority}</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: Date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Progress',
      dataIndex: 'progressPercentage',
      key: 'progress',
      render: (percentage: number) => (
        <Progress percent={percentage} size="small" />
      ),
    },
  ];

  return (
    <div className="task-dashboard">
      {/* Summary Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Tasks"
              value={stats.totalTasks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed"
              value={stats.completedTasks}
              suffix={`/ ${stats.totalTasks}`}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="In Progress"
              value={stats.inProgressTasks}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Overdue/Escalated"
              value={stats.overdueTasks}
              suffix={`+${stats.escalatedTasks}`}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress and Analytics */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Task Completion Rate" bordered={false}>
            <Progress
              type="circle"
              percent={stats.taskCompletionRate}
              width={150}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Tasks by Priority" bordered={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metrics?.tasksByPriority && Object.entries(metrics.tasksByPriority).map(
                ([priority, count]: [string, any]) => (
                  <div key={priority} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{priority}</span>
                    <span style={{ fontWeight: 'bold' }}>{count}</span>
                  </div>
                )
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Tasks Table */}
      <Card title="Recent Tasks" style={{ marginBottom: '24px' }}>
        <Table
          columns={columns}
          dataSource={recentTasks}
          pagination={{ pageSize: 10 }}
          size="small"
          onRow={(record) => ({
            onClick: () => onTaskClick?.(record.id),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Approval Status */}
      {stats.approvalPendingCount > 0 && (
        <Card
          title="Pending Approvals"
          style={{
            backgroundColor: '#fff7e6',
            borderColor: '#ffc069',
          }}
        >
          <Statistic
            title="Actions Required"
            value={stats.approvalPendingCount}
            suffix="approvals pending"
            valueStyle={{ color: '#ff7a45' }}
          />
        </Card>
      )}
    </div>
  );
};

export default TaskDashboard;
