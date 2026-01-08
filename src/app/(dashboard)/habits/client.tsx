"use client";

import { Habit } from "@/lib/actions/habits";
import { HabitCard } from "@/components/productivity/HabitCard";
import { HabitForm } from "@/components/productivity/HabitForm";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

interface HabitPageClientProps {
  initialHabits: (Habit & { todaysLog?: { value: number } })[];
}

export function HabitPageClient({ initialHabits }: HabitPageClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hábitos</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Hábito
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {initialHabits.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))}
      </div>

      {initialHabits.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No tienes hábitos configurados.
        </div>
      )}

      <HabitForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}