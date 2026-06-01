// src/components/TaskManagement/TaskNotificationCenter.tsx
// Real-time notification center for task events

import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Badge,
  Button,
  Empty,
  Tag,
  Drawer,
  Spin,
  message,
} from 'antd';
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

interface Notification {
  id: string;
  title: string;
  message: string;
  notificationType: 'ASSIGNMENT' | 'APPROVAL' | 'ESCALATION' | 'COMPLETION' | 'COMMENT';
  isRead: boolean;
  createdAt: Date;
  taskId: string;
  taskTitle?: string;
}

interface TaskNotificationCenterProps {
  notifications: Notification[];
  onMarkRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onNotificationClick?: (notification: Notification) => void;
  isLoading?: boolean;
}

const TaskNotificationCenter: React.FC<TaskNotificationCenterProps> = ({
  notifications = [],
  onMarkRead,
  onDelete,
  onNotificationClick,
  isLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.isRead).length);
  }, [notifications]);

  const handleMarkRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead?.(notificationId);
  };

  const handleDelete = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(notificationId);
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'ASSIGNMENT':
        return 'blue';
      case 'APPROVAL':
        return 'orange';
      case 'ESCALATION':
        return 'red';
      case 'COMPLETION':
        return 'green';
      case 'COMMENT':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPLETION':
        return <CheckCircleOutlined />;
      case 'ESCALATION':
        return <CloseCircleOutlined />;
      default:
        return null;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick?.(notification);
    if (!notification.isRead) {
      onMarkRead?.(notification.id);
    }
  };

  return (
    <>
      {/* Notification Bell Icon */}
      <div style={{ cursor: 'pointer', display: 'inline-block' }}>
        <Badge count={unreadCount} onClick={() => setOpen(true)}>
          <BellOutlined
            style={{ fontSize: '18px', color: '#1890ff' }}
          />
        </Badge>
      </div>

      {/* Notification Drawer */}
      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setOpen(false)}
        open={open}
        width={400}
      >
        <Spin spinning={isLoading}>
          {notifications.length === 0 ? (
            <Empty description="No notifications" />
          ) : (
            <List
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item
                  style={{
                    backgroundColor: notification.isRead ? 'transparent' : '#f5f5f5',
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleNotificationClick(notification)}
                  actions={[
                    !notification.isRead && (
                      <Button
                        size="small"
                        type="text"
                        icon={<CheckCircleOutlined />}
                        onClick={(e) => handleMarkRead(notification.id, e)}
                      />
                    ),
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => handleDelete(notification.id, e)}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getNotificationIcon(notification.notificationType)}
                        <span>{notification.title}</span>
                        {!notification.isRead && (
                          <Badge color="blue" style={{ marginLeft: '8px' }} />
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ margin: '4px 0' }}>{notification.message}</p>
                        <Tag color={getNotificationColor(notification.notificationType)}>
                          {notification.notificationType}
                        </Tag>
                        <small style={{ marginLeft: '8px', color: '#999' }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </small>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          {notifications.length > 0 && (
            <Button
              block
              style={{ marginTop: '16px' }}
              onClick={() => {
                // Mark all as read
                notifications.forEach((n) => {
                  if (!n.isRead) {
                    onMarkRead?.(n.id);
                  }
                });
              }}
            >
              Mark All as Read
            </Button>
          )}
        </Spin>
      </Drawer>
    </>
  );
};

export default TaskNotificationCenter;
