"use client";

import { Habit, logHabit, deleteHabit } from "@/lib/actions/habits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Flame, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HabitForm } from "./HabitForm";

interface HabitCardProps {
  habit: Habit & { todaysLog?: { value: number } };
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const currentValue = habit.todaysLog?.value || 0;
  const progress = Math.min(100, Math.round((currentValue / habit.target_value) * 100));
  const isCompleted = currentValue >= habit.target_value;

  const handleIncrement = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      await logHabit(habit.id, today, 1);
      toast({ title: "Hábito registrado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar hábito?")) return;
    try {
      await deleteHabit(habit.id);
      toast({ title: "Hábito eliminado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar" });
    }
  };

  return (
    <>
      <Card className={`transition-all ${isCompleted ? 'bg-muted/30' : ''}`}>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-xl">
              {habit.icon || "✨"}
            </div>
            
            <div className="space-y-1">
              <div className="font-medium">{habit.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <span>{currentValue} / {habit.target_value} {habit.unit}</span>
                {habit.current_streak > 0 && (
                  <span className="flex items-center gap-0.5 text-orange-500 font-medium">
                    <Flame className="h-3 w-3" /> {habit.current_streak}
                  </span>
                )}
              </div>
              {/* Simple progress bar */}
              <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500" 
                  style={{ width: `${progress}%`, backgroundColor: habit.color }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className={`h-8 w-8 rounded-full ${isCompleted ? 'bg-green-100 text-green-600 border-green-200 hover:bg-green-200' : ''}`}
              onClick={handleIncrement}
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsEditOpen(true)}>
              <Edit2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <HabitForm 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        habitToEdit={habit} 
      />
    </>
  );
}