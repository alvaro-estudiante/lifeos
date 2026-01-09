"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Utensils } from "lucide-react";
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

  return (
    <Link href="/dashboard/nutrition/meals">
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Utensils className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="font-semibold text-sm">Nutrición</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Circular Progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-muted/30"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className={cn(
                    "transition-all duration-700 ease-out",
                    percentage >= 100 ? "text-amber-500" : "text-emerald-500"
                  )}
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] font-bold">{percentage}%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold leading-none">
                {Math.round(summary.consumed.calories)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                de {caloriesTarget} kcal
              </p>
              {remaining > 0 && (
                <p className="text-[10px] text-emerald-600 font-medium">
                  {remaining} restantes
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
