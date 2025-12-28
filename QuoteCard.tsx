import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { getRandomQuote } from '@/lib/quotes';

export const QuoteCard = () => {
  const [quote, setQuote] = useState(getRandomQuote());

  const refreshQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute top-4 right-4 opacity-10">
        <Quote className="w-16 h-16" />
      </div>
      
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <Quote className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            Daily Inspiration
          </span>
        </div>
        
        <blockquote className="text-lg font-medium leading-relaxed mb-3">
          "{quote.text}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <cite className="text-sm text-muted-foreground not-italic">
            — {quote.author}
          </cite>
          
          <button
            onClick={refreshQuote}
            className="p-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
