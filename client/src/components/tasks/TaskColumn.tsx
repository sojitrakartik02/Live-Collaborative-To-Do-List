import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TaskCard } from './TaskCard';
import { Task, TaskStatus } from '@/types';

interface TaskColumnProps {
  status: TaskStatus;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  gradient: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  title,
  icon: Icon,
  color,
  gradient,
  tasks,
  onEditTask,
  onDeleteTask,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div className="flex flex-col h-full">
      <Card className={`bg-gradient-to-b ${gradient} border-0 shadow-soft`}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon className={`h-5 w-5 text-${color}`} />
              <span className="text-lg font-semibold">{title}</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] mt-4 space-y-4 p-2 rounded-lg transition-colors duration-200 ${
          isOver ? 'bg-accent/20 border-2 border-dashed border-accent' : ''
        }`}
      >
        <SortableContext
          items={tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
              Drop tasks here
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  );
};