import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { Task, Habit, PomodoroSession, MoodEntry } from '@/types/productivity';
import { TrendingUp, CheckCircle, Clock, Target, Smile } from 'lucide-react';

const Analytics = () => {
  const [tasks] = useUserLocalStorage<Task[]>('tasks', []);
  const [habits] = useUserLocalStorage<Habit[]>('habits', []);
  const [sessions] = useUserLocalStorage<PomodoroSession[]>('pomodoro-sessions', []);
  const [moodEntries] = useUserLocalStorage<MoodEntry[]>('mood-entries', []);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
  }, []);

  const taskCompletionData = useMemo(() => {
    return last7Days.map((date) => {
      const completed = tasks.filter(
        t => t.completedAt?.startsWith(date)
      ).length;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
      return { label: dayName, value: completed };
    });
  }, [tasks, last7Days]);

  const focusTimeData = useMemo(() => {
    return last7Days.map((date) => {
      const minutes = Math.round(
        sessions
          .filter(s => s.completedAt.startsWith(date) && s.type === 'focus')
          .reduce((acc, s) => acc + s.duration, 0) / 60
      );
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
      return { label: dayName, value: minutes };
    });
  }, [sessions, last7Days]);

  const habitSuccessData = useMemo(() => {
    if (habits.length === 0) return [];
    
    return last7Days.map((date) => {
      const completed = habits.filter(h => h.completedDates.includes(date)).length;
      const percentage = Math.round((completed / habits.length) * 100);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
      return { label: dayName, value: percentage };
    });
  }, [habits, last7Days]);

  const moodData = useMemo(() => {
    const moodValues = { great: 100, good: 75, okay: 50, bad: 25, terrible: 0 };
    
    return last7Days.map((date) => {
      const entry = moodEntries.find(e => e.date === date);
      const value = entry ? moodValues[entry.mood] : 0;
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
      return { label: dayName, value };
    });
  }, [moodEntries, last7Days]);

  const weeklyStats = useMemo(() => {
    const totalTasksCompleted = tasks.filter(t => 
      last7Days.some(d => t.completedAt?.startsWith(d))
    ).length;
    
    const totalFocusMinutes = Math.round(
      sessions
        .filter(s => last7Days.some(d => s.completedAt.startsWith(d)) && s.type === 'focus')
        .reduce((acc, s) => acc + s.duration, 0) / 60
    );
    
    const avgHabitSuccess = habits.length > 0
      ? Math.round(
          last7Days.reduce((acc, date) => {
            const completed = habits.filter(h => h.completedDates.includes(date)).length;
            return acc + (completed / habits.length);
          }, 0) / 7 * 100
        )
      : 0;

    const weeklyProductivity = Math.min(
      Math.round(
        (totalTasksCompleted * 5) + 
        (totalFocusMinutes / 10) + 
        avgHabitSuccess * 0.3
      ),
      100
    );

    return { totalTasksCompleted, totalFocusMinutes, avgHabitSuccess, weeklyProductivity };
  }, [tasks, sessions, habits, last7Days]);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your productivity trends over time.
          </p>
        </motion.div>

        {/* Weekly Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-primary/15">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{weeklyStats.weeklyProductivity}%</p>
            <p className="text-xs text-muted-foreground">Weekly Score</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-success/15">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{weeklyStats.totalTasksCompleted}</p>
            <p className="text-xs text-muted-foreground">Tasks Completed</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-accent/15">
                <Clock className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">
              {weeklyStats.totalFocusMinutes >= 60
                ? `${Math.floor(weeklyStats.totalFocusMinutes / 60)}h`
                : `${weeklyStats.totalFocusMinutes}m`
              }
            </p>
            <p className="text-xs text-muted-foreground">Focus Time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-warning/15">
                <Target className="w-4 h-4 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{weeklyStats.avgHabitSuccess}%</p>
            <p className="text-xs text-muted-foreground">Habit Success</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SimpleChart 
              data={taskCompletionData} 
              title="Tasks Completed This Week" 
              color="success"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <SimpleChart 
              data={focusTimeData} 
              title="Focus Minutes This Week" 
              color="primary"
            />
          </motion.div>

          {habits.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <SimpleChart 
                data={habitSuccessData} 
                title="Habit Completion Rate (%)" 
                color="accent"
                maxValue={100}
              />
            </motion.div>
          )}

          {moodEntries.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <SimpleChart 
                data={moodData} 
                title="Mood Score This Week" 
                color="primary"
                maxValue={100}
              />
            </motion.div>
          )}
        </div>

        {/* Tips based on data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-3">Insights</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {weeklyStats.totalFocusMinutes < 60 && (
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                Try to increase your focus time. Aim for at least 2 hours per week.
              </li>
            )}
            {weeklyStats.avgHabitSuccess < 70 && habits.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                Your habit completion rate could improve. Start with one habit at a time.
              </li>
            )}
            {weeklyStats.totalTasksCompleted > 20 && (
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                Great job completing {weeklyStats.totalTasksCompleted} tasks this week!
              </li>
            )}
            {weeklyStats.weeklyProductivity >= 70 && (
              <li className="flex items-start gap-2">
                <span className="text-success">•</span>
                You're doing great! Keep up the excellent work.
              </li>
            )}
          </ul>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Analytics;
