import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface ProductivityScoreProps {
  score: number;
}

export const ProductivityScore = ({ score }: ProductivityScoreProps) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-warning';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent!';
    if (score >= 60) return 'Good progress';
    if (score >= 40) return 'Keep going';
    return 'Let\'s improve';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-6 flex flex-col items-center justify-center"
    >
      <h3 className="text-sm text-muted-foreground font-medium mb-4">Today's Productivity</h3>
      
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-muted"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="45"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ strokeDasharray: circumference }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--accent))" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-3xl font-display font-bold ${getScoreColor(score)}`}
          >
            {score}%
          </motion.span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{getScoreLabel(score)}</span>
      </div>
    </motion.div>
  );
};
