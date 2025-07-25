export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  assignedUsers: User[];
  priority: TaskPriority;
  dueDate?: string;
}

export type TaskStatus = 'pending' | 'progress' | 'completed';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface CreateTaskData {
  title: string;
  description: string;
  status: TaskStatus;
  assignedUsers: string[];
  priority: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
}

export interface AuthData {
  email: string;
  password: string;
}

export interface RegisterData extends AuthData {
  name: string;
  confirmPassword: string;
}

export interface SocketEvents {
  'task:created': (task: Task) => void;
  'task:updated': (task: Task) => void;
  'task:deleted': (taskId: string) => void;
  'user:joined': (user: User) => void;
  'user:left': (userId: string) => void;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedUsers: string[];
  dueDate?: string;
}