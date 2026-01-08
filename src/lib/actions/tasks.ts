"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  due_date: string | null;
  due_time: string | null;
  estimated_minutes: number | null;
  actual_minutes: number | null;
  category: string | null;
  tags: string[] | null;
  parent_task_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTask = Omit<Task, "id" | "user_id" | "created_at" | "updated_at">;

export async function getTasks(filters?: {
  status?: string;
  priority?: string;
  due_date?: string;
}) {
  const { user, supabase } = await getSessionOrThrow();

  let query = supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }
  if (filters?.due_date) {
    query = query.eq("due_date", filters.due_date);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  return data as Task[];
}

export async function getTasksForDate(date: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .eq("due_date", date)
    .order("priority", { ascending: false }); // Sort urgent first

  if (error) throw new Error(error.message);

  return data as Task[];
}

export async function createTask(task: NewTask) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase.from("tasks").insert({
    ...task,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/tasks/today");
}

export async function updateTask(id: string, task: Partial<NewTask>) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("tasks")
    .update(task)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/tasks/today");
}

export async function completeTask(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/tasks/today");
}

export async function deleteTask(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/tasks");
  revalidatePath("/tasks/today");
}