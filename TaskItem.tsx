import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, Trash2, Calendar, Flag } from 'lucide-react';
import { Task } from '@/types/productivity';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  const priorityConfig = {
    high: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'High' },
    medium: { color: 'text-warning', bg: 'bg-warning/10', label: 'Medium' },
    low: { color: 'text-success', bg: 'bg-success/10', label: 'Low' },
  };

  const priority = priorityConfig[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "glass-card p-4 flex items-start gap-4 group",
        task.status === 'completed' && "opacity-60"
      )}
    >
      <button
        onClick={() => onToggle(task.id)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
          task.status === 'completed'
            ? "bg-primary border-primary"
            : "border-muted-foreground hover:border-primary"
        )}
      >
        {task.status === 'completed' && (
          <Check className="w-3 h-3 text-primary-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium",
          task.status === 'completed' && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>
        
        {task.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          <span className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            priority.bg, priority.color
          )}>
            <Flag className="w-3 h-3" />
            {priority.label}
          </span>

          {task.dueDate && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>
    </motion.div>
  );
};
