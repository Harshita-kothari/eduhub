import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, Flag } from 'lucide-react';
import { Task, Priority } from '@/types/productivity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
}

export const AddTaskForm = ({ onAdd }: AddTaskFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full glass-card p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span>Add new task</span>
      </button>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium">New Task</h3>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1 rounded hover:bg-muted"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        autoFocus
      />

      <Input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-muted-foreground" />
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium capitalize transition-colors",
                  priority === p
                    ? p === 'high'
                      ? 'bg-destructive/20 text-destructive'
                      : p === 'medium'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-success/20 text-success'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-muted rounded px-2 py-1 text-sm border-none outline-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={!title.trim()}>
          Add Task
        </Button>
      </div>
    </motion.form>
  );
};
