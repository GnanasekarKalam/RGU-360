// src/components/TaskManagement/TaskBoard.tsx
// Kanban-style task board component

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, Badge, Button, Menu, Dropdown } from 'antd';
import { EllipsisOutlined, CheckCircleOutlined, AlertOutlined } from '@ant-design/icons';
import './TaskBoard.css';

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: Date;
  progressPercentage: number;
  isEscalated: boolean;
  assignedCount?: number;
}

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ tasks, onTaskClick, onStatusChange }) => {
  const statuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
  const [tasksByStatus, setTasksByStatus] = useState<{ [key: string]: Task[] }>({});

  useEffect(() => {
    const grouped = statuses.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {} as { [key: string]: Task[] });
    setTasksByStatus(grouped);
  }, [tasks]);

  const handleDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newStatus = destination.droppableId;
    if (onStatusChange) {
      onStatusChange(draggableId, newStatus);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      LOW: 'blue',
      MEDIUM: 'orange',
      HIGH: 'red',
      URGENT: 'volcano',
    };
    return colors[priority] || 'default';
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="task-board">
        {statuses.map((status) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                className={`task-column ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className="column-header">
                  <h3>{status}</h3>
                  <Badge
                    count={tasksByStatus[status]?.length || 0}
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>

                <div className="tasks-container">
                  {tasksByStatus[status]?.map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                          onClick={() => onTaskClick(task.id)}
                        >
                          <Card size="small" className="task-card-content">
                            <div className="task-header">
                              <h4>{task.title}</h4>
                              {task.isEscalated && (
                                <AlertOutlined style={{ color: 'red' }} />
                              )}
                            </div>

                            <div className="task-badges">
                              <Badge
                                color={getPriorityColor(task.priority)}
                                text={task.priority}
                              />
                            </div>

                            <div className="task-progress">
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${task.progressPercentage}%` }}
                                />
                              </div>
                              <span>{task.progressPercentage}%</span>
                            </div>

                            <div className="task-footer">
                              <small>
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </small>
                              {task.assignedCount && (
                                <Badge count={task.assignedCount} />
                              )}
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TaskBoard;
