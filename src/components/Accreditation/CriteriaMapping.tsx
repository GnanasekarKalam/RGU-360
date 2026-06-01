// src/components/Accreditation/CriteriaMapping.tsx
// Criteria Mapping Interface Component

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
  Alert,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface MappingRecord {
  id: string;
  criteriaCode: string;
  criteriaTitle: string;
  mappingType: string;
  entityName: string;
  createdAt: string;
  evidences: number;
  status: string;
}

interface CriteriaMappingProps {
  bodyId?: string;
  onMappingCreated?: () => void;
}

const CriteriaMapping: React.FC<CriteriaMappingProps> = ({
  bodyId,
  onMappingCreated,
}) => {
  const [form] = Form.useForm();
  const [mappings, setMappings] = useState<MappingRecord[]>([]);
  const [criteria, setCriteria] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [bodyId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch mappings
      const mappingsRes = await fetch('/api/accreditation/mappings');
      const mappingsData = await mappingsRes.json();
      if (mappingsData.success) {
        setMappings(mappingsData.mappings || []);
      }

      // Fetch criteria
      const criteriaRes = await fetch(
        `/api/accreditation/criteria${bodyId ? `?bodyId=${bodyId}` : ''}`
      );
      const criteriaData = await criteriaRes.json();
      if (criteriaData.success) {
        setCriteria(criteriaData.criteria || []);
      }

      // Fetch faculties
      const facultyRes = await fetch('/api/faculty-master');
      const facultyData = await facultyRes.json();
      if (facultyData.success) {
        setFaculties(facultyData.faculty || []);
      }

      // Fetch students
      const studentRes = await fetch('/api/student-master');
      const studentData = await studentRes.json();
      if (studentData.success) {
        setStudents(studentData.student || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMapping = async (values: any) => {
    try {
      const payload = {
        criteriaId: values.criteriaId,
        mappingType: values.mappingType,
        facultyId: values.mappingType === 'FACULTY' ? values.entityId : null,
        studentId: values.mappingType === 'STUDENT' ? values.entityId : null,
        description: values.description,
      };

      const response = await fetch('/api/accreditation/mappings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        message.success('Mapping created successfully');
        setIsModalVisible(false);
        form.resetFields();
        fetchData();
        onMappingCreated?.();
      } else {
        message.error(data.message || 'Failed to create mapping');
      }
    } catch (error) {
      console.error('Error creating mapping:', error);
      message.error('Error creating mapping');
    }
  };

  const handleBulkMapping = async () => {
    Modal.confirm({
      title: 'Bulk Faculty Mapping',
      content: 'This will create mappings for selected faculties and criteria.',
      okText: 'Proceed',
      onOk: async () => {
        try {
          const response = await fetch('/api/accreditation/faculty-mapping/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              facultyIds: faculties.slice(0, 5).map((f) => f.id), // Demo: first 5
              criteriaIds: criteria.slice(0, 3).map((c) => c.id), // Demo: first 3
            }),
          });

          const data = await response.json();

          if (data.success) {
            message.success(`${data.mappings?.length || 0} mappings created`);
            fetchData();
          } else {
            message.error(data.message || 'Bulk mapping failed');
          }
        } catch (error) {
          console.error('Error:', error);
          message.error('Error performing bulk mapping');
        }
      },
    });
  };

  const columns: ColumnsType<MappingRecord> = [
    {
      title: 'Criteria Code',
      dataIndex: 'criteriaCode',
      key: 'criteriaCode',
      width: 120,
    },
    {
      title: 'Criteria Title',
      dataIndex: 'criteriaTitle',
      key: 'criteriaTitle',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'mappingType',
      key: 'mappingType',
      width: 100,
      render: (text) => (
        <span style={{ textTransform: 'capitalize' }}>{text.toLowerCase()}</span>
      ),
    },
    {
      title: 'Entity',
      dataIndex: 'entityName',
      key: 'entityName',
    },
    {
      title: 'Evidence',
      dataIndex: 'evidences',
      key: 'evidences',
      width: 80,
      render: (count) => <strong>{count}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span style={{ color: status === 'ACTIVE' ? '#52c41a' : '#faad14' }}>
          {status}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => setEditingId(record.id)}
          />
          <Button type="text" size="small" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div className="criteria-mapping">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Row justify="space-between" align="middle">
            <h2>Criteria Mapping Management</h2>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
              >
                New Mapping
              </Button>
              <Button icon={<BgColorsOutlined />} onClick={handleBulkMapping}>
                Bulk Mapping
              </Button>
            </Space>
          </Row>

          {criteria.length === 0 && (
            <Alert
              message="No criteria available"
              description="Please ensure accreditation body and criteria are set up first."
              type="warning"
            />
          )}

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={mappings}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Spin>
        </Space>
      </Card>

      <Modal
        title={editingId ? 'Edit Mapping' : 'Create Criteria Mapping'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingId(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateMapping}
        >
          <Form.Item
            label="Criteria"
            name="criteriaId"
            rules={[{ required: true, message: 'Please select criteria' }]}
          >
            <Select
              placeholder="Select criteria"
              options={criteria.map((c) => ({
                label: `${c.criteriaCode} - ${c.criteriaTitle}`,
                value: c.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Mapping Type"
            name="mappingType"
            rules={[{ required: true, message: 'Please select mapping type' }]}
          >
            <Select
              placeholder="Select type"
              options={[
                { label: 'Faculty', value: 'FACULTY' },
                { label: 'Student', value: 'STUDENT' },
                { label: 'Department', value: 'DEPARTMENT' },
              ]}
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.mappingType !== currentValues.mappingType
            }
          >
            {({ getFieldValue }) => {
              const mappingType = getFieldValue('mappingType');
              if (mappingType === 'FACULTY') {
                return (
                  <Form.Item
                    label="Faculty"
                    name="entityId"
                    rules={[{ required: true, message: 'Please select faculty' }]}
                  >
                    <Select
                      placeholder="Select faculty"
                      options={faculties.map((f) => ({
                        label: f.user?.firstName + ' ' + f.user?.lastName,
                        value: f.id,
                      }))}
                    />
                  </Form.Item>
                );
              }
              if (mappingType === 'STUDENT') {
                return (
                  <Form.Item
                    label="Student"
                    name="entityId"
                    rules={[{ required: true, message: 'Please select student' }]}
                  >
                    <Select
                      placeholder="Select student"
                      options={students.map((s) => ({
                        label: s.user?.firstName + ' ' + s.user?.lastName,
                        value: s.id,
                      }))}
                    />
                  </Form.Item>
                );
              }
              return null;
            }}
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Add mapping description" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CriteriaMapping;
