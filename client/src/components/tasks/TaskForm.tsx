import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Task, TaskFormData, TaskStatus, TaskPriority } from '@/types';
import { Plus, Save, X } from 'lucide-react';

interface TaskFormProps {
  task?: Task | null;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  assignedUsers: [],
  dueDate: '',
};

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isOpen,
  setIsOpen,
}) => {
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignedUsers: task.assignedUsers.map(user => user.id),
        dueDate: task.dueDate || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [task]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: keyof TaskFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      setIsOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel();
    setIsOpen(false);
    setFormData(initialFormData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {task ? (
              <>
                <Save className="h-5 w-5 text-primary" />
                <span>Edit Task</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary" />
                <span>Create New Task</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
                rows={3}
              />
            </div>

            {/* Status and Priority Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: TaskStatus) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-pending"></div>
                        <span>Pending</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="progress">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-progress"></div>
                        <span>In Progress</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="completed">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-completed"></div>
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TaskPriority) => handleSelectChange('priority', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-muted"></div>
                        <span>Low</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-pending"></div>
                        <span>Medium</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-destructive"></div>
                        <span>High</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[var(--gradient-primary)] hover:shadow-hover"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{task ? 'Updating...' : 'Creating...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {task ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{task ? 'Update Task' : 'Create Task'}</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};