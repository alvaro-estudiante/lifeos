"use client";

import { Habit, logHabit } from "@/lib/actions/habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface TodayHabitsProps {
  habits: (Habit & { todaysLog?: { value: number } })[];
}

export function TodayHabits({ habits }: TodayHabitsProps) {
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleIncrement = async (habit: Habit) => {
    setLoadingId(habit.id);
    try {
      const today = new Date().toISOString().split("T")[0];
      await logHabit(habit.id, today, 1);
      toast({ title: "Hábito registrado" });
    } catch {
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Hábitos de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {habits.map((habit) => {
          const currentValue = habit.todaysLog?.value || 0;
          const isCompleted = currentValue >= habit.target_value;
          
          return (
            <div key={habit.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-xl">{habit.icon || "✨"}</div>
                <div>
                  <div className="font-medium text-sm">{habit.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {currentValue} / {habit.target_value} {habit.unit}
                  </div>
                </div>
              </div>
              
              <Button
                variant={isCompleted ? "ghost" : "outline"}
                size="icon"
                className={`h-8 w-8 rounded-full ${isCompleted ? 'text-green-500 bg-green-50 hover:bg-green-100' : ''}`}
                onClick={() => handleIncrement(habit)}
                disabled={!!loadingId}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </Button>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No tienes hábitos activos.
          </div>
        )}
      </CardContent>
    </Card>
  );
}