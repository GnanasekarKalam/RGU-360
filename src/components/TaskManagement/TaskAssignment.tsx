// src/components/TaskManagement/TaskAssignment.tsx
// Task assignment to users and groups

import React, { useState } from 'react';
import {
  Form,
  Select,
  Input,
  DatePicker,
  Button,
  Modal,
  Card,
  List,
  Tag,
  Divider,
  Spin,
} from 'antd';
import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Assignment {
  id: string;
  assignedTo: string;
  assignedToType: 'FACULTY' | 'STUDENT' | 'GROUP';
  dueDate?: Date;
  status: string;
}

interface TaskAssignmentProps {
  taskId: string;
  existingAssignments: Assignment[];
  onAssign: (data: any) => void;
  onRemove: (assignmentId: string) => void;
  isLoading?: boolean;
  faculties?: any[];
  students?: any[];
  groups?: any[];
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({
  taskId,
  existingAssignments,
  onAssign,
  onRemove,
  isLoading,
  faculties = [],
  students = [],
  groups = [],
}) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [assignmentType, setAssignmentType] = useState<'FACULTY' | 'STUDENT' | 'GROUP'>(
    'FACULTY'
  );

  const handleSubmit = (values: any) => {
    const data = {
      assignedToId: values.assignedToId,
      assignedToType: assignmentType,
      individualDueDate: values.individualDueDate?.toDate(),
    };
    onAssign(data);
    form.resetFields();
    setIsModalVisible(false);
  };

  const getOptionList = () => {
    if (assignmentType === 'FACULTY') {
      return faculties.map((f) => ({
        label: `${f.firstName} ${f.lastName} (Faculty)`,
        value: f.id,
      }));
    } else if (assignmentType === 'STUDENT') {
      return students.map((s) => ({
        label: `${s.firstName} ${s.lastName} (Student)`,
        value: s.id,
      }));
    } else {
      return groups.map((g) => ({
        label: `${g.name} (Group)`,
        value: g.id,
      }));
    }
  };

  const getAssigneeLabel = (assignment: Assignment) => {
    const facId = faculties.find((f) => f.id === assignment.assignedTo);
    const studId = students.find((s) => s.id === assignment.assignedTo);
    const grpId = groups.find((g) => g.id === assignment.assignedTo);

    if (facId) return `${facId.firstName} ${facId.lastName}`;
    if (studId) return `${studId.firstName} ${studId.lastName}`;
    if (grpId) return grpId.name;
    return 'Unknown';
  };

  const statusColors: { [key: string]: string } = {
    PENDING: 'blue',
    ACCEPTED: 'green',
    REJECTED: 'red',
    IN_PROGRESS: 'orange',
    COMPLETED: 'green',
  };

  return (
    <div>
      {/* Existing Assignments */}
      {existingAssignments.length > 0 && (
        <Card title="Current Assignments" style={{ marginBottom: '16px' }}>
          <List
            dataSource={existingAssignments}
            renderItem={(assignment) => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => onRemove(assignment.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={<UserOutlined />}
                  title={getAssigneeLabel(assignment)}
                  description={
                    <>
                      <Tag color={statusColors[assignment.status]}>
                        {assignment.status}
                      </Tag>
                      {assignment.dueDate && (
                        <span style={{ marginLeft: '8px' }}>
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Add Assignment Button */}
      <Button type="primary" onClick={() => setIsModalVisible(true)}>
        Add Assignment
      </Button>

      {/* Assignment Modal */}
      <Modal
        title="Assign Task"
        visible={isModalVisible}
        onOk={form.submit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={isLoading}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Assign To Type" name="assignmentType">
            <Select
              value={assignmentType}
              onChange={(value) => setAssignmentType(value)}
              options={[
                { label: 'Faculty', value: 'FACULTY' },
                { label: 'Student', value: 'STUDENT' },
                { label: 'Group', value: 'GROUP' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Select Recipient"
            name="assignedToId"
            rules={[{ required: true, message: 'Please select recipient' }]}
          >
            <Select
              placeholder={`Select ${assignmentType.toLowerCase()}`}
              options={getOptionList()}
            />
          </Form.Item>

          <Form.Item label="Individual Due Date" name="individualDueDate">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskAssignment;
