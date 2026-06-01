// src/components/Dashboards/HODDashboard.tsx
// HOD Dashboard - Premium Analytics Dashboard

import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Statistic,
  Progress,
  Table,
  Tabs,
  Tag,
  Badge,
  List,
  Empty,
  Button,
  Spin,
  DatePicker,
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  AlertOutlined,
  TrophyOutlined,
  DollarOutlined,
  BookOutlined,
  LineChartOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HODDashboardData, FacultyPerformance, StudentPerformance, RiskStudent } from '../../types/dashboard.types';
import './DashboardStyles.css';

interface HODDashboardProps {
  data: HODDashboardData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const HODDashboard: React.FC<HODDashboardProps> = ({ data, isLoading = false, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // ============================================================================
  // KPI CARDS
  // ============================================================================

  const renderKPICards = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Faculty Performance */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Faculty Performance"
            value={
              data.facultyPerformance.length > 0
                ? (
                    data.facultyPerformance.reduce((sum, f) => sum + f.performanceScore, 0) /
                    data.facultyPerformance.length
                  ).toFixed(1)
                : 0
            }
            suffix="/ 100"
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
          <div style={{ marginTop: 12 }}>
            <Progress
              percent={
                data.facultyPerformance.length > 0
                  ? (
                      data.facultyPerformance.reduce((sum, f) => sum + f.performanceScore, 0) /
                      data.facultyPerformance.length
                    ).toFixed(1)
                  : 0
              }
              size="small"
            />
          </div>
        </Card>
      </Col>

      {/* Student Performance */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Avg Student CGPA"
            value={
              data.studentPerformance.length > 0
                ? (
                    data.studentPerformance.reduce((sum, s) => sum + s.cgpa, 0) /
                    data.studentPerformance.length
                  ).toFixed(2)
                : 0
            }
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 0, fontSize: '12px', color: '#666' }}>
              Total Students: {data.studentPerformance.length}
            </p>
          </div>
        </Card>
      </Col>

      {/* Task Completion Rate */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Task Completion Rate"
            value={data.taskCompletion.completionRate}
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 0, fontSize: '12px', color: '#666' }}>
              {data.taskCompletion.completedTasks} / {data.taskCompletion.totalTasks} tasks
            </p>
          </div>
        </Card>
      </Col>

      {/* Pending Approvals */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Pending Approvals"
            value={data.pendingApprovals.totalPending}
            prefix={<AlertOutlined />}
            valueStyle={{ color: data.pendingApprovals.totalPending > 5 ? '#ff4d4f' : '#faad14' }}
          />
          <div style={{ marginTop: 12 }}>
            <p style={{ marginBottom: 0, fontSize: '12px', color: '#666' }}>
              Avg wait: {data.pendingApprovals.averageWaitingDays} days
            </p>
          </div>
        </Card>
      </Col>
    </Row>
  );

  // ============================================================================
  // FACULTY PERFORMANCE TABLE
  // ============================================================================

