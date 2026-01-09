"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow, getSessionOrNull } from "@/lib/auth/session";
import { getRoutineById } from "./routines";

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  rpe: number | null;
  is_warmup: boolean;
  is_dropset: boolean;
  is_failure: boolean;
  notes: string | null;
}

export interface WorkoutExercise {
  id: string;
  workout_id: string;
  exercise_id: string | null;
  exercise_name: string;
  order_index: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string | null;
  workout_date: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  total_volume: number | null;
  notes: string | null;
  energy_level: number | null;
  overall_feeling: number | null;
  exercises?: WorkoutExercise[];
}

export async function getActiveWorkout() {
  const { user, supabase } = await getSessionOrNull();
  if (!user) return null;

  const { data: workout } = await supabase
    .from("workouts")
    .select(`
      *,
      exercises:workout_exercises(
        *,
        sets:workout_sets(*)
      )
    `)
    .eq("user_id", user.id)
    .is("end_time", null) // Only active workouts
    .order("created_at", { ascending: false })
    .single();

  if (workout) {
    // Sort exercises and sets
    workout.exercises.sort((a: any, b: any) => a.order_index - b.order_index);
    workout.exercises.forEach((ex: any) => {
      ex.sets.sort((a: any, b: any) => a.set_number - b.set_number);
    });
  }

  return workout as Workout | null;
}

export async function startWorkout(routineId?: string) {
  const { user, supabase } = await getSessionOrThrow();

  // Check if active workout exists
  const active = await getActiveWorkout();
  if (active) return active;

  let name = "Entrenamiento Libre";
  let routineExercises: any[] = [];

  if (routineId) {
    const routine = await getRoutineById(routineId);
    if (routine) {
      name = routine.name;
      routineExercises = routine.exercises;
    }
  }

  // Create workout
  const { data: workout, error } = await supabase
    .from("workouts")
    .insert({
      user_id: user.id,
      routine_id: routineId,
      name,
      workout_date: new Date().toISOString(),
      start_time: new Date().toTimeString().split(' ')[0], // "HH:MM:SS"
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // If routine, populate exercises
  if (routineExercises.length > 0) {
    for (const [index, ex] of routineExercises.entries()) {
      await addExerciseToWorkout(workout.id, ex.exercise_id, ex.exercise_name, index);
    }
  }

  revalidatePath("/dashboard/fitness/workout");
  return workout;
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string, exerciseName: string, orderIndex?: number) {
  const supabase = createClient();
  
  // Get max order index if not provided
  if (orderIndex === undefined) {
    const { count } = await supabase
      .from("workout_exercises")
      .select("*", { count: "exact", head: true })
      .eq("workout_id", workoutId);
    orderIndex = count || 0;
  }

  const { error } = await supabase
    .from("workout_exercises")
    .insert({
      workout_id: workoutId,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      order_index: orderIndex,
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/fitness/workout");
}

export async function addSet(workoutExerciseId: string, setData: Partial<WorkoutSet>) {
  const supabase = createClient();

  // Get next set number
  const { count } = await supabase
    .from("workout_sets")
    .select("*", { count: "exact", head: true })
    .eq("workout_exercise_id", workoutExerciseId);
  
  const setNumber = (count || 0) + 1;

  const { error } = await supabase
    .from("workout_sets")
    .insert({
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      reps: setData.reps || 0,
      weight_kg: setData.weight_kg || 0,
      rpe: setData.rpe,
      is_warmup: setData.is_warmup || false,
      is_dropset: setData.is_dropset || false,
      is_failure: setData.is_failure || false,
    });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/fitness/workout");
}

export async function updateSet(setId: string, data: Partial<WorkoutSet>) {
  const supabase = createClient();
  const { error } = await supabase
    .from("workout_sets")
    .update(data)
    .eq("id", setId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/fitness/workout");
}

export async function deleteSet(setId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("workout_sets")
    .delete()
    .eq("id", setId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/fitness/workout");
}

export async function finishWorkout(workoutId: string, summaryData: any) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("workouts")
    .update({
      end_time: new Date().toTimeString().split(' ')[0], // "HH:MM:SS"
      ...summaryData
    })
    .eq("id", workoutId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/fitness/workout");
  revalidatePath("/dashboard/fitness/history");
}

export async function getLastWorkoutForExercise(exerciseId: string) {
  const { user, supabase } = await getSessionOrNull();
  if (!user) return null;

  // Complex query to get last sets for this exercise
  // For simplicity, finding the last workout_exercise with this exercise_id
  const { data } = await supabase
    .from("workout_exercises")
    .select(`
      created_at,
      sets:workout_sets(*)
    `)
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (data && data.sets) {
    return data.sets.sort((a: any, b: any) => a.set_number - b.set_number);
  }
  return null;
}

export async function getLastExercisePerformance(exerciseId: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { data } = await supabase
    .from("workout_exercises")
    .select(`
      created_at,
      sets:workout_sets(weight_kg, reps)
    `)
    .eq("exercise_id", exerciseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (data && data.sets && data.sets.length > 0) {
    // Return the heaviest set or the last set
    // For now, let's return the last set
    const lastSet = data.sets[data.sets.length - 1];
    return {
      weight: lastSet.weight_kg,
      reps: lastSet.reps,
      date: data.created_at
    };
  }
  return null;
}

export async function getWorkoutHistory(limit = 10) {
  const { user, supabase } = await getSessionOrThrow();

  const { data, error } = await supabase
    .from("workouts")
    .select("*")
    .eq("user_id", user.id)
    .not("end_time", "is", null) // Only finished workouts
    .order("end_time", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return data as Workout[];
}

export async function getWorkoutById(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { data: workout, error } = await supabase
    .from("workouts")
    .select(`
      *,
      exercises:workout_exercises(
        *,
        sets:workout_sets(*)
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error(error.message);

  if (workout) {
    // Sort exercises and sets
    workout.exercises.sort((a: any, b: any) => a.order_index - b.order_index);
    workout.exercises.forEach((ex: any) => {
      ex.sets.sort((a: any, b: any) => a.set_number - b.set_number);
    });
  }

  return workout as Workout;
}