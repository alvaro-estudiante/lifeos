"use client";

import { Habit } from "@/lib/actions/habits";
import { HabitCard } from "@/components/productivity/HabitCard";
import { HabitForm } from "@/components/productivity/HabitForm";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useState } from "react";

interface HabitPageClientProps {
  initialHabits: (Habit & { todaysLog?: { value: number } })[];
}

export function HabitPageClient({ initialHabits }: HabitPageClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const completedCount = initialHabits.filter(
    h => (h.todaysLog?.value || 0) >= h.target_value
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Hábitos</h1>
          {initialHabits.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} de {initialHabits.length} completados hoy
            </p>
          )}
        </div>
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Hábito
        </Button>
      </div>

      {/* Progress bar */}
      {initialHabits.length > 0 && (
        <div className="bg-muted rounded-full h-2 overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${(completedCount / initialHabits.length) * 100}%` }}
          />
        </div>
      )}

      {/* Habits Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {initialHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>

      {/* Empty State */}
      {initialHabits.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="font-semibold text-lg">Sin hábitos aún</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">
            Crea tu primer hábito para empezar a construir rutinas
          </p>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Crear primer hábito
          </Button>
        </div>
      )}

      <HabitForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
