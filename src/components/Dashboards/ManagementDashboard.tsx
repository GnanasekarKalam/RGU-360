// src/components/Dashboards/ManagementDashboard.tsx
// Management Dashboard - Executive Analytics Dashboard

import React, { useState } from 'react';
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
  Tooltip,
} from 'antd';
import {
  FileTextOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  ManagementDashboardData,
  DepartmentKPIs,
  AccreditationReadiness,
  StudentProgression,
  RankingMetrics,
} from '../../types/dashboard.types';
import './DashboardStyles.css';

interface ManagementDashboardProps {
  data: ManagementDashboardData;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const ManagementDashboard: React.FC<ManagementDashboardProps> = ({ data, isLoading = false, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // ============================================================================
  // KPI METRICS CALCULATION
  // ============================================================================

  const totalFaculty = data.departmentKPIs.reduce((sum, d) => sum + d.facultyCount, 0);
  const totalStudents = data.departmentKPIs.reduce((sum, d) => sum + d.studentCount, 0);
  const avgFacultyPerformance =
    data.departmentKPIs.length > 0
      ? (data.departmentKPIs.reduce((sum, d) => sum + d.avgFacultyPerformance, 0) / data.departmentKPIs.length).toFixed(1)
      : 0;
  const totalResearchProjects = data.departmentKPIs.reduce((sum, d) => sum + d.researchProjectsCount, 0);
  const totalPublications = data.departmentKPIs.reduce((sum, d) => sum + d.publicationsCount, 0);

  // ============================================================================
  // EXECUTIVE KPI CARDS
  // ============================================================================

  const renderExecutiveKPIs = () => (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* Department KPI */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Departments"
            value={data.departmentKPIs.length}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff', fontSize: '28px' }}
          />
        </Card>
      </Col>

      {/* Total Faculty */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Total Faculty"
            value={totalFaculty}
            prefix={<TeamOutlined />}
            valueStyle={{ color: '#52c41a', fontSize: '28px' }}
          />
        </Card>
      </Col>

      {/* Total Students */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Total Students"
            value={totalStudents}
            suffix={`(Avg CGPA: ${
              data.departmentKPIs.length > 0
                ? (data.departmentKPIs.reduce((sum, d) => sum + d.avgStudentCGPA, 0) / data.departmentKPIs.length).toFixed(2)
                : 0
            })`}
            valueStyle={{ color: '#faad14', fontSize: '28px' }}
          />
        </Card>
      </Col>

      {/* Placement Rate */}
      <Col xs={24} sm={12} lg={6}>
        <Card className="kpi-card">
          <Statistic
            title="Avg Placement Rate"
            value={
              data.departmentKPIs.length > 0
                ? (data.departmentKPIs.reduce((sum, d) => sum + d.placementRate, 0) / data.departmentKPIs.length).toFixed(1)
                : 0
            }
            suffix="%"
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#13c2c2', fontSize: '28px' }}
          />
        </Card>
      </Col>
    </Row>
  );

  // ============================================================================
  // DEPARTMENT RANKINGS
  // ============================================================================

  const departmentRankings = data.departmentKPIs
    .map((dept) => ({
      ...dept,
      score:
        (dept.avgFacultyPerformance * 0.3 +
          dept.avgStudentCGPA * 10 +
          dept.placementRate * 0.5 +
          Math.min(dept.researchProjectsCount, 50)) /
        2,
    }))
    .sort((a, b) => b.score - a.score);

  // ============================================================================
  // ACCREDITATION READINESS
  // ============================================================================

  const accreditationColumns = [
    { title: 'Accreditation', dataIndex: 'accreditationType', key: 'type', width: 120 },
    { title: 'Status', dataIndex: 'currentStatus', key: 'status', width: 100 },
    {
      title: 'Completion',
      dataIndex: 'completionPercentage',
      key: 'completion',
      render: (percent: number) => (
        <Progress percent={percent} size="small" status={percent === 100 ? 'success' : 'active'} />
      ),
      width: 150,
    },
    {
      title: 'Criteria',
      dataIndex: ['criteriaCompleted', 'criteriaTotal'],
      key: 'criteria',
      render: (_, record: AccreditationReadiness) => `${record.criteriaCompleted}/${record.criteriaTotal}`,
      width: 80,
    },
    {
      title: 'Evidence',
      dataIndex: ['evidenceSubmitted', 'evidenceVerified'],
      key: 'evidence',
      render: (_, record: AccreditationReadiness) => (
        <Tag color={record.evidenceVerified > record.evidenceSubmitted * 0.8 ? 'green' : 'orange'}>
          {record.evidenceVerified}/{record.evidenceSubmitted}
        </Tag>
      ),
      width: 100,
    },
    {
      title: 'Risk',
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
      width: 80,
    },
    {
      title: 'Days Left',
      dataIndex: 'daysUntilSubmission',
      key: 'days',
      render: (days: number) => (
        <span style={{ color: days < 30 ? '#ff4d4f' : '#666' }}>
          {days} days
        </span>
      ),
      width: 80,
    },
  ];

  // ============================================================================
  // FACULTY PRODUCTIVITY CHART DATA
  // ============================================================================

  const facultyProductivityData = [
    { category: 'Avg Publications/Year', value: data.facultyProductivity.averagePublicationsPerYear },
    { category: 'Avg Research Projects', value: data.facultyProductivity.averageResearchProjectsPerFaculty },
    { category: 'PhD Advisors', value: data.facultyProductivity.phdAdvisorsCount },
    { category: 'Industry Collaborations', value: data.facultyProductivity.industryCollaborations },
  ];

  // ============================================================================
  // STUDENT PROGRESSION CHART DATA
  // ============================================================================

  const progressionData = data.studentProgression.byYear.map((year) => ({
    year: `Year ${year.year}`,
    enrolled: year.totalEnrolled,
    passed: year.passed,
    failed: year.failed,
    passPercentage: year.passPercentage,
  }));

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <Spin spinning={isLoading}>
      <div className="dashboard-container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1>Management Dashboard</h1>
          <Button onClick={onRefresh}>Refresh</Button>
        </div>

        {/* Executive KPIs */}
        {renderExecutiveKPIs()}

        {/* Ranking Metrics Card */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={12}>
            <Card title="Institution Rankings" bordered={false}>
              <Row gutter={[16, 16]}>
                <Col span={24}>
                  <Tooltip title="National Institutional Ranking Framework">
                    <Statistic
                      title="NIRF Ranking"
                      value={data.rankingMetrics.nirf_ranking || 'N/A'}
                      suffix={data.rankingMetrics.nirf_ranking ? `(${data.rankingMetrics.nirf_category})` : ''}
                      prefix={<TrophyOutlined />}
                    />
                  </Tooltip>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="National Ranking"
                    value={data.rankingMetrics.nationalRanking || 'N/A'}
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="World Ranking"
                    value={data.rankingMetrics.worldRanking || 'N/A'}
                    valueStyle={{ fontSize: '18px' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Performance Scores */}
          <Col xs={24} lg={12}>
            <Card title="Performance Scores" bordered={false}>
              <List
                dataSource={[
                  { label: 'Research Score', value: data.rankingMetrics.researchScore },
                  { label: 'Teaching Score', value: data.rankingMetrics.teachingScore },
                  { label: 'Outreach Score', value: data.rankingMetrics.outreachScore },
                  { label: 'Infrastructure Score', value: data.rankingMetrics.infrastructureScore },
                  { label: 'Innovation Score', value: data.rankingMetrics.innovationScore },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.label}
                      description={<Progress percent={item.value} size="small" />}
                    />
                    <div style={{ fontWeight: 'bold' }}>{item.value}/100</div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

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
                  {/* Department KPIs Rankings */}
                  <Col xs={24} lg={12}>
                    <Card title="Department Rankings by Performance" bordered={false}>
                      <Table
                        columns={[
                          {
                            title: 'Rank',
                            dataIndex: '_rank',
                            key: 'rank',
                            width: 60,
                            render: (_, __, idx) => (
                              <Badge
                                count={idx + 1}
                                style={
                                  idx === 0
                                    ? { backgroundColor: '#FFD700' }
                                    : idx === 1
                                    ? { backgroundColor: '#C0C0C0' }
                                    : idx === 2
                                    ? { backgroundColor: '#CD7F32' }
                                    : { backgroundColor: '#1890ff' }
                                }
                              />
                            ),
                          },
                          { title: 'Department', dataIndex: 'departmentName', key: 'name' },
                          { title: 'Faculty', dataIndex: 'facultyCount', key: 'faculty', width: 70 },
                          { title: 'Students', dataIndex: 'studentCount', key: 'students', width: 70 },
                          {
                            title: 'Placement %',
                            dataIndex: 'placementRate',
                            key: 'placement',
                            width: 80,
                            render: (rate: number) => `${rate}%`,
                          },
                        ]}
                        dataSource={departmentRankings}
                        pagination={false}
                        size="small"
                      />
                    </Card>
                  </Col>

                  {/* Faculty Research Output */}
                  <Col xs={24} lg={12}>
                    <Card title="Faculty Research & Publication" bordered={false}>
                      <List
                        dataSource={[
                          { label: 'Total Research Projects', value: totalResearchProjects },
                          { label: 'Total Publications', value: totalPublications },
                          { label: 'PhD Students Advised', value: data.facultyProductivity.totalPhDStudentsAdvisedPerFaculty },
                          {
                            label: 'Consultancy Revenue',
                            value: `₹${(data.facultyProductivity.totalConsultancyRevenue / 100000).toFixed(1)}L`,
                          },
                          { label: 'Industry Collaborations', value: data.facultyProductivity.industryCollaborations },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta title={item.label} />
                            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.value}</div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>

                  {/* Faculty Productivity Chart */}
                  <Col xs={24} lg={12}>
                    <Card title="Faculty Productivity Metrics" bordered={false}>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={facultyProductivityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis />
                          <ChartTooltip />
                          <Bar dataKey="value" fill="#1890ff" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  {/* Student Progression */}
                  <Col xs={24} lg={12}>
                    <Card title="Student Progression & Outcomes" bordered={false}>
                      <List
                        dataSource={[
                          { label: 'Total Students', value: data.studentProgression.totalStudents },
                          { label: 'Avg CGPA', value: data.studentProgression.avgCGPA.toFixed(2) },
                          { label: 'Placement Rate', value: `${data.studentProgression.placementRate}%` },
                          {
                            label: 'Avg Package',
                            value: `₹${data.studentProgression.avgPlacementPackage.toFixed(1)} LPA`,
                          },
                          {
                            label: 'Highest Package',
                            value: `₹${data.studentProgression.highestPackage.toFixed(1)} LPA`,
                          },
                          { label: 'Companies Visited', value: data.studentProgression.companiesVisited },
                          { label: 'Pursuing Higher Studies', value: data.studentProgression.graduateStudies },
                          { label: 'Entrepreneurs', value: data.studentProgression.entrepreneurship },
                        ]}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta title={item.label} />
                            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.value}</div>
                          </List.Item>
                        )}
                      />
                    </Card>
                  </Col>
                </Row>
              ),
            },
            {
              key: 'departments',
              label: 'Department KPIs',
              children: (
                <Card bordered={false}>
                  <Table
                    columns={[
                      { title: 'Department', dataIndex: 'departmentName', key: 'name' },
                      { title: 'Faculty', dataIndex: 'facultyCount', key: 'faculty' },
                      { title: 'Students', dataIndex: 'studentCount', key: 'students' },
                      {
                        title: 'Avg Faculty Score',
                        dataIndex: 'avgFacultyPerformance',
                        key: 'faculty_score',
                        render: (score: number) => (
                          <Progress percent={score} size="small" width={80} />
                        ),
                      },
                      {
                        title: 'Avg Student CGPA',
                        dataIndex: 'avgStudentCGPA',
                        key: 'cgpa',
                        render: (cgpa: number) => cgpa.toFixed(2),
                      },
                      {
                        title: 'Placement %',
                        dataIndex: 'placementRate',
                        key: 'placement',
                        render: (rate: number) => `${rate}%`,
                      },
                      {
                        title: 'Research Projects',
                        dataIndex: 'researchProjectsCount',
                        key: 'research',
                      },
                      {
                        title: 'Publications',
                        dataIndex: 'publicationsCount',
                        key: 'publications',
                      },
                    ]}
                    dataSource={data.departmentKPIs}
                    rowKey="departmentId"
                    pagination={{ pageSize: 10 }}
                    size="small"
                  />
                </Card>
              ),
            },
            {
              key: 'accreditation',
              label: 'Accreditation Readiness',
              children: (
                <Card bordered={false}>
                  <Table
                    columns={accreditationColumns}
                    dataSource={data.accreditations}
                    rowKey="accreditationType"
                    pagination={false}
                    size="small"
                  />
                </Card>
              ),
            },
            {
              key: 'progression',
              label: 'Student Progression',
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Card title="Year-wise Student Flow" bordered={false}>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={progressionData}>
                          <defs>
                            <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPassed" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <ChartTooltip />
                          <Area
                            type="monotone"
                            dataKey="enrolled"
                            stroke="#1890ff"
                            fillOpacity={1}
                            fill="url(#colorEnrolled)"
                          />
                          <Area
                            type="monotone"
                            dataKey="passed"
                            stroke="#52c41a"
                            fillOpacity={1}
                            fill="url(#colorPassed)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card title="Placement Details" bordered={false}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                          <Card size="small">
                            <Statistic
                              title="Placement Rate"
                              value={data.studentProgression.placementRate}
                              suffix="%"
                              prefix={<CheckCircleOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card size="small">
                            <Statistic
                              title="Avg Package"
                              value={data.studentProgression.avgPlacementPackage}
                              suffix="LPA"
                              prefix={<LineChartOutlined />}
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card size="small">
                            <Statistic
                              title="Highest Package"
                              value={data.studentProgression.highestPackage}
                              suffix="LPA"
                            />
                          </Card>
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                          <Card size="small">
                            <Statistic
                              title="Companies Visited"
                              value={data.studentProgression.companiesVisited}
                            />
                          </Card>
                        </Col>
                      </Row>
                    </Card>
                  </Col>

                  <Col xs={24}>
                    <Card title="Post-Graduation Outcomes" bordered={false}>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Statistic
                            title="Higher Studies"
                            value={data.studentProgression.graduateStudies}
                            suffix={`students (${(
                              (data.studentProgression.graduateStudies / data.studentProgression.totalStudents) *
                              100
                            ).toFixed(1)
                            }%)`}
                          />
                        </Col>
                        <Col xs={24} sm={8}>
                          <Statistic
                            title="Entrepreneurs"
                            value={data.studentProgression.entrepreneurship}
                            suffix={`students (${(
                              (data.studentProgression.entrepreneurship / data.studentProgression.totalStudents) *
                              100
                            ).toFixed(1)
                            }%)`}
                          />
                        </Col>
                        <Col xs={24} sm={8}>
                          <Statistic
                            title="Avg CGPA"
                            value={data.studentProgression.avgCGPA}
                            suffix={`(Topper: ${data.studentProgression.topperCGPA})`}
                          />
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, color: '#999', fontSize: '12px' }}>
          Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'N/A'}
        </div>
      </div>
    </Spin>
  );
};

export default ManagementDashboard;
