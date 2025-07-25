import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Task, TaskPriority } from '@/types';
import { Calendar, Edit, Trash2, User } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-pending text-pending-foreground',
  high: 'bg-destructive text-destructive-foreground',
};

const statusGradients = {
  pending: 'border-l-4 border-l-pending',
  progress: 'border-l-4 border-l-progress',
  completed: 'border-l-4 border-l-completed',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing hover:shadow-hover transition-all duration-200 ${statusGradients[task.status]} ${isDragging ? 'shadow-lg' : 'shadow-soft'}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {task.title}
          </h3>
          <Badge className={`text-xs ${priorityColors[task.priority]} ml-2 flex-shrink-0`}>
            {task.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
          {task.description}
        </p>

        {task.dueDate && (
          <div className="flex items-center text-xs text-muted-foreground mb-3">
            <Calendar className="h-3 w-3 mr-1" />
            {formatDate(task.dueDate)}
          </div>
        )}

        {/* Assigned Users */}
        {task.assignedUsers.length > 0 && (
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 text-muted-foreground" />
            <div className="flex -space-x-2">
              {task.assignedUsers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {task.assignedUsers.length > 3 && (
                <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{task.assignedUsers.length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {formatDate(task.updatedAt)}
        </span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="h-7 w-7 p-0 hover:bg-primary/10"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};