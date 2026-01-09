"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionOrThrow } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { routineTemplates } from "@/lib/data/routine-templates";

export interface RoutineExercise {
  exercise_id: string;
  exercise_name: string;
  sets: number;
  reps_min: number;
  reps_max: number;
  rest_seconds: number;
  notes?: string;
}

export type RoutineType = 'strength' | 'hypertrophy' | 'endurance' | 'cardio' | 'mixed' | 'custom';

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  type: RoutineType;
  days_per_week: number | null;
  exercises: RoutineExercise[];
  is_active: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

export type NewRoutine = Omit<Routine, "id" | "user_id" | "created_at">;

export async function getRoutines() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as Routine[];
}

export async function getRoutineById(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("routines")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) throw new Error(error.message);

  return data as Routine;
}

export async function createRoutine(routine: NewRoutine) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase.from("routines").insert({
    ...routine,
    user_id: user.id,
    exercises: routine.exercises as any, // Cast to any for JSON column
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/routines");
}

export async function createRoutineFromTemplate(templateId: string) {
  const { user, supabase } = await getSessionOrThrow();
  
  const template = routineTemplates.find(t => t.id === templateId);
  if (!template) throw new Error('Template no encontrado');
  
  // Crear la rutina con los datos del template
  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id: user.id,
      name: template.name,
      description: template.description,
      type: template.type,
      days_per_week: template.days_per_week,
      exercises: template.exercises as any, // Cast to any for JSON column
      is_active: false,
      is_ai_generated: false,
    })
    .select()
    .single();
    
  if (error) throw new Error(error.message);
  
  revalidatePath('/dashboard/fitness/routines');
  return data as Routine;
}

export async function updateRoutine(id: string, routine: Partial<NewRoutine>) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("routines")
    .update({
      ...routine,
      exercises: routine.exercises as any,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/routines");
  revalidatePath(`/dashboard/fitness/routines/${id}`);
}

export async function deleteRoutine(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("routines")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/routines");
}

export async function setActiveRoutine(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Deactivate all routines first
  await supabase
    .from("routines")
    .update({ is_active: false })
    .eq("user_id", user.id);

  // Activate the selected routine
  const { error } = await supabase
    .from("routines")
    .update({ is_active: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/fitness/routines");
}