import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Pin, Trash2 } from 'lucide-react';
import { Note } from '@/types/productivity';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onPin: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (note: Note) => void;
}

export const NoteCard = ({ note, onPin, onDelete, onClick }: NoteCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick(note)}
      className={cn(
        "glass-card p-4 cursor-pointer group hover:border-primary/30 transition-colors",
        note.isPinned && "ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium line-clamp-1 flex-1">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin(note.id);
            }}
            className={cn(
              "p-1.5 rounded hover:bg-muted",
              note.isPinned && "text-primary"
            )}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 rounded hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
        {note.content}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {note.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.updatedAt), 'MMM d')}
        </span>
      </div>
    </motion.div>
  );
};
