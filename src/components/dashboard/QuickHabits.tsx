'use client';

import { Habit, logHabit } from '@/lib/actions/habits';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QuickHabitsProps {
  habits: Habit[];
}

export function QuickHabits({ habits }: QuickHabitsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  // Filter top 4 active habits
  const topHabits = habits.filter(h => h.is_active).slice(0, 4);

  if (topHabits.length === 0) return null;

  const handleIncrement = async (habit: Habit) => {
    setLoading(habit.id);
    try {
      const today = new Date().toISOString().split('T')[0];
      await logHabit(habit.id, today, 1); // Assuming +1 for now
      toast({ title: `${habit.name} +1` });
    } catch {
      toast({ variant: "destructive", title: "Error al actualizar hábito" });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {topHabits.map((habit) => (
        <button
          key={habit.id}
          onClick={() => handleIncrement(habit)}
          disabled={loading === habit.id}
          className="flex items-center justify-between p-3 bg-card rounded-xl border shadow-sm hover:bg-muted/50 transition-colors text-left"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{habit.icon || "✨"}</span>
              <span className="font-medium truncate">{habit.name}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Meta: {habit.target_value} {habit.unit}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ml-2">
            {loading === habit.id ? (
              <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            ) : (
              <Plus className="h-4 w-4 text-primary" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}