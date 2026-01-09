"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSessionOrThrow } from "@/lib/auth/session";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface MealItem {
  id: string;
  meal_id: string;
  food_name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  from_pantry_id?: string;
  from_recipe_id?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: MealType;
  meal_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  items: MealItem[];
}

export async function getMealsByDate(date: string) {
  const { user, supabase } = await getSessionOrThrow();

  const { data: meals, error } = await supabase
    .from("meals")
    .select(`
      *,
      items:meal_items(*)
    `)
    .eq("user_id", user.id)
    .eq("meal_date", date);

  if (error) throw new Error(error.message);

  return meals as Meal[];
}

export async function addMealItem(
  date: string,
  mealType: MealType,
  item: Omit<MealItem, "id" | "meal_id">
) {
  const { user, supabase } = await getSessionOrThrow();

  // 1. Check if meal exists for this date and type
  const { data: existingMeals } = await supabase
    .from("meals")
    .select("id")
    .eq("user_id", user.id)
    .eq("meal_date", date)
    .eq("meal_type", mealType)
    .single();

  const existingMeal = existingMeals as { id: string } | null;
  let mealId = existingMeal?.id;

  // 2. If not, create it
  if (!mealId) {
    const { data: newMeal, error: createError } = await (supabase.from("meals") as any)
      .insert({
        user_id: user.id,
        meal_date: date,
        meal_type: mealType,
        total_calories: 0,
        total_protein: 0,
        total_carbs: 0,
        total_fat: 0,
        total_fiber: 0,
      })
      .select("id")
      .single();

    if (createError) throw new Error(createError.message);
    mealId = newMeal.id;
  }

  // 3. Add item
  const { error: itemError } = await (supabase.from("meal_items") as any)
    .insert({
      meal_id: mealId,
      ...item,
    });

  if (itemError) throw new Error(itemError.message);

  // 4. Update meal totals (trigger or manual)
  // For now manual calculation could be complex due to concurrency, 
  // but let's assume we trigger a recalculation or let the UI handle it optimistically 
  // and the DB trigger handle persistence if we had one. 
  // Ideally, we should fetch all items and sum up.
  if (mealId) {
    await recalculateMealTotals(mealId);
  }

  revalidatePath("/dashboard/nutrition/meals");
}

export async function deleteMealItem(itemId: string, mealId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("meal_items")
    .delete()
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  await recalculateMealTotals(mealId);
  revalidatePath("/dashboard/nutrition/meals");
}

export async function copyMealsFromDate(sourceDate: string, targetDate: string) {
  const { user, supabase } = await getSessionOrThrow();

  // Get source meals
  const { data: sourceMeals } = await supabase
    .from("meals")
    .select(`
      *,
      items:meal_items(*)
    `)
    .eq("user_id", user.id)
    .eq("meal_date", sourceDate);

  const mealsArray = sourceMeals as any[] | null;
  if (!mealsArray || mealsArray.length === 0) return;

  for (const meal of mealsArray) {
    if (!meal.items || meal.items.length === 0) continue;

    // Check if meal exists for target date
    const { data: existingMeal } = await supabase
      .from("meals")
      .select("id")
      .eq("user_id", user.id)
      .eq("meal_date", targetDate)
      .eq("meal_type", meal.meal_type)
      .single();

    const existingMealData = existingMeal as { id: string } | null;
    let targetMealId = existingMealData?.id;

    if (!targetMealId) {
      const { data: newMeal } = await (supabase.from("meals") as any)
        .insert({
          user_id: user.id,
          meal_date: targetDate,
          meal_type: meal.meal_type,
          total_calories: 0,
          total_protein: 0,
          total_carbs: 0,
          total_fat: 0,
          total_fiber: 0,
        })
        .select("id")
        .single();
      targetMealId = newMeal?.id;
    }

    if (targetMealId) {
      // Copy items
      const itemsToInsert = meal.items.map((item: any) => ({
        meal_id: targetMealId,
        food_name: item.food_name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        from_pantry_id: item.from_pantry_id,
        from_recipe_id: item.from_recipe_id,
      }));

      await (supabase.from("meal_items") as any).insert(itemsToInsert);
      await recalculateMealTotals(targetMealId);
    }
  }

  revalidatePath("/dashboard/nutrition/meals");
}

async function recalculateMealTotals(mealId: string) {
  const supabase = createClient();
  
  const { data: items } = await supabase
    .from("meal_items")
    .select("calories, protein, carbs, fat, fiber")
    .eq("meal_id", mealId);

  type MealItemNutrition = { calories: number | null; protein: number | null; carbs: number | null; fat: number | null; fiber: number | null };
  const itemsArray = items as MealItemNutrition[] | null;
  if (!itemsArray) return;

  type Totals = { calories: number; protein: number; carbs: number; fat: number; fiber: number };
  const totals = itemsArray.reduce<Totals>(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fat: acc.fat + (item.fat || 0),
      fiber: acc.fiber + (item.fiber || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  await (supabase.from("meals") as any)
    .update({
      total_calories: totals.calories,
      total_protein: totals.protein,
      total_carbs: totals.carbs,
      total_fat: totals.fat,
      total_fiber: totals.fiber,
    })
    .eq("id", mealId);
}