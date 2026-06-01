// src/components/Accreditation/AccreditationDashboard.tsx
// Main Accreditation Dashboard Component

import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Tabs,
  Button,
  Space,
  Alert,
  Spin,
  Progress,
} from 'antd';
import {
  CheckCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  AlertOutlined,
  BarChartOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import type { AccreditationDashboardStats } from '../../types/accreditation.types';

interface AccreditationDashboardProps {
  onGenerateReport?: () => void;
  onViewAlerts?: () => void;
}

const AccreditationDashboard: React.FC<AccreditationDashboardProps> = ({
  onGenerateReport,
  onViewAlerts,
}) => {
  const [stats, setStats] = useState<AccreditationDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accreditation/dashboard/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="accreditation-dashboard">
        <Spin size="large" />
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <Alert message="Failed to load dashboard data" type="error" />
      </Card>
    );
  }

  const compliancePercentage = stats.complianceRate || 0;

  return (
    <div className="accreditation-dashboard">
      <Card className="dashboard-header">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h1>Accreditation Management Dashboard</h1>
            <Space>
              <Button
                type="primary"
                icon={<BarChartOutlined />}
                onClick={onGenerateReport}
              >
                Generate Report
              </Button>
              <Button
                danger={stats.criticalAlerts > 0}
                icon={<AlertOutlined />}
                onClick={onViewAlerts}
              >
                View Alerts ({stats.activeAlerts})
              </Button>
              <Button icon={<CloudUploadOutlined />}>
                Upload Evidence
              </Button>
            </Space>
          </Row>

          {stats.criticalAlerts > 0 && (
            <Alert
              message={`${stats.criticalAlerts} Critical Alerts Pending`}
              description="Please review and address critical accreditation issues."
              type="error"
              showIcon
              closable
            />
          )}
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Bodies"
              value={stats.totalBodies}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Criteria"
              value={stats.totalCriteria}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Mapped Criteria"
              value={stats.mappedCriteria}
              suffix={`/ ${stats.totalCriteria}`}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Evidence Verified"
              value={stats.verifiedEvidence}
              suffix={`/ ${stats.totalEvidence}`}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Faculties"
              value={stats.facultiesInvolved}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Students"
              value={stats.studentsInvolved}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Verification"
              value={stats.pendingVerification}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Alerts"
              value={stats.activeAlerts}
              suffix={stats.criticalAlerts > 0 ? ` (${stats.criticalAlerts} Critical)` : ''}
              valueStyle={{ color: stats.activeAlerts > 0 ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <h2>Overall Compliance Rate</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3>Coverage: {compliancePercentage}%</h3>
              <Progress
                type="circle"
                percent={compliancePercentage}
                strokeColor={{
                  '0%': '#f5222d',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
                width={150}
              />
              <p style={{ marginTop: 16 }}>
                {stats.mappedCriteria} of {stats.totalCriteria} criteria mapped
              </p>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3>Verification Rate</h3>
              <Progress
                type="circle"
                percent={
                  stats.totalEvidence > 0
                    ? Math.round((stats.verifiedEvidence / stats.totalEvidence) * 100)
                    : 0
                }
                strokeColor={{
                  '0%': '#f5222d',
                  '50%': '#faad14',
                  '100%': '#52c41a',
                }}
                width={150}
              />
              <p style={{ marginTop: 16 }}>
                {stats.verifiedEvidence} of {stats.totalEvidence} evidence verified
              </p>
            </div>
          </Col>
        </Row>
      </Card>

      <Tabs
        style={{ marginTop: 24 }}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <Card>
                <div style={{ padding: '20px' }}>
                  <h3>Accreditation Status Summary</h3>
                  <ul>
                    <li>
                      <strong>Total Accreditation Bodies:</strong> {stats.totalBodies}
                    </li>
                    <li>
                      <strong>Active Bodies:</strong> {stats.activeBodies}
                    </li>
                    <li>
                      <strong>Criteria to Cover:</strong> {stats.totalCriteria}
                    </li>
                    <li>
                      <strong>Criteria Mapped:</strong> {stats.mappedCriteria}
                    </li>
                    <li>
                      <strong>Coverage Rate:</strong> {compliancePercentage}%
                    </li>
                  </ul>
                </div>
              </Card>
            ),
          },
          {
            key: 'evidence',
            label: 'Evidence Status',
            children: (
              <Card>
                <div style={{ padding: '20px' }}>
                  <h3>Evidence Management</h3>
                  <ul>
                    <li>
                      <strong>Total Evidence:</strong> {stats.totalEvidence}
                    </li>
                    <li>
                      <strong>Verified Evidence:</strong> {stats.verifiedEvidence}
                    </li>
                    <li>
                      <strong>Pending Verification:</strong> {stats.pendingVerification}
                    </li>
                    <li>
                      <strong>Verification Rate:</strong>{' '}
                      {stats.totalEvidence > 0
                        ? Math.round((stats.verifiedEvidence / stats.totalEvidence) * 100)
                        : 0}
                      %
                    </li>
                  </ul>
                </div>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
};

export default AccreditationDashboard;
