// src/components/TaskManagement/TaskApproval.tsx
// Task approval workflow component

import React, { useState } from 'react';
import {
  Card,
  Form,
  TextArea,
  Button,
  Alert,
  Tag,
  Row,
  Col,
  Divider,
  Steps,
  List,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

interface Approval {
  id: string;
  approverUserId: string;
  approverName: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalComments?: string;
  approvedAt?: Date;
}

interface TaskApprovalProps {
  taskId: string;
  approvals: Approval[];
  requiresApproval: boolean;
  currentApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  onApprove: (approvalId: string, comments: string) => void;
  onReject: (approvalId: string, comments: string) => void;
  isLoading?: boolean;
  currentUserId?: string;
  evidence?: any[];
}

const TaskApproval: React.FC<TaskApprovalProps> = ({
  taskId,
  approvals,
  requiresApproval,
  currentApprovalStatus,
  onApprove,
  onReject,
  isLoading,
  currentUserId,
  evidence = [],
}) => {
  const [form] = Form.useForm();
  const [selectedApproval, setSelectedApproval] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);

  const handleSubmitApproval = async (values: any) => {
    if (!selectedApproval || !actionType) return;

    if (actionType === 'APPROVE') {
      onApprove(selectedApproval, values.comments || '');
    } else {
      onReject(selectedApproval, values.comments || '');
    }

    form.resetFields();
    setSelectedApproval(null);
    setActionType(null);
  };

  const getApprovalSteps = () => {
    return approvals.map((approval, index) => ({
      title: approval.approverName,
      status:
        approval.approvalStatus === 'PENDING'
          ? 'process'
          : approval.approvalStatus === 'APPROVED'
          ? 'finish'
          : 'error',
      description:
        approval.approvalStatus === 'APPROVED'
          ? `Approved on ${new Date(approval.approvedAt || '').toLocaleDateString()}`
          : `${approval.approvalStatus}`,
    }));
  };

  const myPendingApproval = approvals.find(
    (a) => a.approvalStatus === 'PENDING' && a.approverUserId === currentUserId
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'green';
      case 'REJECTED':
        return 'red';
      case 'PENDING':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleOutlined />;
      case 'REJECTED':
        return <CloseCircleOutlined />;
      case 'PENDING':
        return <ClockCircleOutlined />;
      default:
        return null;
    }
  };

  return (
    <div>
      {!requiresApproval && (
        <Alert
          message="This task does not require approval"
          type="info"
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Overall Status */}
      {currentApprovalStatus && (
        <Card
          title="Overall Approval Status"
          style={{ marginBottom: '16px' }}
          type="inner"
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            <Tag color={getStatusColor(currentApprovalStatus)}>
              {getStatusIcon(currentApprovalStatus)} {currentApprovalStatus}
            </Tag>
          </div>
        </Card>
      )}

      {/* Approval Chain */}
      {approvals.length > 0 && (
        <Card title="Approval Chain" style={{ marginBottom: '16px' }} type="inner">
          <Steps
            items={getApprovalSteps()}
            direction="vertical"
            style={{ minHeight: '200px' }}
          />
        </Card>
      )}

      {/* Evidence Summary */}
      {evidence && evidence.length > 0 && (
        <Card title="Submitted Evidence" style={{ marginBottom: '16px' }} type="inner">
          <List
            dataSource={evidence}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={
                    <>
                      <Tag color="blue">{item.evidenceType}</Tag>
                      {item.isVerified && (
                        <Tag color="green" style={{ marginLeft: '8px' }}>
                          Verified
                        </Tag>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* My Pending Approval */}
      {myPendingApproval && (
        <Card title="Your Approval Required" type="inner" style={{ marginBottom: '16px' }}>
          <Alert
            message="You have a pending approval action on this task"
            type="warning"
            style={{ marginBottom: '16px' }}
          />

          <Form form={form} layout="vertical" onFinish={handleSubmitApproval}>
            <Form.Item label="Comments" name="comments">
              <TextArea rows={4} placeholder="Enter approval comments" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    setSelectedApproval(myPendingApproval.id);
                    setActionType('REJECT');
                  }}
                  loading={isLoading && actionType === 'REJECT'}
                >
                  Reject
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setSelectedApproval(myPendingApproval.id);
                    setActionType('APPROVE');
                  }}
                  loading={isLoading && actionType === 'APPROVE'}
                >
                  Approve
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* All Approvals History */}
      {approvals.length > 0 && (
        <Card title="Approval History" type="inner">
          <List
            dataSource={approvals}
            renderItem={(approval) => (
              <List.Item>
                <Row style={{ width: '100%' }}>
                  <Col span={8}>{approval.approverName}</Col>
                  <Col span={8}>
                    <Tag color={getStatusColor(approval.approvalStatus)}>
                      {approval.approvalStatus}
                    </Tag>
                  </Col>
                  <Col span={8}>
                    {approval.approvedAt &&
                      new Date(approval.approvedAt).toLocaleDateString()}
                  </Col>
                </Row>
                {approval.approvalComments && (
                  <div style={{ marginTop: '8px', color: '#666' }}>
                    <strong>Comments:</strong> {approval.approvalComments}
                  </div>
                )}
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};

export default TaskApproval;
