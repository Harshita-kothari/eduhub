import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { LiveClock } from '@/components/dashboard/LiveClock';
import { QuoteCard } from '@/components/dashboard/QuoteCard';
import { ProductivityScore } from '@/components/dashboard/ProductivityScore';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { Task, Habit, PomodoroSession, MoodEntry } from '@/types/productivity';

const Index = () => {
  const [tasks] = useUserLocalStorage<Task[]>('tasks', []);
  const [habits] = useUserLocalStorage<Habit[]>('habits', []);
  const [sessions] = useUserLocalStorage<PomodoroSession[]>('pomodoro-sessions', []);
  const [moodEntries] = useUserLocalStorage<MoodEntry[]>('mood-entries', []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const completedToday = tasks.filter(
      t => t.status === 'completed' && t.completedAt?.startsWith(today)
    ).length;
    
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    
    const todaySessions = sessions.filter(
      s => s.completedAt.startsWith(today)
    );
    const focusMinutes = Math.round(todaySessions.reduce((acc, s) => acc + s.duration, 0) / 60);
    
    const habitsCompletedToday = habits.filter(
      h => h.completedDates.includes(today)
    ).length;

    // Calculate productivity score
    const taskScore = tasks.length > 0 ? (completedToday / Math.max(pendingTasks + completedToday, 1)) * 40 : 0;
    const habitScore = habits.length > 0 ? (habitsCompletedToday / habits.length) * 30 : 0;
    const focusScore = Math.min((focusMinutes / 120) * 30, 30);
    
    const productivityScore = Math.round(taskScore + habitScore + focusScore);

    return {
      completedToday,
      pendingTasks,
      focusMinutes,
      habitsCompletedToday,
      totalHabits: habits.length,
      productivityScore: Math.min(productivityScore, 100),
    };
  }, [tasks, habits, sessions]);

  const recentTasks = tasks.filter(t => t.status === 'pending').slice(0, 3);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your productivity overview.
          </p>
        </motion.div>

        {/* Top Row - Clock & Quote */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveClock />
          <QuoteCard />
        </div>

        {/* Stats & Score */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <ProductivityScore score={stats.productivityScore} />
          </div>
          
          <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Tasks Completed"
              value={stats.completedToday}
              subtitle="Today"
              icon={CheckCircle}
              variant="primary"
            />
            <StatsCard
              title="Pending Tasks"
              value={stats.pendingTasks}
              subtitle="Total"
              icon={Target}
              variant="default"
            />
            <StatsCard
              title="Focus Time"
              value={`${stats.focusMinutes}m`}
              subtitle="Today"
              icon={Clock}
              variant="accent"
            />
            <StatsCard
              title="Habits"
              value={`${stats.habitsCompletedToday}/${stats.totalHabits}`}
              subtitle="Completed today"
              icon={TrendingUp}
              variant="primary"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold">Upcoming Tasks</h3>
              <Link 
                to="/tasks" 
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-destructive' :
                      task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className="text-sm flex-1 line-clamp-1">{task.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pending tasks. Add some to get started!
              </p>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Start Focus', path: '/focus', icon: '🎯' },
                { label: 'Add Task', path: '/tasks', icon: '✏️' },
                { label: 'Track Habit', path: '/habits', icon: '🔥' },
                { label: 'Log Mood', path: '/mood', icon: '😊' },
              ].map((action) => (
                <Link
                  key={action.path}
                  to={action.path}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Today's Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold mb-4">Today's Focus</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasks Progress</span>
                <span className="text-sm font-medium">
                  {stats.completedToday}/{stats.completedToday + stats.pendingTasks}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(stats.completedToday / Math.max(stats.completedToday + stats.pendingTasks, 1)) * 100}%` 
                  }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Habits Completed</span>
                <span className="text-sm font-medium">
                  {stats.habitsCompletedToday}/{stats.totalHabits}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${(stats.habitsCompletedToday / Math.max(stats.totalHabits, 1)) * 100}%` 
                  }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-success to-accent rounded-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
