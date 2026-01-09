"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'core'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body'
  | 'cardio';

export interface Exercise {
  id: string;
  user_id: string;
  name: string;
  muscle_group: MuscleGroup;
  equipment: string | null;
  instructions: string | null;
  video_url: string | null;
  is_compound: boolean;
  is_custom: boolean;
  created_at: string;
}

export type NewExercise = Omit<Exercise, "id" | "user_id" | "created_at">;

export async function getExercises() {
  const { user, supabase } = await getSessionOrThrow();

  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .or(`user_id.eq.${user.id},is_custom.eq.false`)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return data as Exercise[];
}

export async function addExercise(exercise: NewExercise) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from("exercises") as any).insert({
    ...exercise,
    user_id: user.id,
    is_custom: true, // Always true for user-added exercises
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/exercises");
}

export async function updateExercise(id: string, exercise: Partial<NewExercise>) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase
    .from("exercises") as any)
    .update(exercise)
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the exercise

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/exercises");
}

export async function deleteExercise(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("exercises")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id); // Ensure user owns the exercise

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/exercises");
}