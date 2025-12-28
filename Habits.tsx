import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { HabitCard } from '@/components/habits/HabitCard';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { Habit } from '@/types/productivity';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const HABIT_ICONS = ['💪', '📚', '🏃', '💧', '🧘', '😴', '🥗', '✍️', '🎯', '🎨'];
const HABIT_COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

const Habits = () => {
  const [habits, setHabits] = useUserLocalStorage<Habit[]>('habits', []);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(HABIT_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0]);

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      icon: selectedIcon,
      color: selectedColor,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitName('');
    setIsAdding(false);
  };

  const handleToggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id !== id) return habit;
        
        const isCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter(d => d !== today)
            : [...habit.completedDates, today],
        };
      })
    );
  };

  const handleDeleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Habits</h1>
          <p className="text-muted-foreground">
            Build positive habits and track your streaks.
          </p>
        </motion.div>

        {/* Progress */}
        {habits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground">Today's Progress</span>
              <span className="font-display font-bold">
                {completedToday}/{habits.length}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(completedToday / habits.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Add Habit Form */}
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">New Habit</h3>
                <button onClick={() => setIsAdding(false)} className="p-1 hover:bg-muted rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <Input
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Habit name"
                autoFocus
              />

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Choose an icon</label>
                <div className="flex gap-2 flex-wrap">
                  {HABIT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setSelectedIcon(icon)}
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all",
                        selectedIcon === icon
                          ? "bg-primary/20 ring-2 ring-primary"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Choose a color</label>
                <div className="flex gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddHabit} disabled={!newHabitName.trim()}>
                  Add Habit
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
              <span>Add new habit</span>
            </motion.button>
          )}
        </AnimatePresence>

        {/* Habits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggle={handleToggleHabit}
              />
            ))}
          </AnimatePresence>
        </div>

        {habits.length === 0 && !isAdding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">
              No habits yet. Add one to start tracking!
            </p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default Habits;
