"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  frequency: 'daily' | 'weekly' | 'custom';
  frequency_config: any | null;
  target_value: number;
  unit: string | null;
  color: string;
  icon: string | null;
  is_active: boolean;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  log_date: string;
  value: number;
  notes: string | null;
  created_at: string;
}

export type NewHabit = Omit<Habit, "id" | "user_id" | "created_at" | "updated_at" | "current_streak" | "best_streak">;

export async function getHabits(activeOnly = true) {
  const { user, supabase } = await getSessionOrThrow();

  let query = supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data as Habit[];
}

export async function getHabitLogsForDate(date: string) {
  const { user, supabase } = await getSessionOrThrow();

  // Get user habits first
  const { data: habits } = await supabase
    .from("habits")
    .select("id")
    .eq("user_id", user.id);

  const habitsArray = habits as { id: string }[] | null;
  if (!habitsArray || habitsArray.length === 0) return [];

  const habitIds = habitsArray.map(h => h.id);

  const { data: logs, error } = await supabase
    .from("habit_logs")
    .select("*")
    .in("habit_id", habitIds)
    .eq("log_date", date);

  if (error) throw new Error(error.message);

  return logs as HabitLog[];
}

export async function createHabit(habit: NewHabit) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from("habits") as any).insert({
    ...habit,
    user_id: user.id,
    current_streak: 0,
    best_streak: 0,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard/tasks/today");
}

export async function updateHabit(id: string, habit: Partial<NewHabit>) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from("habits") as any)
    .update(habit)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard/tasks/today");
}

export async function logHabit(habitId: string, date: string, value: number) {
  const supabase = createClient();
  
  // Check if log exists
  const { data: existingLog } = await supabase
    .from("habit_logs")
    .select("id, value")
    .eq("habit_id", habitId)
    .eq("log_date", date)
    .single();

  const logData = existingLog as { id: string; value: number } | null;

  if (logData) {
    const newValue = logData.value + value;
    
    const { error } = await (supabase.from("habit_logs") as any)
      .update({ value: newValue })
      .eq("id", logData.id);
      
    if (error) throw new Error(error.message);
  } else {
    const { error } = await (supabase.from("habit_logs") as any)
      .insert({
        habit_id: habitId,
        log_date: date,
        value: value,
      });
      
    if (error) throw new Error(error.message);
  }

  // TODO: Recalculate streak
  
  revalidatePath("/dashboard/habits");
  revalidatePath("/dashboard/tasks/today");
}

export async function deleteHabit(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("habits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/habits");
}