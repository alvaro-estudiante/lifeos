"use server";

import { createClient } from "@/lib/supabase/server";
import { getNutritionGoals } from "./nutrition-goals";

export async function getDailySummary(date: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  // Get goals
  const goals = await getNutritionGoals();

  // Get consumed (sum of all meals for the day)
  const { data: meals } = await supabase
    .from("meals")
    .select("total_calories, total_protein, total_carbs, total_fat")
    .eq("user_id", user.id)
    .eq("meal_date", date);

  type MealTotals = { total_calories: number | null; total_protein: number | null; total_carbs: number | null; total_fat: number | null };
  const mealsArray = meals as MealTotals[] | null;

  type ConsumedTotals = { calories: number; protein: number; carbs: number; fat: number };
  const consumed = mealsArray?.reduce<ConsumedTotals>(
    (acc, meal) => ({
      calories: acc.calories + (meal.total_calories || 0),
      protein: acc.protein + (meal.total_protein || 0),
      carbs: acc.carbs + (meal.total_carbs || 0),
      fat: acc.fat + (meal.total_fat || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return {
    consumed,
    goals: goals || {
      calories_target: 2000,
      protein_g: 150,
      carbs_g: 200,
      fat_g: 60,
    }, // Fallback defaults if no goals set
  };
}