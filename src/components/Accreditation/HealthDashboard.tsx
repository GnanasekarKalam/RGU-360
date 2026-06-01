// src/components/Accreditation/HealthDashboard.tsx
// Compliance Health & Metrics Dashboard

import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Button,
  Spin,
  Empty,
  Table,
  Progress,
  Space,
  Divider,
  Alert,
} from 'antd';
import {
  BarChartOutlined,
  LineChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ComplianceMetrics {
  bodyType: string;
  academicYear: string;
  totalCriteria: number;
  mappedCriteria: number;
  mappingPercentage: number;
  evidenceCount: number;
  verifiedEvidenceCount: number;
  compliancePercentage: number;
  criteriaBreakdown: {
    [key: string]: {
      mapped: boolean;
      evidenceCount: number;
      verified: number;
      status: string;
    };
  };
}

interface HealthDashboardProps {
  onRefresh?: () => void;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedBody, setSelectedBody] = useState('NBA');
  const [selectedYear, setSelectedYear] = useState('2025-2026');
  const [bodies, setBodies] = useState<string[]>(['NBA', 'NAAC', 'UGC', 'AICTE', 'IQAC']);
  const [years, setYears] = useState<string[]>(['2025-2026', '2024-2025', '2023-2024']);

  useEffect(() => {
    fetchMetrics();
  }, [selectedBody, selectedYear]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/accreditation/metrics/${selectedBody}/${selectedYear}`
      );
      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCriteriaData = () => {
    if (!metrics) return [];

    return Object.entries(metrics.criteriaBreakdown).map(([code, data]) => ({
      code,
      mapped: data.mapped ? 'Yes' : 'No',
      evidenceCount: data.evidenceCount,
      verified: data.verified,
      status: data.status,
    }));
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Criteria Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Mapped',
      dataIndex: 'mapped',
      key: 'mapped',
      width: 80,
      render: (text) => (
        <span style={{ color: text === 'Yes' ? '#52c41a' : '#faad14' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Evidence Count',
      dataIndex: 'evidenceCount',
      key: 'evidenceCount',
      width: 120,
    },
    {
      title: 'Verified',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ textTransform: 'capitalize' }}>
          {status.toLowerCase()}
        </span>
      ),
    },
  ];

  if (!metrics) {
    return loading ? (
      <Card>
        <Spin size="large" />
      </Card>
    ) : (
      <Card>
        <Empty description="No metrics available" />
      </Card>
    );
  }

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 80) return '#52c41a';
    if (percentage >= 60) return '#faad14';
    return '#f5222d';
  };

  const getMappingColor = (percentage: number) => {
    if (percentage >= 90) return '#52c41a';
    if (percentage >= 70) return '#faad14';
    return '#f5222d';
  };

  return (
    <div className="health-dashboard">
      <Card className="dashboard-header">
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h1>Compliance Health Dashboard</h1>
            <Button onClick={onRefresh}>Refresh Data</Button>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <div>
                <strong>Accreditation Body</strong>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedBody}
                  onChange={setSelectedBody}
                  options={bodies.map((b) => ({ label: b, value: b }))}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <div>
                <strong>Academic Year</strong>
                <Select
                  style={{ width: '100%', marginTop: 8 }}
                  value={selectedYear}
                  onChange={setSelectedYear}
                  options={years.map((y) => ({ label: y, value: y }))}
                />
              </div>
            </Col>

            <Col xs={24} sm={12} lg={8}>
              <div>
                <strong>Actions</strong>
                <Button
                  block
                  style={{ marginTop: 8 }}
                  onClick={() => fetchMetrics()}
                  loading={loading}
                >
                  Load Metrics
                </Button>
              </div>
            </Col>
          </Row>
        </Space>
      </Card>

      <Spin spinning={loading}>
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Criteria"
                value={metrics.totalCriteria}
                prefix={<FileProtectOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mapped Criteria"
                value={metrics.mappedCriteria}
                suffix={`/ ${metrics.totalCriteria}`}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: getMappingColor(metrics.mappingPercentage) }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Mapping %"
                value={metrics.mappingPercentage}
                suffix="%"
                prefix={<BarChartOutlined />}
                valueStyle={{ color: getMappingColor(metrics.mappingPercentage) }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Compliance %"
                value={metrics.compliancePercentage}
                suffix="%"
                prefix={<LineChartOutlined />}
                valueStyle={{ color: getComplianceColor(metrics.compliancePercentage) }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Evidence"
                value={metrics.evidenceCount}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Verified Evidence"
                value={metrics.verifiedEvidenceCount}
                suffix={`/ ${metrics.evidenceCount}`}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={12}>
            <Card>
              <Statistic
                title="Verification Rate"
                value={
                  metrics.evidenceCount > 0
                    ? Math.round(
                        (metrics.verifiedEvidenceCount / metrics.evidenceCount) * 100
                      )
                    : 0
                }
                suffix="%"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 24 }}>
          <h2>Mapping Coverage Progress</h2>
          <Row gutter={[32, 32]} style={{ marginTop: 24 }}>
            <Col xs={24} md={12}>
              <div style={{ textAlign: 'center' }}>
                <h3>Criteria Mapping</h3>
                <Progress
                  type="circle"
                  percent={metrics.mappingPercentage}
                  strokeColor={getMappingColor(metrics.mappingPercentage)}
                  width={150}
                />
                <p style={{ marginTop: 16 }}>
                  {metrics.mappedCriteria} of {metrics.totalCriteria} criteria mapped
                </p>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div style={{ textAlign: 'center' }}>
                <h3>Evidence Verification</h3>
                <Progress
                  type="circle"
                  percent={
                    metrics.evidenceCount > 0
                      ? Math.round(
                          (metrics.verifiedEvidenceCount / metrics.evidenceCount) * 100
                        )
                      : 0
                  }
                  strokeColor={getComplianceColor(metrics.compliancePercentage)}
                  width={150}
                />
                <p style={{ marginTop: 16 }}>
                  {metrics.verifiedEvidenceCount} of {metrics.evidenceCount} evidence
                  verified
                </p>
              </div>
            </Col>
          </Row>
        </Card>

        <Card style={{ marginTop: 24 }}>
          <h2>Criteria-wise Status</h2>
          <Divider />

          {Object.keys(metrics.criteriaBreakdown).length === 0 ? (
            <Empty description="No criteria data available" />
          ) : (
            <Table
              columns={columns}
              dataSource={getCriteriaData()}
              rowKey="code"
              pagination={{ pageSize: 15 }}
              scroll={{ x: 800 }}
            />
          )}
        </Card>

        {metrics.mappingPercentage < 70 && (
          <Alert
            style={{ marginTop: 16 }}
            message="Low Coverage"
            description="Criteria mapping coverage is below 70%. Please prioritize mapping remaining criteria."
            type="warning"
            showIcon
            closable
          />
        )}

        {metrics.compliancePercentage < 60 && (
          <Alert
            style={{ marginTop: 8 }}
            message="Low Compliance"
            description="Evidence verification rate is below 60%. Please prioritize evidence verification."
            type="error"
            showIcon
            closable
          />
        )}
      </Spin>
    </div>
  );
};

export default HealthDashboard;
