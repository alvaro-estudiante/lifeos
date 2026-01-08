"use client";

import { Habit, logHabit } from "@/lib/actions/habits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TodayHabitsListProps {
  habits: (Habit & { todaysLog?: { value: number } })[];
  date: string;
}

export function TodayHabitsList({ habits, date }: TodayHabitsListProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleIncrement = async (habit: Habit) => {
    setLoadingId(habit.id);
    try {
      await logHabit(habit.id, date, 1);
      toast({ title: "Hábito registrado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-muted/10 rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Hábitos de Hoy</h3>
      <div className="space-y-3">
        {habits.map((habit) => {
          const currentValue = habit.todaysLog?.value || 0;
          const isCompleted = currentValue >= habit.target_value;
          const progress = Math.min(100, Math.round((currentValue / habit.target_value) * 100));

          return (
            <Card key={habit.id} className={isCompleted ? "opacity-60 bg-muted/50" : ""}>
              <CardContent className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-lg">
                    {habit.icon || "✨"}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">{habit.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {currentValue}/{habit.target_value}
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${progress}%`, backgroundColor: habit.color }}
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant={isCompleted ? "ghost" : "outline"}
                  size="icon"
                  className={`h-8 w-8 rounded-full shrink-0 ${isCompleted ? 'text-green-500' : ''}`}
                  onClick={() => handleIncrement(habit)}
                  disabled={!!loadingId || isCompleted}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {habits.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4">
            No hay hábitos activos.
          </div>
        )}
      </div>
    </div>
  );
}