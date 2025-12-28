import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SimpleChartProps {
  data: { label: string; value: number }[];
  maxValue?: number;
  title: string;
  color?: 'primary' | 'accent' | 'success';
}

export const SimpleChart = ({ data, maxValue, title, color = 'primary' }: SimpleChartProps) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  const colorClasses = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    success: 'bg-success',
  };

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-medium text-muted-foreground mb-4">{title}</h3>
      
      <div className="flex items-end gap-2 h-32">
        {data.map((item, index) => {
          const height = (item.value / max) * 100;
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
                className={cn("w-full rounded-t-md", colorClasses[color])}
                style={{ minHeight: item.value > 0 ? '4px' : '0' }}
              />
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
