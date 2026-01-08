"use client";

import { Exercise } from "@/lib/actions/exercises";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { deleteExercise } from "@/lib/actions/exercises";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ExerciseForm } from "./ExerciseForm";

interface ExerciseCardProps {
  exercise: Exercise;
}

const muscleGroupLabels: Record<string, string> = {
  chest: "Pecho",
  back: "Espalda",
  shoulders: "Hombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebrazos",
  core: "Core",
  quadriceps: "Cuádriceps",
  hamstrings: "Isquios",
  glutes: "Glúteos",
  calves: "Gemelos",
  full_body: "Full Body",
  cardio: "Cardio",
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar este ejercicio?")) return;
    setLoading(true);
    try {
      await deleteExercise(exercise.id);
      toast({ title: "Ejercicio eliminado" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{exercise.name}</h3>
              {exercise.is_compound && (
                <Badge variant="secondary" className="text-[10px] h-5">Compuesto</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{muscleGroupLabels[exercise.muscle_group]}</span>
              {exercise.equipment && (
                <>
                  <span>•</span>
                  <span>{exercise.equipment}</span>
                </>
              )}
            </div>
          </div>

          {exercise.is_custom && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditOpen(true)}>
                <Edit2 size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExerciseForm 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        exerciseToEdit={exercise} 
      />
    </>
  );
}