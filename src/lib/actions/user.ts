"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface UserProfile {
  id: string;
  full_name: string | null;
  birth_date: string | null;
  gender: 'male' | 'female' | 'other' | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  fitness_goal: 'lose_fat' | 'maintain' | 'build_muscle' | 'recomposition' | 'health' | null;
  dietary_restrictions: string[] | null;
}

export type UserProfileUpdate = Partial<Omit<UserProfile, "id">>;

export async function getUserProfile(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  // If no profile exists, return user email from auth
  if (!data) {
    const { data: { user } } = await supabase.auth.getUser();
    return {
      id: userId,
      full_name: user?.email?.split('@')[0] || "Usuario",
    } as UserProfile;
  }

  return data as UserProfile;
}

export async function updateUserProfile(profile: UserProfileUpdate) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("user_profiles")
    .upsert({ ...profile, id: user.id });

  if (error) throw new Error(error.message);

  revalidatePath("/");
}