"use client";

import { Habit, logHabit } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Target, ChevronRight } from "lucide-react";
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
      setLocalHabits(habits);
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoadingId(null);
    }
  };

  const completedCount = localHabits.filter(h => (h.todaysLog?.value || 0) >= h.target_value).length;
  const totalCount = localHabits.length;

  return (
    <Card>
      <CardHeader className="pb-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-500" />
            <CardTitle className="text-sm font-semibold">Hábitos</CardTitle>
            {totalCount > 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
          <Link 
            href="/dashboard/habits"
            className="text-xs text-primary flex items-center hover:underline"
          >
            Ver todos <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-3 pb-3">
        {localHabits.length > 0 ? (
          <div className="space-y-1">
            {localHabits.slice(0, 4).map((habit) => {
              const currentValue = habit.todaysLog?.value || 0;
              const isCompleted = currentValue >= habit.target_value;
              const progress = Math.min(100, (currentValue / habit.target_value) * 100);
              
              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-xl transition-all",
                    isCompleted ? "bg-purple-50 dark:bg-purple-950/30" : ""
                  )}
                >
                  {/* Emoji */}
                  <span className="text-base w-6 text-center flex-shrink-0">
                    {habit.icon || "✨"}
                  </span>
                  
                  {/* Name & Progress */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isCompleted && "text-purple-700 dark:text-purple-400"
                    )}>
                      {habit.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isCompleted ? "bg-purple-500" : "bg-purple-300"
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-8">
                        {currentValue}/{habit.target_value}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-7 w-7 rounded-full flex-shrink-0",
                      isCompleted 
                        ? "bg-purple-500 text-white hover:bg-purple-600" 
                        : "bg-muted hover:bg-purple-100"
                    )}
                    onClick={() => handleIncrement(habit)}
                    disabled={loadingId === habit.id}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Target className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Sin hábitos activos</p>
            <Link href="/dashboard/habits">
              <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                Crear primer hábito
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
