// src/components/TaskManagement/EvidenceUpload.tsx
// Task evidence submission and verification component

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Upload,
  Button,
  List,
  Tag,
  Modal,
  message,
  Spin,
} from 'antd';
import { DeleteOutlined, CheckCircleOutlined, CopyOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';

interface Evidence {
  id: string;
  title: string;
  description: string;
  evidenceType: 'FILE' | 'URL' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK';
  fileUrl?: string;
  externalLink?: string;
  textContent?: string;
  isVerified: boolean;
  verificationComments?: string;
  uploadedAt: Date;
  submittedByName: string;
}

interface EvidenceUploadProps {
  taskId: string;
  existingEvidence: Evidence[];
  onSubmit: (data: any) => void;
  onDelete?: (evidenceId: string) => void;
  isLoading?: boolean;
  canVerify?: boolean;
  onVerify?: (evidenceId: string, isVerified: boolean, comments: string) => void;
}

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({
  taskId,
  existingEvidence,
  onSubmit,
  onDelete,
  isLoading,
  canVerify,
  onVerify,
}) => {
  const [form] = Form.useForm();
  const [evidenceType, setEvidenceType] = useState<string>('FILE');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationComments, setVerificationComments] = useState('');

  const handleSubmit = async (values: any) => {
    let fileUrl = null;

    // Handle file upload
    if (evidenceType === 'FILE' && fileList.length > 0) {
      // In real implementation, upload to storage service
      fileUrl = `/uploads/${fileList[0].name}`;
    }

    const data = {
      title: values.title,
      description: values.description,
      evidenceType,
      fileUrl,
      externalLink: evidenceType === 'URL' || evidenceType === 'LINK' ? values.externalLink : null,
      textContent: evidenceType === 'TEXT' ? values.textContent : null,
    };

    onSubmit(data);
    form.resetFields();
    setFileList([]);
    message.success('Evidence submitted successfully');
  };

  const handleVerification = (evidence: Evidence) => {
    setSelectedEvidence(evidence);
    setVerificationModal(true);
  };

  const submitVerification = (isVerified: boolean) => {
    if (selectedEvidence && onVerify) {
      onVerify(selectedEvidence.id, isVerified, verificationComments);
      setVerificationModal(false);
      setVerificationComments('');
      message.success('Evidence verification submitted');
    }
  };

  const renderEvidenceContent = (evidence: Evidence) => {
    switch (evidence.evidenceType) {
      case 'FILE':
        return (
          <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer">
            Download File
          </a>
        );
      case 'URL':
      case 'LINK':
        return (
          <a href={evidence.externalLink} target="_blank" rel="noopener noreferrer">
            View Link
          </a>
        );
      case 'TEXT':
        return <span>{evidence.textContent?.substring(0, 100)}...</span>;
      case 'IMAGE':
      case 'VIDEO':
        return (
          <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer">
            View Media
          </a>
        );
      default:
        return <span>N/A</span>;
    }
  };

  return (
    <div>
      {/* Evidence Submission Form */}
      <Card title="Submit Evidence" style={{ marginBottom: '16px' }} type="inner">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Evidence Title"
            name="title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input placeholder="e.g., Project Report, Assignment 1" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} placeholder="Describe the evidence" />
          </Form.Item>

          <Form.Item
            label="Evidence Type"
            name="evidenceType"
          >
            <Select
              value={evidenceType}
              onChange={(value) => setEvidenceType(value)}
              options={[
                { label: 'File Upload', value: 'FILE' },
                { label: 'External URL', value: 'URL' },
                { label: 'Image', value: 'IMAGE' },
                { label: 'Video', value: 'VIDEO' },
                { label: 'Text', value: 'TEXT' },
                { label: 'Link', value: 'LINK' },
              ]}
            />
          </Form.Item>

          {evidenceType === 'FILE' && (
            <Form.Item label="Upload File" name="file">
              <Upload
                fileList={fileList}
                onChange={(info) => setFileList(info.fileList)}
                maxCount={1}
              >
                <Button>Click to Upload</Button>
              </Upload>
            </Form.Item>
          )}

          {(evidenceType === 'URL' || evidenceType === 'LINK') && (
            <Form.Item
              label="URL"
              name="externalLink"
              rules={[{ type: 'url', message: 'Please enter valid URL' }]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
          )}

          {evidenceType === 'TEXT' && (
            <Form.Item label="Text Content" name="textContent">
              <Input.TextArea rows={4} placeholder="Enter text evidence" />
            </Form.Item>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit Evidence
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Existing Evidence */}
      {existingEvidence.length > 0 && (
        <Card title="Submitted Evidence" type="inner">
          <List
            dataSource={existingEvidence}
            renderItem={(evidence) => (
              <List.Item
                actions={[
                  canVerify && evidence.isVerified === false && (
                    <Button
                      size="small"
                      onClick={() => handleVerification(evidence)}
                    >
                      Verify
                    </Button>
                  ),
                  onDelete && (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => onDelete(evidence.id)}
                    />
                  ),
                ]}
              >
                <List.Item.Meta
                  title={evidence.title}
                  description={
                    <div>
                      <Tag color="blue">{evidence.evidenceType}</Tag>
                      {evidence.isVerified ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Verified
                        </Tag>
                      ) : (
                        <Tag color="orange">Pending Verification</Tag>
                      )}
                      <div style={{ marginTop: '8px', color: '#666' }}>
                        <small>
                          Submitted by {evidence.submittedByName} on{' '}
                          {new Date(evidence.uploadedAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        {renderEvidenceContent(evidence)}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Verification Modal */}
      <Modal
        title="Verify Evidence"
        visible={verificationModal}
        onOk={() => submitVerification(true)}
        onCancel={() => setVerificationModal(false)}
        okText="Approve"
        cancelText="Cancel"
        footer={[
          <Button key="reject" danger onClick={() => submitVerification(false)}>
            Reject
          </Button>,
          <Button key="cancel" onClick={() => setVerificationModal(false)}>
            Cancel
          </Button>,
          <Button key="approve" type="primary" onClick={() => submitVerification(true)}>
            Approve
          </Button>,
        ]}
      >
        <div>
          <p>
            <strong>Title:</strong> {selectedEvidence?.title}
          </p>
          <p>
            <strong>Type:</strong> {selectedEvidence?.evidenceType}
          </p>
          <p>
            <strong>Description:</strong> {selectedEvidence?.description}
          </p>
          <Input.TextArea
            rows={4}
            placeholder="Enter verification comments"
            value={verificationComments}
            onChange={(e) => setVerificationComments(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};

export default EvidenceUpload;
