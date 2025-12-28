import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { MainLayout } from '@/components/layout/MainLayout';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { DailyScheduleItem } from '@/types/productivity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

const Schedule = () => {
  const [scheduleItems, setScheduleItems] = useUserLocalStorage<Record<string, DailyScheduleItem[]>>(
    'schedule-items',
    {}
  );
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newTask, setNewTask] = useState('');
  const [newSubject, setNewSubject] = useState('');

  const dateKey = format(selectedDate, 'yyyy-MM-dd');
  const todayItems = scheduleItems[dateKey] || [];

  const handleAddItem = () => {
    if (!newTask.trim()) return;

    const newItem: DailyScheduleItem = {
      id: Date.now().toString(),
      time: newTime,
      task: newTask.trim(),
      subject: newSubject.trim() || undefined,
      completed: false,
    };

    setScheduleItems(prev => ({
      ...prev,
      [dateKey]: [...(prev[dateKey] || []), newItem].sort((a, b) => a.time.localeCompare(b.time)),
    }));

    setNewTask('');
    setNewSubject('');
    setIsAdding(false);
  };

  const handleToggleItem = (id: string) => {
    setScheduleItems(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    setScheduleItems(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).filter(item => item.id !== id),
    }));
  };

  // Get next 7 days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Schedule</h1>
          <p className="text-muted-foreground">
            Plan your day hour by hour.
          </p>
        </motion.div>

        {/* Date Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {weekDays.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === dateKey;
            const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const itemCount = (scheduleItems[format(date, 'yyyy-MM-dd')] || []).length;

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center px-4 py-3 rounded-xl min-w-[70px] transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "glass-card hover:border-primary/30"
                )}
              >
                <span className="text-xs opacity-80">{format(date, 'EEE')}</span>
                <span className="text-lg font-display font-bold">{format(date, 'd')}</span>
                {itemCount > 0 && (
                  <span className={cn(
                    "text-xs mt-1 px-1.5 rounded-full",
                    isSelected ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                  )}>
                    {itemCount}
                  </span>
                )}
                {isToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-primary mt-1" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Add Item */}
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Add Schedule Item</h3>
                <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Time</label>
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Subject (optional)</label>
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g., Math, Work"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Task</label>
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="What do you need to do?"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem} disabled={!newTask.trim()}>
                  Add
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsAdding(true)}
              className="w-full glass-card p-4 flex items-center gap-3 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add to schedule</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Schedule Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-4">
            {format(selectedDate, 'EEEE, MMMM d')}
          </h3>

          <div className="space-y-1">
            {HOURS.map((hour) => {
              const hourStr = `${hour.toString().padStart(2, '0')}:`;
              const hourItems = todayItems.filter(item => item.time.startsWith(hourStr));
              const isPast = new Date().getHours() > hour && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

              return (
                <div key={hour} className="flex gap-4 min-h-[48px]">
                  <span className={cn(
                    "w-12 text-sm tabular-nums pt-3 flex-shrink-0",
                    isPast ? "text-muted-foreground/50" : "text-muted-foreground"
                  )}>
                    {format(new Date().setHours(hour, 0), 'h a')}
                  </span>

                  <div className="flex-1 border-l border-border pl-4 py-2 min-h-[48px]">
                    {hourItems.length > 0 ? (
                      <div className="space-y-2">
                        {hourItems.map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg group",
                              item.completed ? "bg-muted/50 opacity-60" : "bg-muted"
                            )}
                          >
                            <button
                              onClick={() => handleToggleItem(item.id)}
                              className={cn(
                                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                item.completed
                                  ? "bg-success border-success"
                                  : "border-muted-foreground hover:border-primary"
                              )}
                            >
                              {item.completed && <Check className="w-3 h-3 text-success-foreground" />}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm",
                                  item.completed && "line-through"
                                )}>
                                  {item.task}
                                </span>
                                {item.subject && (
                                  <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                    {item.subject}
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className="text-xs text-muted-foreground">
                              {item.time}
                            </span>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 rounded transition-all"
                            >
                              <X className="w-3 h-3 text-destructive" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Schedule;
