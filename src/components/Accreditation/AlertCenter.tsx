// src/components/Accreditation/AlertCenter.tsx
// Accreditation Alert Center Component

import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Modal,
  message,
  Input,
  Spin,
  Row,
  Col,
  Tag,
  Drawer,
  Empty,
  Statistic,
  Alert as AntAlert,
} from 'antd';
import {
  DeleteOutlined,
  CheckOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface AlertRecord {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  mappingCriteria: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

interface AlertCenterProps {
  onAlertResolved?: () => void;
}

const AlertCenter: React.FC<AlertCenterProps> = ({ onAlertResolved }) => {
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetchAlerts();
    fetchAlertSummary();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/accreditation/alerts');
      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      message.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertSummary = async () => {
    try {
      const response = await fetch('/api/accreditation/alerts/summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching alert summary:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'red';
      case 'HIGH':
        return 'orange';
      case 'MEDIUM':
        return 'gold';
      case 'LOW':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getAlertTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      MISSING_EVIDENCE: 'Missing Evidence',
      PENDING_VERIFICATION: 'Pending Verification',
      EXPIRED_EVIDENCE: 'Expired Evidence',
      INCOMPLETE_MAPPING: 'Incomplete Mapping',
    };
    return labels[type] || type;
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;

    try {
      const response = await fetch(
        `/api/accreditation/alerts/${selectedAlert.id}/resolve`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resolutionNotes: resolutionNotes,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success('Alert resolved successfully');
        setIsDrawerVisible(false);
        setSelectedAlert(null);
        setResolutionNotes('');
        fetchAlerts();
        fetchAlertSummary();
        onAlertResolved?.();
      } else {
        message.error(data.message || 'Failed to resolve alert');
      }
    } catch (error) {
      console.error('Error resolving alert:', error);
      message.error('Error resolving alert');
    }
  };

  const handleCheckMissingEvidence = async () => {
    try {
      const response = await fetch(
        '/api/accreditation/alerts/check-missing-evidence',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success(data.message);
        fetchAlerts();
        fetchAlertSummary();
      } else {
        message.error(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Error checking missing evidence');
    }
  };

  const columns: ColumnsType<AlertRecord> = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity) => (
        <Tag color={getSeverityColor(severity)}>{severity}</Tag>
      ),
    },
    {
      title: 'Alert Type',
      dataIndex: 'alertType',
      key: 'alertType',
      width: 150,
      render: (type) => (
        <span>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          {getAlertTypeLabel(type)}
        </span>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Criteria',
      dataIndex: 'mappingCriteria',
      key: 'mappingCriteria',
      width: 100,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'red' : 'green'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => {
              setSelectedAlert(record);
              setIsDrawerVisible(true);
            }}
          >
            Resolve
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="alert-center">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Alerts"
              value={summary?.totalAlerts || 0}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Critical"
              value={summary?.criticalAlerts || 0}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="High"
              value={summary?.highAlerts || 0}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Medium"
              value={summary?.mediumAlerts || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h2>Active Alerts</h2>
            <Space>
              <Button onClick={handleCheckMissingEvidence}>
                Check Missing Evidence
              </Button>
              <Button onClick={fetchAlerts} loading={loading}>
                Refresh
              </Button>
            </Space>
          </Row>

          {summary?.criticalAlerts > 0 && (
            <AntAlert
              message={`${summary.criticalAlerts} Critical Alert(s) Require Immediate Action`}
              type="error"
              showIcon
            />
          )}

          {alerts.length === 0 ? (
            <Empty description="No active alerts" />
          ) : (
            <Spin spinning={loading}>
              <Table
                columns={columns}
                dataSource={alerts}
                rowKey="id"
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1200 }}
              />
            </Spin>
          )}
        </Space>
      </Card>

      <Drawer
        title={selectedAlert ? 'Resolve Alert' : ''}
        placement="right"
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedAlert(null);
          setResolutionNotes('');
        }}
        open={isDrawerVisible}
        width={500}
      >
        {selectedAlert && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card>
              <div>
                <strong>Severity:</strong>
                <p>
                  <Tag color={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity}
                  </Tag>
                </p>

                <strong>Alert Type:</strong>
                <p>{getAlertTypeLabel(selectedAlert.alertType)}</p>

                <strong>Message:</strong>
                <p>{selectedAlert.message}</p>

                <strong>Criteria:</strong>
                <p>{selectedAlert.mappingCriteria}</p>

                <strong>Created:</strong>
                <p>{new Date(selectedAlert.createdAt).toLocaleString()}</p>
              </div>
            </Card>

            <Card title="Resolution Notes">
              <Input.TextArea
                rows={4}
                placeholder="Document how this alert was resolved"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
              />
            </Card>

            <Button
              block
              type="primary"
              size="large"
              onClick={handleResolveAlert}
            >
              Mark as Resolved
            </Button>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AlertCenter;
