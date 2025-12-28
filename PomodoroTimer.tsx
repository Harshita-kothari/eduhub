import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUserLocalStorage } from '@/hooks/useUserLocalStorage';
import { PomodoroSession } from '@/types/productivity';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_PRESETS = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(TIMER_PRESETS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useUserLocalStorage<PomodoroSession[]>('pomodoro-sessions', []);
  const [focusStreak, setFocusStreak] = useState(0);

  const totalTime = TIMER_PRESETS[mode];
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  useEffect(() => {
    // Calculate today's focus streak
    const today = new Date().toDateString();
    const todaySessions = sessions.filter(
      s => new Date(s.completedAt).toDateString() === today && s.type === 'focus'
    );
    setFocusStreak(todaySessions.length);
  }, [sessions]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer completed
      setIsRunning(false);
      
      if (mode === 'focus') {
        const newSession: PomodoroSession = {
          id: Date.now().toString(),
          duration: TIMER_PRESETS.focus,
          completedAt: new Date().toISOString(),
          type: 'focus',
        };
        setSessions((prev) => [...prev, newSession]);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, setSessions]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(TIMER_PRESETS[newMode]);
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(TIMER_PRESETS[mode]);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const modeConfig = {
    focus: { icon: Brain, label: 'Focus', color: 'text-primary' },
    shortBreak: { icon: Coffee, label: 'Short Break', color: 'text-success' },
    longBreak: { icon: Coffee, label: 'Long Break', color: 'text-accent' },
  };

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Mode Selection */}
      <div className="flex gap-2 mb-8">
        {(Object.keys(TIMER_PRESETS) as TimerMode[]).map((m) => {
          const config = modeConfig[m];
          return (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                mode === m
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <config.icon className="w-4 h-4" />
              {config.label}
            </button>
          );
        })}
      </div>

      {/* Timer Circle */}
      <div className="relative w-64 h-64 mb-8">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="128"
            cy="128"
            r="120"
            stroke="url(#timerGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            style={{ strokeDasharray: circumference, strokeDashoffset }}
            transition={{ duration: 0.5 }}
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-display font-bold tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-muted-foreground mt-2 capitalize">
            {modeConfig[mode].label}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleReset}
          className="rounded-full w-12 h-12"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setIsRunning(!isRunning)}
          size="lg"
          className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
        >
          {isRunning ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/settings')}
          className="rounded-full w-12 h-12"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 flex items-center gap-6">
        <div className="text-center">
          <p className="text-2xl font-display font-bold">{focusStreak}</p>
          <p className="text-xs text-muted-foreground">Focus sessions today</p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <p className="text-2xl font-display font-bold">
            {Math.round((focusStreak * TIMER_PRESETS.focus) / 60)}
          </p>
          <p className="text-xs text-muted-foreground">Minutes focused</p>
        </div>
      </div>
    </div>
  );
};
