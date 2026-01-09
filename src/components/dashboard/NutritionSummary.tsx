import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils } from "lucide-react";
import Link from "next/link";
import { Meal } from "@/lib/actions/meals";

interface NutritionSummaryProps {
  summary: {
    consumed: {
      calories: number;
    };
    goals?: {
      calories_target: number;
    } | null;
  };
  meals: Meal[];
}

export function NutritionSummary({ summary, meals }: NutritionSummaryProps) {
  const caloriesTarget = summary.goals?.calories_target || 2000;
  const percentage = Math.min(100, Math.round((summary.consumed.calories / caloriesTarget) * 100));

  const getMealKcal = (type: string) => {
    const meal = meals.find((m) => m.meal_type === type);
    return meal?.total_calories ? Math.round(meal.total_calories) : "---";
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="h-5 w-5 text-emerald-500" />
          Nutrición Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            {/* Simple CSS ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted/20"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {percentage}%
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">{Math.round(summary.consumed.calories)} / {caloriesTarget}</div>
            <div className="text-xs text-muted-foreground">Kcal consumidas</div>
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Desayuno</span>
            <span className="font-medium">{getMealKcal("breakfast")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Almuerzo</span>
            <span className="font-medium">{getMealKcal("lunch")}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cena</span>
            <span className="font-medium">{getMealKcal("dinner")}</span>
          </div>
        </div>

        <Button asChild variant="link" className="mt-4 w-full h-auto p-0 text-muted-foreground">
          <Link href="/dashboard/nutrition/meals">Ver comidas <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardContent>
    </Card>
  );
}