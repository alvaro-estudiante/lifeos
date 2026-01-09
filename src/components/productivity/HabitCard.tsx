"use client";

import { Habit, logHabit, deleteHabit } from "@/lib/actions/habits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Flame, Plus, Check, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { HabitForm } from "./HabitForm";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HabitCardProps {
  habit: Habit & { todaysLog?: { value: number } };
}

export function HabitCard({ habit }: HabitCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [localValue, setLocalValue] = useState(habit.todaysLog?.value || 0);

  const progress = Math.min(100, Math.round((localValue / habit.target_value) * 100));
  const isCompleted = localValue >= habit.target_value;

  const handleIncrement = async () => {
    // Optimistic update
    setLocalValue(prev => prev + 1);
    setLoading(true);
    
    try {
      const today = new Date().toISOString().split("T")[0];
      await logHabit(habit.id, today, 1);
      toast({ title: "✨ +1 registrado" });
    } catch (error) {
      setLocalValue(habit.todaysLog?.value || 0);
      toast({ variant: "destructive", title: "Error al registrar" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este hábito?")) return;
    try {
      await deleteHabit(habit.id);
      toast({ title: "Hábito eliminado" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar" });
    }
  };

  return (
    <>
      <Card className={cn(
        "transition-all overflow-hidden",
        isCompleted && "ring-2 ring-green-500/20 bg-green-50/50 dark:bg-green-950/20"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-2xl text-2xl flex-shrink-0",
              isCompleted ? "bg-green-100 dark:bg-green-900/30" : "bg-muted"
            )}>
              {habit.icon || "✨"}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className={cn(
                    "font-semibold text-sm truncate",
                    isCompleted && "text-green-700 dark:text-green-400"
                  )}>
                    {habit.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {localValue}/{habit.target_value} {habit.unit}
                    </span>
                    {habit.current_streak > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-orange-500 font-bold">
                        <Flame className="h-3 w-3" /> {habit.current_streak}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 -mt-1 -mr-1">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-green-500" : "bg-primary"
                  )}
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: !isCompleted ? habit.color : undefined 
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-end mt-3">
            <Button 
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              className={cn(
                "h-9 px-4 gap-2",
                isCompleted && "border-green-500 text-green-600 hover:bg-green-50"
              )}
              onClick={handleIncrement}
              disabled={loading}
            >
              {isCompleted ? (
                <>
                  <Check className="h-4 w-4" />
                  Completado
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Registrar
                </>
              )}
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
