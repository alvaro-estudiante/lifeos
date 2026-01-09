"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export interface NutritionGoals {
  id: string;
  user_id: string;
  calories_target: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  water_ml: number;
}

export type NewNutritionGoals = Omit<NutritionGoals, "id" | "user_id">;

export async function getNutritionGoals() {
  const { user, supabase } = await getSessionOrThrow();

  const { data, error } = await supabase
    .from("nutrition_goals")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned, which is fine
    throw new Error(error.message);
  }

  return data as NutritionGoals | null;
}

export async function updateNutritionGoals(goals: Partial<NewNutritionGoals>) {
  const { user, supabase } = await getSessionOrThrow();

  const { data: existingGoals } = await supabase
    .from("nutrition_goals")
    .select("id")
    .eq("user_id", user.id)
    .single();

  let error;

  if (existingGoals) {
    const { error: updateError } = await (supabase.from("nutrition_goals") as any)
      .update(goals)
      .eq("user_id", user.id);
    error = updateError;
  } else {
    const { error: insertError } = await (supabase.from("nutrition_goals") as any)
      .insert({ ...goals, user_id: user.id });
    error = insertError;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/nutrition");
  revalidatePath("/dashboard/nutrition/goals");
}