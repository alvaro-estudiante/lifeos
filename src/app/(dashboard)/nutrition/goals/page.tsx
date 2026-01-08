import { getNutritionGoals } from "@/lib/actions/nutrition-goals";
import { NutritionGoalsForm } from "@/components/nutrition/NutritionGoalsForm";

export default async function NutritionGoalsPage() {
  const goals = await getNutritionGoals();

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Objetivos Nutricionales</h1>
      </div>
      <NutritionGoalsForm initialData={goals} />
    </div>
  );
}