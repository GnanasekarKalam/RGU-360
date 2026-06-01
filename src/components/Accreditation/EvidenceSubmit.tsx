// src/components/Accreditation/EvidenceSubmit.tsx
// Evidence Submission Component

import React, { useEffect, useState } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Table,
  Space,
  Modal,
  message,
  Input,
  Spin,
  Upload,
  Row,
  Col,
  Tag,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  CloudUploadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { RcFile } from 'antd/es/upload';

interface EvidenceRecord {
  id: string;
  title: string;
  evidenceType: string;
  documentType?: string;
  status: string;
  submittedBy: string;
  uploadedAt: string;
  isVerified: boolean;
}

interface EvidenceSubmitProps {
  mappingId?: string;
  onEvidenceSubmitted?: () => void;
}

const EvidenceSubmit: React.FC<EvidenceSubmitProps> = ({
  mappingId,
  onEvidenceSubmitted,
}) => {
  const [form] = Form.useForm();
  const [evidence, setEvidence] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<RcFile | null>(null);
  const [mappings, setMappings] = useState<any[]>([]);

  useEffect(() => {
    fetchMappings();
    if (mappingId) {
      fetchEvidence(mappingId);
    }
  }, [mappingId]);

  const fetchMappings = async () => {
    try {
      const response = await fetch('/api/accreditation/mappings');
      const data = await response.json();
      if (data.success) {
        setMappings(data.mappings || []);
      }
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const fetchEvidence = async (mId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/accreditation/evidence/${mId}`);
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

  const handleSubmitEvidence = async (values: any) => {
    try {
      if (!uploadedFile && !values.externalLink) {
        message.error('Please upload a file or provide an external link');
        return;
      }

      // In a real app, upload file to cloud storage (S3, Azure, etc.)
      const fileUrl = uploadedFile ? `/evidence/${uploadedFile.name}` : null;

      const payload = {
        mappingId: values.mappingId,
        title: values.title,
        description: values.description,
        evidenceType: values.evidenceType,
        documentType: values.documentType,
        fileUrl: fileUrl,
        externalLink: values.externalLink,
        academicYear: values.academicYear || new Date().getFullYear().toString(),
      };

      const response = await fetch('/api/accreditation/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Evidence submitted successfully');
        setIsModalVisible(false);
        form.resetFields();
        setUploadedFile(null);
        if (mappingId) {
          fetchEvidence(mappingId);
        }
        onEvidenceSubmitted?.();
      } else {
        message.error(data.message || 'Failed to submit evidence');
      }
    } catch (error) {
      console.error('Error submitting evidence:', error);
      message.error('Error submitting evidence');
    }
  };

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'DOCUMENT':
        return <FilePdfOutlined />;
      case 'IMAGE':
        return <FileImageOutlined />;
      case 'LINK':
        return <LinkOutlined />;
      default:
        return <CloudUploadOutlined />;
    }
  };

  const getEvidenceStatus = (isVerified: boolean) => {
    return isVerified ? (
      <Tag color="success">Verified</Tag>
    ) : (
      <Tag color="orange">Pending</Tag>
    );
  };

  const columns: ColumnsType<EvidenceRecord> = [
    {
      title: 'Type',
      dataIndex: 'evidenceType',
      key: 'evidenceType',
      width: 100,
      render: (type) => (
        <Space>
          {getEvidenceIcon(type)}
          <span style={{ textTransform: 'capitalize' }}>{type.toLowerCase()}</span>
        </Space>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: 'Document Type',
      dataIndex: 'documentType',
      key: 'documentType',
      render: (text) => text || '-',
    },
    {
      title: 'Submitted By',
      dataIndex: 'submittedBy',
      key: 'submittedBy',
      width: 120,
    },
    {
      title: 'Uploaded',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      width: 100,
      render: (isVerified) => getEvidenceStatus(isVerified),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" icon={<EyeOutlined />} />
          {!record.isVerified && (
            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="evidence-submit">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h2>Evidence Management</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
            >
              Submit Evidence
            </Button>
          </Row>

          {evidence.length === 0 && (
            <Alert
              message="No evidence submitted"
              description="Please submit evidence to demonstrate compliance with accreditation criteria."
              type="info"
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

      <Modal
        title="Submit Evidence"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setUploadedFile(null);
        }}
        onOk={() => form.submit()}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitEvidence}
        >
          <Form.Item
            label="Criteria Mapping"
            name="mappingId"
            rules={[{ required: true, message: 'Please select a mapping' }]}
          >
            <Select
              placeholder="Select the criteria mapping"
              options={mappings.map((m) => ({
                label: `${m.criteria?.criteriaCode} - ${m.criteria?.criteriaTitle}`,
                value: m.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Evidence Title"
            name="title"
            rules={[{ required: true, message: 'Please enter evidence title' }]}
          >
            <Input placeholder="E.g., Course Syllabus, Assignment Papers" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Describe the evidence in detail" />
          </Form.Item>

          <Form.Item
            label="Evidence Type"
            name="evidenceType"
            rules={[{ required: true, message: 'Please select evidence type' }]}
          >
            <Select
              placeholder="Select type"
              options={[
                { label: 'Document', value: 'DOCUMENT' },
                { label: 'Image', value: 'IMAGE' },
                { label: 'Video', value: 'VIDEO' },
                { label: 'Link', value: 'LINK' },
                { label: 'Data', value: 'DATA' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.evidenceType !== currentValues.evidenceType
            }
          >
            {({ getFieldValue }) => {
              const evidenceType = getFieldValue('evidenceType');
              if (evidenceType === 'LINK') {
                return (
                  <Form.Item
                    label="External Link"
                    name="externalLink"
                    rules={[
                      { required: true, message: 'Please provide a link' },
                      { type: 'url', message: 'Please enter a valid URL' },
                    ]}
                  >
                    <Input placeholder="https://example.com/evidence" />
                  </Form.Item>
                );
              }
              return (
                <Form.Item
                  label="Upload File"
                  name="file"
                  rules={[{ required: true, message: 'Please upload a file' }]}
                >
                  <Upload
                    maxCount={1}
                    beforeUpload={(file) => {
                      setUploadedFile(file);
                      return false;
                    }}
                    onRemove={() => setUploadedFile(null)}
                  >
                    <Button icon={<CloudUploadOutlined />}>
                      Click to Upload
                    </Button>
                  </Upload>
                </Form.Item>
              );
            }}
          </Form.Item>

          <Form.Item
            label="Document Type"
            name="documentType"
          >
            <Input placeholder="E.g., PDF, Word, Spreadsheet" />
          </Form.Item>

          <Form.Item
            label="Academic Year"
            name="academicYear"
          >
            <Select
              placeholder="Select academic year"
              options={[
                { label: '2025-2026', value: '2025-2026' },
                { label: '2024-2025', value: '2024-2025' },
                { label: '2023-2024', value: '2023-2024' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EvidenceSubmit;
