import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Utensils, Coffee, Sun, Moon } from "lucide-react";
import Link from "next/link";
import { Meal } from "@/lib/actions/meals";
import { cn } from "@/lib/utils";

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
  const remaining = Math.max(0, caloriesTarget - summary.consumed.calories);

  const getMealKcal = (type: string) => {
    const meal = meals.find((m) => m.meal_type === type);
    return meal?.total_calories ? Math.round(meal.total_calories) : 0;
  };

  const mealTypes = [
    { type: "breakfast", label: "Desayuno", icon: Coffee, color: "text-amber-500" },
    { type: "lunch", label: "Almuerzo", icon: Sun, color: "text-orange-500" },
    { type: "dinner", label: "Cena", icon: Moon, color: "text-indigo-500" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5 text-emerald-500" />
          <CardTitle className="text-base font-semibold">Nutrición</CardTitle>
        </div>
        <Link 
          href="/dashboard/nutrition/meals"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          Ver más <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4">
        {/* Circular Progress */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-14 h-14 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-muted/30"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
              />
              <path
                className={cn(
                  "transition-all duration-1000 ease-out",
                  percentage >= 100 ? "text-amber-500" : "text-emerald-500"
                )}
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{percentage}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-bold">{Math.round(summary.consumed.calories)}</div>
            <div className="text-xs text-muted-foreground">
              de {caloriesTarget} kcal
            </div>
            {remaining > 0 && (
              <div className="text-[10px] text-emerald-600 mt-0.5">
                {remaining} restantes
              </div>
            )}
          </div>
        </div>

        {/* Meals Breakdown */}
        <div className="space-y-2 flex-1">
          {mealTypes.map(({ type, label, icon: Icon, color }) => {
            const kcal = getMealKcal(type);
            return (
              <div key={type} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", color)} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  kcal === 0 && "text-muted-foreground"
                )}>
                  {kcal > 0 ? `${kcal} kcal` : "---"}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
