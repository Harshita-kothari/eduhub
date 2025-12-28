import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { PomodoroSession } from '@/types/productivity';
import { SimpleChart } from '@/components/analytics/SimpleChart';
import { useMemo } from 'react';

const Focus = () => {
  const [sessions] = useUserLocalStorage<PomodoroSession[]>('pomodoro-sessions', []);

  const weeklyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const daySessions = sessions.filter(
        s => s.completedAt.startsWith(date) && s.type === 'focus'
      );
      const minutes = Math.round(daySessions.reduce((acc, s) => acc + s.duration, 0) / 60);
      const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date).getDay()];
      return { label: dayName, value: minutes };
    });
  }, [sessions]);

  const totalMinutes = useMemo(() => {
    return Math.round(sessions.filter(s => s.type === 'focus').reduce((acc, s) => acc + s.duration, 0) / 60);
  }, [sessions]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Focus Timer</h1>
          <p className="text-muted-foreground">
            Stay focused with the Pomodoro technique. Work in intervals with breaks.
          </p>
        </motion.div>

        {/* Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8"
        >
          <PomodoroTimer />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleChart 
            data={weeklyData} 
            title="Focus Minutes This Week" 
            color="primary"
            maxValue={Math.max(...weeklyData.map(d => d.value), 60)}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4">All-Time Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Sessions</span>
                <span className="text-2xl font-display font-bold">
                  {sessions.filter(s => s.type === 'focus').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Focus Time</span>
                <span className="text-2xl font-display font-bold">
                  {totalMinutes >= 60 
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` 
                    : `${totalMinutes}m`
                  }
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <h3 className="font-display font-semibold mb-3">Focus Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Work for 25 minutes, then take a 5-minute break
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              After 4 sessions, take a longer 15-30 minute break
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Remove distractions: silence notifications, close unnecessary tabs
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              Stay hydrated and take short walks during breaks
            </li>
          </ul>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Focus;
