"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface SleepLog {
  id: string;
  user_id: string;
  sleep_date: string;
  bed_time: string | null;
  wake_time: string | null;
  duration_hours: number | null;
  quality: number | null;
  notes: string | null;
  created_at: string;
}

export type NewSleepLog = Omit<SleepLog, "id" | "user_id" | "created_at">;

export async function getSleepLog(date: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("sleep_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("sleep_date", date)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data as SleepLog | null;
}

export async function logSleep(sleep: NewSleepLog) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Check if exists
  const existing = await getSleepLog(sleep.sleep_date);

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from("sleep_logs")
      .update(sleep)
      .eq("id", existing.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from("sleep_logs")
      .insert({
        ...sleep,
        user_id: user.id,
      });
    error = insertError;
  }

  if (error) throw new Error(error.message);

  revalidatePath("/tasks/today");
}