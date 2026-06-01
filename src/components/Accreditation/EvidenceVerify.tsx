// src/components/Accreditation/EvidenceVerify.tsx
// Evidence Verification Component (for HOD/Admin)

import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Button,
  Table,
  Space,
  Modal,
  message,
  Input,
  Spin,
  Row,
  Col,
  Tag,
  Drawer,
  Divider,
  Alert,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface PendingEvidence {
  id: string;
  title: string;
  evidenceType: string;
  mappingCriteria: string;
  submittedBy: string;
  uploadedAt: string;
  description: string;
  status: string;
}

interface EvidenceVerifyProps {
  onEvidenceVerified?: () => void;
}

const EvidenceVerify: React.FC<EvidenceVerifyProps> = ({
  onEvidenceVerified,
}) => {
  const [form] = Form.useForm();
  const [evidence, setEvidence] = useState<PendingEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<PendingEvidence | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');

  useEffect(() => {
    fetchPendingEvidence();
  }, []);

  const fetchPendingEvidence = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        '/api/accreditation/evidence?status=pending'
      );
      const data = await response.json();
      if (data.success) {
        setEvidence(data.evidence || []);
      }
    } catch (error) {
      console.error('Error fetching evidence:', error);
      message.error('Failed to fetch evidence');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEvidence = async (approved: boolean) => {
    if (!selectedEvidence) return;

    try {
      const payload = {
        isVerified: approved,
        verificationComments: verificationComments,
      };

      const response = await fetch(
        `/api/accreditation/evidence/${selectedEvidence.id}/verify`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        message.success(
          approved
            ? 'Evidence approved successfully'
            : 'Evidence rejected successfully'
        );
        setIsDrawerVisible(false);
        setSelectedEvidence(null);
        setVerificationComments('');
        fetchPendingEvidence();
        onEvidenceVerified?.();
      } else {
        message.error(data.message || 'Failed to verify evidence');
      }
    } catch (error) {
      console.error('Error verifying evidence:', error);
      message.error('Error verifying evidence');
    }
  };

  const handleViewEvidence = (record: PendingEvidence) => {
    setSelectedEvidence(record);
    setIsDrawerVisible(true);
  };

  const columns: ColumnsType<PendingEvidence> = [
    {
      title: 'Type',
      dataIndex: 'evidenceType',
      key: 'evidenceType',
      width: 100,
      render: (type) => (
        <span style={{ textTransform: 'capitalize' }}>{type.toLowerCase()}</span>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Criteria',
      dataIndex: 'mappingCriteria',
      key: 'mappingCriteria',
      width: 120,
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 120,
    },
    {
      title: 'Submitted Date',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <Tag color={status === 'PENDING' ? 'orange' : 'blue'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewEvidence(record)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="evidence-verify">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h2>Evidence Verification</h2>
            <Button onClick={fetchPendingEvidence} loading={loading}>
              Refresh
            </Button>
          </Row>

          {evidence.length === 0 ? (
            <Alert
              message="No pending evidence"
              description="All submitted evidence has been verified or no evidence is awaiting verification."
              type="success"
            />
          ) : (
            <Alert
              message={`${evidence.length} evidence submissions pending verification`}
              type="warning"
              showIcon
            />
          )}

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={evidence}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Spin>
        </Space>
      </Card>

      <Drawer
        title={selectedEvidence ? 'Evidence Review' : ''}
        placement="right"
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedEvidence(null);
          setVerificationComments('');
        }}
        open={isDrawerVisible}
        width={600}
      >
        {selectedEvidence && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card>
              <div>
                <strong>Title:</strong>
                <p>{selectedEvidence.title}</p>

                <strong>Evidence Type:</strong>
                <p style={{ textTransform: 'capitalize' }}>
                  {selectedEvidence.evidenceType.toLowerCase()}
                </p>

                <strong>Criteria:</strong>
                <p>{selectedEvidence.mappingCriteria}</p>

                <strong>Submitted By:</strong>
                <p>{selectedEvidence.submittedBy}</p>

                <strong>Submitted Date:</strong>
                <p>{new Date(selectedEvidence.uploadedAt).toLocaleDateString()}</p>

                <strong>Description:</strong>
                <p>{selectedEvidence.description}</p>
              </div>
            </Card>

            <Card title="Evidence File">
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <FileOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
                <p>Document Preview</p>
                <Button type="default">Download File</Button>
              </div>
            </Card>

            <Card title="Verification Comments">
              <Input.TextArea
                rows={4}
                placeholder="Add your verification comments or feedback"
                value={verificationComments}
                onChange={(e) => setVerificationComments(e.target.value)}
              />
            </Card>

            <Divider />

            <Row gutter={16}>
              <Col xs={12}>
                <Button
                  block
                  danger
                  size="large"
                  icon={<CloseOutlined />}
                  onClick={() => handleVerifyEvidence(false)}
                >
                  Reject
                </Button>
              </Col>
              <Col xs={12}>
                <Button
                  block
                  type="primary"
                  size="large"
                  icon={<CheckOutlined />}
                  onClick={() => handleVerifyEvidence(true)}
                >
                  Approve
                </Button>
              </Col>
            </Row>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default EvidenceVerify;
