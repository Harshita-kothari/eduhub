import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import { getGreeting } from '@/lib/quotes';

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">👋</span>
        <h2 className="text-xl font-display font-semibold">
          {getGreeting()}!
        </h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-3xl font-display font-bold tabular-nums">
            {format(time, 'HH:mm')}
          </span>
          <span className="text-lg text-muted-foreground tabular-nums">
            {format(time, ':ss')}
          </span>
        </div>
        
        <div className="h-8 w-px bg-border" />
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">
            {format(time, 'EEEE, MMMM d, yyyy')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
