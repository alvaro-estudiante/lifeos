"use client";

import { Workout, addExerciseToWorkout } from "@/lib/actions/workouts";
import { WorkoutTimer } from "@/components/fitness/WorkoutTimer";
import { WorkoutExerciseInput } from "@/components/fitness/WorkoutExerciseInput";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, CheckSquare } from "lucide-react";
import { ExerciseSelector } from "@/components/fitness/ExerciseSelector";
import { WorkoutSummary } from "@/components/fitness/WorkoutSummary";
import { useState } from "react";
import { Exercise } from "@/lib/actions/exercises";
import { useToast } from "@/hooks/use-toast";

interface WorkoutPageClientProps {
  workout: Workout;
}

export function WorkoutPageClient({ workout }: WorkoutPageClientProps) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const { toast } = useToast();

  const handleAddExercise = async (exercise: Exercise) => {
    try {
      await addExerciseToWorkout(workout.id, exercise.id, exercise.name);
      toast({ title: "Ejercicio añadido" });
    } catch {
      toast({ variant: "destructive", title: "Error al añadir ejercicio" });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Entrenando</h1>
            <p className="text-muted-foreground">{workout.name}</p>
          </div>
          <WorkoutTimer
            startTime={workout.start_time || new Date().toTimeString().split(' ')[0]}
            workoutDate={workout.workout_date || new Date().toISOString()}
          />
        </div>

        <Accordion type="multiple" defaultValue={workout.exercises?.map(e => e.id)} className="w-full space-y-4">
          {workout.exercises?.map((exercise) => (
            <AccordionItem key={exercise.id} value={exercise.id} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-semibold text-lg">{exercise.exercise_name}</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    {exercise.sets?.length || 0} series
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <WorkoutExerciseInput 
                  workoutExerciseId={exercise.id} 
                  sets={exercise.sets || []} 
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="flex justify-center py-4">
          <Button variant="outline" onClick={() => setIsSelectorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Ejercicio
          </Button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t md:static md:bg-transparent md:border-0 md:p-0">
        <Button className="w-full md:w-auto md:ml-auto block" size="lg" onClick={() => setIsSummaryOpen(true)}>
          <CheckSquare className="mr-2 h-4 w-4 inline" /> Finalizar Entrenamiento
        </Button>
      </div>

      <ExerciseSelector
        open={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        onSelect={handleAddExercise}
      />

      <WorkoutSummary
        open={isSummaryOpen}
        onOpenChange={setIsSummaryOpen}
        workout={workout}
      />
    </div>
  );
}