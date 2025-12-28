import { useState } from 'react';
import { motion } from 'framer-motion';
import { MoodEntry } from '@/types/productivity';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MoodSelectorProps {
  onSave: (entry: Omit<MoodEntry, 'id'>) => void;
  existingEntry?: MoodEntry;
}

const moods = [
  { value: 'terrible', emoji: '😢', label: 'Terrible', color: 'bg-destructive/20' },
  { value: 'bad', emoji: '😔', label: 'Bad', color: 'bg-warning/20' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'bg-muted' },
  { value: 'good', emoji: '🙂', label: 'Good', color: 'bg-success/20' },
  { value: 'great', emoji: '😄', label: 'Great', color: 'bg-primary/20' },
] as const;

export const MoodSelector = ({ onSave, existingEntry }: MoodSelectorProps) => {
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood']>(
    existingEntry?.mood || 'okay'
  );
  const [energy, setEnergy] = useState(existingEntry?.energy || 50);
  const [note, setNote] = useState(existingEntry?.note || '');

  const handleSave = () => {
    onSave({
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      energy,
      note: note.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Mood Selection */}
      <div>
        <label className="text-sm text-muted-foreground mb-3 block">
          How are you feeling today?
        </label>
        <div className="flex gap-2 justify-between">
          {moods.map((mood) => (
            <motion.button
              key={mood.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedMood(mood.value)}
              className={cn(
                "flex-1 p-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                selectedMood === mood.value
                  ? `${mood.color} ring-2 ring-primary`
                  : "bg-muted hover:bg-muted/80"
              )}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Energy Level */}
      <div>
        <label className="text-sm text-muted-foreground mb-3 block">
          Energy Level: {energy}%
        </label>
        <Slider
          value={[energy]}
          onValueChange={([val]) => setEnergy(val)}
          max={100}
          step={5}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">Low</span>
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">
          Daily Note (optional)
        </label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What's on your mind today?"
          className="resize-none"
          rows={3}
        />
      </div>

      <Button onClick={handleSave} className="w-full">
        {existingEntry ? 'Update Entry' : 'Save Entry'}
      </Button>
    </div>
  );
};
