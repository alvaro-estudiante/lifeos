"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  fiber_per_100g?: number;
  expiry_date?: string;
  is_available: boolean;
  created_at: string;
}

export type NewPantryItem = Omit<PantryItem, "id" | "user_id" | "created_at">;

export async function getPantryItems() {
  const { user, supabase } = await getSessionOrThrow();

  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data as PantryItem[];
}

export async function addPantryItem(item: NewPantryItem) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from("pantry_items") as any).insert({
    ...item,
    user_id: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/nutrition/pantry");
}

export async function updatePantryItem(id: string, item: Partial<NewPantryItem>) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await (supabase.from("pantry_items") as any)
    .update(item)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/nutrition/pantry");
}

export async function deletePantryItem(id: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { error } = await supabase
    .from("pantry_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/nutrition/pantry");
}