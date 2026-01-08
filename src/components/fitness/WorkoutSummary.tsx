"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Workout } from "@/lib/actions/workouts";
import { finishWorkout } from "@/lib/actions/workouts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface WorkoutSummaryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: Workout;
}

export function WorkoutSummary({ open, onOpenChange, workout }: WorkoutSummaryProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [energy, setEnergy] = useState(7);
  const [feeling, setFeeling] = useState(7);

  const calculateVolume = () => {
    let volume = 0;
    workout.exercises?.forEach((exercise) => {
      exercise.sets?.forEach((set) => {
        if (set.weight_kg && set.reps) {
          volume += set.weight_kg * set.reps;
        }
      });
    });
    return volume;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Calculate duration
      let durationMinutes = 0;
      if (workout.start_time && workout.workout_date) {
        const start = new Date(`${workout.workout_date.split('T')[0]}T${workout.start_time}`);
        const end = new Date();
        durationMinutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
      }

      await finishWorkout(workout.id, {
        notes,
        energy_level: energy,
        overall_feeling: feeling,
        total_volume: calculateVolume(),
        duration_minutes: durationMinutes,
      });

      toast({ title: "Entrenamiento finalizado", description: "¡Buen trabajo!" });
      onOpenChange(false);
      router.push("/fitness/history");
    } catch (error) {
      toast({ variant: "destructive", title: "Error al finalizar" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resumen del Entrenamiento</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{workout.exercises?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Ejercicios</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{calculateVolume()}</div>
              <div className="text-xs text-muted-foreground">Volumen (kg)</div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea 
              placeholder="¿Cómo te sentiste? ¿Alguna molestia?" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Nivel de Energía</Label>
                <span className="text-sm font-medium">{energy}/10</span>
              </div>
              <Slider 
                value={[energy]} 
                onValueChange={(v) => setEnergy(v[0])} 
                max={10} 
                min={1} 
                step={1} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Sensación General</Label>
                <span className="text-sm font-medium">{feeling}/10</span>
              </div>
              <Slider 
                value={[feeling]} 
                onValueChange={(v) => setFeeling(v[0])} 
                max={10} 
                min={1} 
                step={1} 
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleFinish} disabled={loading} className="w-full">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Guardar y Finalizar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}