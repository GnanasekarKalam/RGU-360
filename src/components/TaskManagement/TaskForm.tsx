// src/components/TaskManagement/TaskForm.tsx
// Task creation and editing form

import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  DatePicker,
  Checkbox,
  Button,
  Modal,
  Tag,
} from 'antd';
import dayjs from 'dayjs';

interface TaskFormProps {
  initialTask?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const [tags, setTags] = useState<string[]>(initialTask?.tags || []);
  const [newTag, setNewTag] = useState('');

  const taskTypes = [
    { label: 'General', value: 'GENERAL' },
    { label: 'Academic', value: 'ACADEMIC' },
    { label: 'Administrative', value: 'ADMINISTRATIVE' },
    { label: 'Research', value: 'RESEARCH' },
  ];

  const priorities = [
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' },
    { label: 'Urgent', value: 'URGENT' },
  ];

  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (removedTag: string) => {
    setTags(tags.filter((tag) => tag !== removedTag));
  };

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      dueDate: values.dueDate.toDate(),
      tags,
    };
    onSubmit(data);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        title: initialTask?.title || '',
        description: initialTask?.description || '',
        taskType: initialTask?.taskType || 'GENERAL',
        priority: initialTask?.priority || 'MEDIUM',
        dueDate: initialTask?.dueDate ? dayjs(initialTask.dueDate) : undefined,
        requiresApproval: initialTask?.requiresApproval || false,
        category: initialTask?.category || '',
      }}
    >
      <Form.Item
        label="Task Title"
        name="title"
        rules={[{ required: true, message: 'Please enter task title' }]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea rows={4} placeholder="Enter task description" />
      </Form.Item>

      <Form.Item
        label="Task Type"
        name="taskType"
        rules={[{ required: true, message: 'Please select task type' }]}
      >
        <Select options={taskTypes} />
      </Form.Item>

      <Form.Item
        label="Priority"
        name="priority"
        rules={[{ required: true, message: 'Please select priority' }]}
      >
        <Select options={priorities} />
      </Form.Item>

      <Form.Item
        label="Due Date"
        name="dueDate"
        rules={[{ required: true, message: 'Please select due date' }]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item label="Category" name="category">
        <Input placeholder="Enter category (e.g., Mathematics, Physics)" />
      </Form.Item>

      <Form.Item
        label="Requires Approval"
        name="requiresApproval"
        valuePropName="checked"
      >
        <Checkbox>This task requires approval before completion</Checkbox>
      </Form.Item>

      <div className="tags-section">
        <label>Tags</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Input
            placeholder="Add tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onPressEnter={handleAddTag}
          />
          <Button onClick={handleAddTag}>Add Tag</Button>
        </div>
        <div>
          {tags.map((tag) => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              color="blue"
            >
              {tag}
            </Tag>
          ))}
        </div>
      </div>

      <Form.Item>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            {initialTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default TaskForm;
