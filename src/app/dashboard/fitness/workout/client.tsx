"use client";

import { Workout, addExerciseToWorkout } from "@/lib/actions/workouts";
import { WorkoutTimer } from "@/components/fitness/WorkoutTimer";
import { WorkoutExerciseInput } from "@/components/fitness/WorkoutExerciseInput";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, CheckSquare, Dumbbell } from "lucide-react";
import { ExerciseSelector } from "@/components/fitness/ExerciseSelector";
import { WorkoutSummary } from "@/components/fitness/WorkoutSummary";
import { useState } from "react";
import { Exercise } from "@/lib/actions/exercises";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

  const totalSets = workout.exercises?.reduce((acc, e) => acc + (e.sets?.length || 0), 0) || 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 sm:pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight truncate">
            {workout.name || "Entrenando"}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span>{workout.exercises?.length || 0} ejercicios</span>
            <span>•</span>
            <span>{totalSets} series</span>
          </div>
        </div>
        <WorkoutTimer
          startTime={workout.start_time || new Date().toTimeString().split(' ')[0]}
          workoutDate={workout.workout_date || new Date().toISOString()}
        />
      </div>

      {/* Exercises */}
      {workout.exercises && workout.exercises.length > 0 ? (
        <Accordion 
          type="multiple" 
          defaultValue={workout.exercises?.map(e => e.id)} 
          className="w-full space-y-3"
        >
          {workout.exercises.map((exercise, index) => (
            <AccordionItem 
              key={exercise.id} 
              value={exercise.id} 
              className="border rounded-xl bg-card overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline px-4 py-3">
                <div className="flex items-center gap-3 w-full pr-2">
                  <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <span className="font-semibold text-sm sm:text-base block truncate">
                      {exercise.exercise_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {exercise.sets?.length || 0} series completadas
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <WorkoutExerciseInput 
                  workoutExerciseId={exercise.id} 
                  sets={exercise.sets || []} 
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-xl">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">Añade ejercicios para empezar</p>
          <Button onClick={() => setIsSelectorOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Añadir Ejercicio
          </Button>
        </div>
      )}

      {/* Add Exercise Button */}
      {workout.exercises && workout.exercises.length > 0 && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setIsSelectorOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" /> Añadir Ejercicio
          </Button>
        </div>
      )}

      {/* Finish Button - Fixed on mobile */}
      <div className={cn(
        "fixed bottom-16 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t z-40",
        "sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:backdrop-blur-none"
      )}>
        <Button 
          className="w-full sm:w-auto sm:ml-auto sm:block" 
          size="lg" 
          onClick={() => setIsSummaryOpen(true)}
          disabled={!workout.exercises?.length}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> Finalizar Entrenamiento
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
