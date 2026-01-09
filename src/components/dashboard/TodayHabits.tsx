"use client";

import { Habit, logHabit } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Sparkles, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TodayHabitsProps {
  habits: (Habit & { todaysLog?: { value: number } })[];
}

export function TodayHabits({ habits }: TodayHabitsProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [localHabits, setLocalHabits] = useState(habits);

  const handleIncrement = async (habit: Habit & { todaysLog?: { value: number } }) => {
    setLoadingId(habit.id);
    
    // Optimistic update
    setLocalHabits(prev => prev.map(h => {
      if (h.id === habit.id) {
        return {
          ...h,
          todaysLog: { value: (h.todaysLog?.value || 0) + 1 }
        };
      }
      return h;
    }));

    try {
      const today = new Date().toISOString().split("T")[0];
      await logHabit(habit.id, today, 1);
      toast({ 
        title: "✨ ¡Bien hecho!",
        description: `${habit.name} registrado`
      });
    } catch {
      // Revert on error
      setLocalHabits(habits);
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoadingId(null);
    }
  };

  const completedCount = localHabits.filter(h => (h.todaysLog?.value || 0) >= h.target_value).length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-base font-semibold">Hábitos</CardTitle>
          {habits.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedCount}/{habits.length}
            </span>
          )}
        </div>
        <Link 
          href="/dashboard/habits"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          Ver todos <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 px-3 pb-3 space-y-1">
        {localHabits.slice(0, 5).map((habit) => {
          const currentValue = habit.todaysLog?.value || 0;
          const isCompleted = currentValue >= habit.target_value;
          const progress = Math.min(100, (currentValue / habit.target_value) * 100);
          
          return (
            <div 
              key={habit.id} 
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                isCompleted ? "bg-green-50 dark:bg-green-950/30" : "hover:bg-muted/50"
              )}
            >
              <div className="text-lg flex-shrink-0">{habit.icon || "✨"}</div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm truncate",
                  isCompleted && "text-green-700 dark:text-green-400"
                )}>
                  {habit.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isCompleted ? "bg-green-500" : "bg-purple-500"
                      )}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {currentValue}/{habit.target_value}
                  </span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 rounded-full flex-shrink-0 transition-all",
                  isCompleted 
                    ? "text-green-600 bg-green-100 dark:bg-green-900/50 hover:bg-green-200" 
                    : "hover:bg-purple-100 hover:text-purple-600"
                )}
                onClick={() => handleIncrement(habit)}
                disabled={loadingId === habit.id}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="text-center py-6">
            <Sparkles className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No tienes hábitos activos</p>
            <Link href="/dashboard/habits">
              <Button variant="link" size="sm" className="mt-2">
                Crear primer hábito
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
