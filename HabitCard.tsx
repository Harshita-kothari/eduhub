import { motion } from 'framer-motion';
import { Check, Flame } from 'lucide-react';
import { Habit } from '@/types/productivity';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
}

const getStreak = (completedDates: string[]) => {
  if (completedDates.length === 0) return 0;
  
  const sorted = [...completedDates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const dateStr of sorted) {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) {
      streak++;
      currentDate = date;
    } else {
      break;
    }
  }
  
  return streak;
};

export const HabitCard = ({ habit, onToggle }: HabitCardProps) => {
  const today = new Date().toISOString().split('T')[0];
  const isCompletedToday = habit.completedDates.includes(today);
  const streak = getStreak(habit.completedDates);

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{habit.icon}</span>
          <div>
            <h3 className="font-medium">{habit.name}</h3>
            {streak > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 text-warning" />
                <span className="text-xs text-muted-foreground">
                  {streak} day streak
                </span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onToggle(habit.id)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all",
            isCompletedToday
              ? "bg-success text-success-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <Check className={cn("w-5 h-5", !isCompletedToday && "text-muted-foreground")} />
        </button>
      </div>

      {/* Week view */}
      <div className="flex gap-1.5">
        {last7Days.map((date, i) => {
          const isCompleted = habit.completedDates.includes(date);
          const isToday = date === today;
          const dayLabel = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(date).getDay()];
          
          return (
            <div key={date} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
              <div
                className={cn(
                  "w-full aspect-square rounded-md transition-colors",
                  isCompleted 
                    ? "bg-primary" 
                    : isToday 
                    ? "bg-muted border-2 border-primary/50" 
                    : "bg-muted"
                )}
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
