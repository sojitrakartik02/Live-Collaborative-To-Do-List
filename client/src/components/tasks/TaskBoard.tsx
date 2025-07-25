import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent, closestCorners, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { TaskColumn } from './TaskColumn';
import { Task, TaskStatus, TaskFormData } from '@/types';
import { Plus, Clock, Play, CheckCircle } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design user interface components',
    description: 'Create reusable UI components for the dashboard including buttons, cards, and navigation elements.',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    assignedUsers: [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5a5?w=32&h=32&fit=crop&crop=face' }
    ],
    dueDate: '2024-01-20T00:00:00Z',
  },
  {
    id: '2',
    title: 'Implement authentication flow',
    description: 'Set up user registration, login, and password reset functionality.',
    status: 'progress',
    priority: 'high',
    createdAt: '2024-01-14T09:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    assignedUsers: [
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' }
    ],
    dueDate: '2024-01-18T00:00:00Z',
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples and response formats.',
    status: 'completed',
    priority: 'medium',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    assignedUsers: [
      { id: '3', name: 'Carol Davis', email: 'carol@example.com', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face' }
    ],
    dueDate: '2024-01-15T00:00:00Z',
  },
];

const statusConfig = {
  pending: {
    title: 'Pending',
    icon: Clock,
    color: 'pending',
    gradient: 'from-pending-soft to-pending-soft/50',
  },
  progress: {
    title: 'In Progress',
    icon: Play,
    color: 'progress',
    gradient: 'from-progress-soft to-progress-soft/50',
  },
  completed: {
    title: 'Completed',
    icon: CheckCircle,
    color: 'completed',
    gradient: 'from-completed-soft to-completed-soft/50',
  },
};

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { toast } = useToast();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Real-time task updates
  useEffect(() => {
    if (!socket) return;

    socket.on('task:created', (task: Task) => {
      setTasks(prev => [...prev, task]);
      toast({
        title: 'New task created',
        description: `"${task.title}" was added by ${task.assignedUsers[0]?.name || 'someone'}`,
      });
    });

    socket.on('task:updated', (updatedTask: Task) => {
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      toast({
        title: 'Task updated',
        description: `"${updatedTask.title}" was modified`,
      });
    });

    socket.on('task:deleted', (taskId: string) => {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: 'Task deleted',
        description: 'A task was removed from the board',
      });
    });

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
    };
  }, [socket, toast]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = async (formData: TaskFormData) => {
    try {
      const response = await axios.post(`${API_URL}/tasks`, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedUsers: formData.assignedUsers,
        dueDate: formData.dueDate,
      });

      const newTask = response.data;
      setTasks(prev => [...prev, newTask]);
      
      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('task:create', { task: newTask, roomId: 'workspace-1' });
      }

      toast({
        title: 'Task created!',
        description: `"${newTask.title}" has been added to the board`,
      });
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTask = async (formData: TaskFormData) => {
    if (!editingTask) return;

    try {
      const response = await axios.put(`${API_URL}/tasks/${editingTask.id}`, {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assignedUsers: formData.assignedUsers,
        dueDate: formData.dueDate,
      });

      const updatedTask = response.data;
      setTasks(prev => prev.map(task => 
        task.id === editingTask.id ? updatedTask : task
      ));

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('task:update', { task: updatedTask, roomId: 'workspace-1' });
      }

      setEditingTask(null);
      
      toast({
        title: 'Task updated!',
        description: `"${updatedTask.title}" has been updated`,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      
      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('task:delete', { taskId, roomId: 'workspace-1' });
      }

      toast({
        title: 'Task deleted',
        description: 'Task has been removed from the board',
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    // If dropping on the same status, do nothing
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status === newStatus) return;

    // Update task status
    const updatedTask = tasks.find(t => t.id === taskId);
    if (updatedTask) {
      const updateTaskStatus = async () => {
        try {
          const response = await axios.put(`${API_URL}/tasks/${taskId}`, {
            ...updatedTask,
            status: newStatus,
          });
          
          const newTask = response.data;
          setTasks(prev => prev.map(t => t.id === taskId ? newTask : t));
          
          // Emit to socket for real-time updates
          if (socket) {
            socket.emit('task:update', { task: newTask, roomId: 'workspace-1' });
          }

          toast({
            title: 'Task moved',
            description: `"${newTask.title}" moved to ${statusConfig[newStatus].title}`,
          });
        } catch (error) {
          console.error('Error updating task status:', error);
          toast({
            title: 'Error',
            description: 'Failed to move task',
            variant: 'destructive',
          });
        }
      };
      
      updateTaskStatus();
    }
  };

  const activeTask = tasks.find(task => task.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft/20 to-accent-soft/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Task Board</h1>
            <p className="text-muted-foreground">Manage your tasks with real-time collaboration</p>
          </div>
          <Button
            onClick={() => {
              setEditingTask(null);
              setIsFormOpen(true);
            }}
            className="bg-[var(--gradient-primary)] hover:shadow-hover"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {/* Task Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(Object.entries(statusConfig) as [TaskStatus, typeof statusConfig[TaskStatus]][]).map(([status, config]) => {
              const statusTasks = getTasksByStatus(status);

              return (
                <TaskColumn
                  key={status}
                  status={status}
                  title={config.title}
                  icon={config.icon}
                  color={config.color}
                  gradient={config.gradient}
                  tasks={statusTasks}
                  onEditTask={(task) => {
                    setEditingTask(task);
                    setIsFormOpen(true);
                  }}
                  onDeleteTask={handleDeleteTask}
                />
              );
            })}
          </div>

          <DragOverlay>
            {activeTask && (
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>

        {/* Task Form Modal */}
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setEditingTask(null);
            setIsFormOpen(false);
          }}
          isOpen={isFormOpen}
          setIsOpen={setIsFormOpen}
        />
      </div>
    </div>
  );
};