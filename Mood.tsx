import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { MoodEntry } from '@/types/productivity';
import { format } from 'date-fns';

const moodEmojis = {
  great: '😄',
  good: '🙂',
  okay: '😐',
  bad: '😔',
  terrible: '😢',
};

const moodColors = {
  great: 'bg-primary/20 text-primary',
  good: 'bg-success/20 text-success',
  okay: 'bg-muted text-muted-foreground',
  bad: 'bg-warning/20 text-warning',
  terrible: 'bg-destructive/20 text-destructive',
};

const Mood = () => {
  const [entries, setEntries] = useUserLocalStorage<MoodEntry[]>('mood-entries', []);

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = entries.find(e => e.date === today);

  const handleSave = (entry: Omit<MoodEntry, 'id'>) => {
    if (todayEntry) {
      setEntries(prev =>
        prev.map(e => (e.id === todayEntry.id ? { ...e, ...entry } : e))
      );
    } else {
      setEntries(prev => [
        ...prev,
        { ...entry, id: Date.now().toString() },
      ]);
    }
  };

  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [entries]);

  const weeklyMoodData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map((date) => {
      const entry = entries.find(e => e.date === date);
      const dayName = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(date).getDay()];
      return { date, dayName, entry };
    });
  }, [entries]);

  const averageEnergy = useMemo(() => {
    if (recentEntries.length === 0) return 0;
    return Math.round(recentEntries.reduce((acc, e) => acc + e.energy, 0) / recentEntries.length);
  }, [recentEntries]);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display font-bold mb-2">Mood Tracker</h1>
          <p className="text-muted-foreground">
            Track your mood and energy levels daily.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Entry */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <h3 className="font-display font-semibold mb-4">
              {todayEntry ? "Update Today's Entry" : "How are you feeling today?"}
            </h3>
            <MoodSelector onSave={handleSave} existingEntry={todayEntry} />
          </motion.div>

          {/* Weekly Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Week View */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-4">This Week</h3>
              <div className="flex justify-between">
                {weeklyMoodData.map(({ date, dayName, entry }) => (
                  <div key={date} className="flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dayName}</span>
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        entry ? moodColors[entry.mood] : 'bg-muted'
                      }`}
                    >
                      {entry ? moodEmojis[entry.mood] : '•'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Energy */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Average Energy (7 days)
              </h3>
              <div className="flex items-center gap-4">
                <span className="text-3xl font-display font-bold">{averageEnergy}%</span>
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${averageEnergy}%` }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <h3 className="font-display font-semibold mb-4">Recent Entries</h3>
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${moodColors[entry.mood]}`}
                  >
                    {moodEmojis[entry.mood]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium capitalize">{entry.mood}</span>
                      <span className="text-xs text-muted-foreground">
                        • Energy: {entry.energy}%
                      </span>
                    </div>
                    {entry.note && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                        {entry.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.date), 'MMM d')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default Mood;
