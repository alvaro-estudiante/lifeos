"use client";

import { RoutineExercise } from "@/lib/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, GripVertical } from "lucide-react";

interface RoutineExerciseItemProps {
  exercise: RoutineExercise;
  index: number;
  onUpdate: (index: number, data: Partial<RoutineExercise>) => void;
  onRemove: (index: number) => void;
  readOnly?: boolean;
}

export function RoutineExerciseItem({ exercise, index, onUpdate, onRemove, readOnly = false }: RoutineExerciseItemProps) {
  if (readOnly) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md bg-card">
        <div>
          <div className="font-medium">{exercise.exercise_name}</div>
          <div className="text-sm text-muted-foreground">
            {exercise.sets} series x {exercise.reps_min}-{exercise.reps_max} reps • {exercise.rest_seconds}s descanso
          </div>
          {exercise.notes && (
            <div className="text-xs text-muted-foreground mt-1 italic">
              "{exercise.notes}"
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 border rounded-md bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <GripVertical className="text-muted-foreground cursor-grab h-4 w-4" />
          {exercise.exercise_name}
        </div>
        <Button variant="ghost" size="icon" onClick={() => onRemove(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Series</Label>
          <Input 
            type="number" 
            value={exercise.sets} 
            onChange={(e) => onUpdate(index, { sets: Number(e.target.value) })}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reps Min</Label>
          <Input 
            type="number" 
            value={exercise.reps_min} 
            onChange={(e) => onUpdate(index, { reps_min: Number(e.target.value) })}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Reps Max</Label>
          <Input 
            type="number" 
            value={exercise.reps_max} 
            onChange={(e) => onUpdate(index, { reps_max: Number(e.target.value) })}
            className="h-8"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Descanso (s)</Label>
          <Input 
            type="number" 
            value={exercise.rest_seconds} 
            onChange={(e) => onUpdate(index, { rest_seconds: Number(e.target.value) })}
            className="h-8"
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label className="text-xs">Notas</Label>
        <Input 
          value={exercise.notes || ""} 
          onChange={(e) => onUpdate(index, { notes: e.target.value })}
          placeholder="Técnica, tempo, etc."
          className="h-8"
        />
      </div>
    </div>
  );
}