  const facultyColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
    {
      title: 'Tasks Completed',
      dataIndex: 'tasksCompleted',
      key: 'tasksCompleted',
      render: (text: number, record: FacultyPerformance) => (
        <span>
          {text} ({record.completionRate}%)
        </span>
      ),
    },
    {
      title: 'Research',
      dataIndex: 'researchOutput',
      key: 'research',
      render: (text: number) => <span>{text} projects</span>,
    },
    {
      title: 'Publications',
      dataIndex: 'publications',
      key: 'publications',
      render: (text: number) => <Badge color="blue" text={text} />,
    },
    {
      title: 'PhD Advisees',
      dataIndex: 'phdAdvisees',
      key: 'phd',
      render: (text: number) => <Badge color="purple" text={text} />,
    },
    {
      title: 'Performance',
      dataIndex: 'performanceScore',
      key: 'performance',
      render: (score: number) => (
        <div>
          <Progress
            type="circle"
            percent={score}
            width={40}
            strokeColor={score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'GOOD') color = 'blue';
        if (status === 'AVERAGE') color = 'orange';
        if (status === 'NEEDS_IMPROVEMENT') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // ============================================================================
  // STUDENT PERFORMANCE & RISK TABLE
  // ============================================================================

  const studentColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name', width: 150 },
    { title: 'Enrollment ID', dataIndex: 'enrollmentId', key: 'enrollmentId' },
    { title: 'CGPA', dataIndex: 'cgpa', key: 'cgpa', render: (cgpa: number) => cgpa.toFixed(2) },
    {
      title: 'Attendance',
      dataIndex: 'attendancePercentage',
      key: 'attendance',
      render: (att: number) => (
        <Progress
          type="circle"
          percent={att}
          width={40}
          strokeColor={att >= 75 ? '#52c41a' : '#ff4d4f'}
        />
      ),
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'risk',
      render: (risk: string) => {
        const colors: { [key: string]: string } = {
          LOW: 'green',
          MEDIUM: 'orange',
          HIGH: 'red',
          CRITICAL: 'volcano',
        };
        return <Tag color={colors[risk]}>{risk}</Tag>;
      },
    },
  ];

  // ============================================================================
  // RESEARCH & PUBLICATION CHARTS
  // ============================================================================

  const researchData = [
    { name: 'Active', value: data.researchMetrics.activeProjects, color: '#1890ff' },
    { name: 'Completed', value: data.researchMetrics.completedProjects, color: '#52c41a' },
  ];

  const publicationData = [
    { name: 'National Journals', value: data.publicationMetrics.nationalJournals },
    { name: 'International Journals', value: data.publicationMetrics.internationalJournals },
    { name: 'Conferences', value: data.publicationMetrics.conferences },
    { name: 'Books', value: data.publicationMetrics.books },
    { name: 'Patents', value: data.publicationMetrics.patents },
  ];

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Spin spinning={isLoading}>
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>HOD Dashboard</h1>
          <Button onClick={onRefresh}>Refresh</Button>
        </div>

        {/* KPI Cards */}
        {renderKPICards()}

        {/* Tabbed Content */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'overview',
              label: 'Overview',
              children: (
                <Row gutter={[16, 16]}>
                  {/* Task Completion */}
                  <Col xs={24} lg={12}>
                    <Card title="Task Completion Status" bordered={false}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Completed', value: data.taskCompletion.completedTasks },
                              { name: 'Pending', value: data.taskCompletion.pendingTasks },
                              { name: 'Overdue', value: data.taskCompletion.overdueTasks },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            <Cell fill="#52c41a" />
                            <Cell fill="#faad14" />
                            <Cell fill="#ff4d4f" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  {/* Research Projects */}
                  <Col xs={24} lg={12}>
                    <Card title="Research Projects Status" bordered={false}>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={researchData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {researchData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  {/* FDP Metrics */}
                  <Col xs={24} lg={12}>
                    <Card title="Faculty Development Program (FDP)" bordered={false}>
                      <List
                        dataSource={[
                          { label: 'Total FDP Programs', value: data.fdpMetrics.totalFDP },
                          { label: 'Completed', value: data.fdpMetrics.completedFDP },
                          { label: 'Upcoming', value: data.fdpMetrics.upcomingFDP },
                          { label: 'Avg Attendance', value: `${data.fdpMetrics.attendanceRate}%` },
                          { label: 'Certificates Issued', value: data.fdpMetrics.certificateIssuedCount },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta title={item.label} description={item.value} />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>

                  {/* Publication Statistics */}
                  <Col xs={24} lg={12}>
                    <Card title="Publication Statistics" bordered={false}>
                      <List
                        dataSource={publicationData}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              title={item.name}
                              description={
                                <Progress percent={(item.value / data.publicationMetrics.totalPublications) * 100} />
                              }
                            />
                            <div style={{ fontWeight: 'bold' }}>{item.value}</div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>

                  {/* Fee Collection */}
                  <Col xs={24} lg={12}>
                    <Card title="Fee Collection Status" bordered={false}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Collection Rate"
                            value={data.feeCollection.collectionPercentage}
                            suffix="%"
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Amount Collected"
                            value={`₹${(data.feeCollection.totalCollected / 100000).toFixed(1)}L`}
                            valueStyle={{ color: '#1890ff' }}
                          />
                        </Col>
                      </Row>
                      <div style={{ marginTop: 16 }}>
                        <p>
                          <strong>Fee Paid:</strong> {data.feeCollection.feePaid} students
                        </p>
                        <p>
                          <strong>Fee Pending:</strong> {data.feeCollection.feePending} students
                        </p>
                      </div>
                    </Card>
                  </Col>

                  {/* PhD Status */}
                  <Col xs={24} lg={12}>
                    <Card title="PhD Program Status" bordered={false}>
                      <List
                        dataSource={data.phdStatus}
                        renderItem={(phd, idx) => (
                          <List.Item key={idx}>
                            <List.Item.Meta
                              title={`${phd.advisorName}`}
                              description={`Registered: ${phd.registered} | Ongoing: ${phd.ongoingResearch} | Graduated: ${phd.graduated}`}
                            />
                            <Badge
                              count={phd.totalPhDStudents}
                              style={{ backgroundColor: '#52c41a' }}
                              title="Total Students"
                            />
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'faculty',
              label: 'Faculty Performance',
              children: (
                <Card bordered={false}>
                  <Table
                    columns={facultyColumns}
                    dataSource={data.facultyPerformance}
                    rowKey="facultyId"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </Card>
              ),
            },
            {
              key: 'students',
              label: 'Student Performance',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card title="Student Academic Performance" bordered={false}>
                      <Table
                        columns={studentColumns}
                        dataSource={data.studentPerformance}
                        rowKey="studentId"
                        pagination={{ pageSize: 10 }}
                        size="small"
                      />
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'risk',
              label: 'At-Risk Students',
              children: (
                <Card
                  title={`At-Risk Students (${data.riskStudents.totalRiskStudents})`}
                  bordered={false}
                >
                  {data.riskStudents.riskFactors.length === 0 ? (
                    <Empty description="No at-risk students" />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {/* Risk Summary */}
                      <Col xs={24} sm={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title="Critical Risk"
                            value={data.riskStudents.criticalRisk}
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title="High Risk"
                            value={data.riskStudents.highRisk}
                            valueStyle={{ color: '#ff7a45' }}
                          />
                        </Card>
                      </Col>
                      <Col xs={24} sm={12} lg={6}>
                        <Card size="small">
                          <Statistic
                            title="Medium Risk"
                            value={data.riskStudents.mediumRisk}
                            valueStyle={{ color: '#faad14' }}
                          />
                        </Card>
                      </Col>

                      {/* Risk Students List */}
                      <Col xs={24}>
                        <List
                          dataSource={data.riskStudents.riskFactors}
                          renderItem={(student: RiskStudent) => (
                            <List.Item
                              style={{
                                paddingLeft: 0,
                                paddingRight: 0,
                                borderBottom: '1px solid #f0f0f0',
                              }}
                            >
                              <List.Item.Meta
                                avatar={
                                  <Badge
                                    color={
                                      student.riskLevel === 'CRITICAL'
                                        ? '#ff4d4f'
                                        : student.riskLevel === 'HIGH'
                                        ? '#ff7a45'
                                        : '#faad14'
                                    }
                                    text={student.name}
                                  />
                                }
                                title={student.name}
                                description={
                                  <div>
                                    <p style={{ margin: '4px 0' }}>
                                      <strong>Enrollment:</strong> {student.enrollmentId}
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                      <strong>CGPA:</strong> {student.cgpa.toFixed(2)} | <strong>Attendance:</strong>{' '}
                                      {student.attendance}%
                                    </p>
                                    <p style={{ margin: '4px 0' }}>
                                      <strong>Risk Factors:</strong> {student.riskReasons.join(', ')}
                                    </p>
                                  </div>
                                }
                              />
                            </List.Item>
                          )}
                        />
                      </Col>
                    </Row>
                  )}
                </Card>
              ),
            },
          ]}
        />

        {/* Footer - Last Updated */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#999', fontSize: '12px' }}>
          Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
        </div>
      </div>
    </Spin>
  );
};

export default HODDashboard;
