"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Routine, RoutineExercise, createRoutine, updateRoutine, RoutineType } from "@/lib/actions/routines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RoutineExerciseItem } from "./RoutineExerciseItem";
import { ExerciseSelector } from "./ExerciseSelector";
import { Plus, Save, Loader2, Sparkles } from "lucide-react";
import { Exercise } from "@/lib/actions/exercises";

interface RoutineEditorProps {
  initialData?: Routine;
}

const routineTypes: { value: RoutineType; label: string }[] = [
  { value: "strength", label: "Fuerza" },
  { value: "hypertrophy", label: "Hipertrofia" },
  { value: "endurance", label: "Resistencia" },
  { value: "cardio", label: "Cardio" },
  { value: "mixed", label: "Mixto" },
  { value: "custom", label: "Personalizado" },
];

export function RoutineEditor({ initialData }: RoutineEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState<RoutineType>(initialData?.type || "hypertrophy");
  const [daysPerWeek, setDaysPerWeek] = useState(initialData?.days_per_week || 3);
  const [exercises, setExercises] = useState<RoutineExercise[]>(initialData?.exercises || []);

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([
      ...exercises,
      {
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        sets: 3,
        reps_min: 8,
        reps_max: 12,
        rest_seconds: 90,
        notes: "",
      },
    ]);
  };

  const handleUpdateExercise = (index: number, data: Partial<RoutineExercise>) => {
    const newExercises = [...exercises];
    newExercises[index] = { ...newExercises[index], ...data };
    setExercises(newExercises);
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...exercises];
    newExercises.splice(index, 1);
    setExercises(newExercises);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast({ title: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    if (exercises.length === 0) {
      toast({ title: "Añade al menos un ejercicio", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const routineData = {
        name,
        description,
        type,
        days_per_week: daysPerWeek,
        exercises,
        is_active: initialData?.is_active || false,
        is_ai_generated: initialData?.is_ai_generated || false,
      };

      if (initialData) {
        await updateRoutine(initialData.id, routineData);
        toast({ title: "Rutina actualizada" });
      } else {
        await createRoutine(routineData);
        toast({ title: "Rutina creada" });
      }
      router.push("/fitness/routines");
      router.refresh();
    } catch {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="grid gap-6 p-6 border rounded-lg bg-card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nombre de la rutina</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Torso Hipertrofia" />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as RoutineType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {routineTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descripción</Label>
          <Textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Objetivo principal, notas generales..." 
          />
        </div>

        <div className="space-y-2">
          <Label>Días por semana</Label>
          <Input 
            type="number" 
            min={1} 
            max={7} 
            value={daysPerWeek} 
            onChange={(e) => setDaysPerWeek(Number(e.target.value))} 
            className="w-24"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Ejercicios ({exercises.length})</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {}} disabled title="Próximamente">
              <Sparkles className="mr-2 h-4 w-4" /> Generar con IA
            </Button>
            <Button onClick={() => setIsSelectorOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Añadir Ejercicio
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <RoutineExerciseItem
              key={`${exercise.exercise_id}-${index}`}
              index={index}
              exercise={exercise}
              onUpdate={handleUpdateExercise}
              onRemove={handleRemoveExercise}
            />
          ))}
          {exercises.length === 0 && (
            <div className="text-center py-12 border rounded-lg border-dashed text-muted-foreground">
              No hay ejercicios. Añade algunos para empezar.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Guardar Rutina
        </Button>
      </div>

      <ExerciseSelector 
        open={isSelectorOpen} 
        onOpenChange={setIsSelectorOpen} 
        onSelect={handleAddExercise} 
      />
    </div>
  );
}