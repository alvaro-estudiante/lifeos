import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronRight, ShoppingBasket, Target, ChefHat, Utensils, History, Apple } from "lucide-react";
import { getDailySummary } from "@/lib/actions/nutrition-summary";
import { cn } from "@/lib/utils";

export default async function NutritionPage() {
  const date = new Date().toISOString().split("T")[0];
  const { consumed, goals } = await getDailySummary(date);

  const caloriesTarget = goals?.calories_target || 2000;
  const proteinTarget = goals?.protein_g || 150;
  const carbsTarget = goals?.carbs_g || 200;
  const fatTarget = goals?.fat_g || 60;

  const caloriesProgress = Math.min(100, Math.round((consumed.calories / caloriesTarget) * 100));
  const remaining = Math.max(0, caloriesTarget - consumed.calories);

  const macros = [
    { name: "Proteína", value: Math.round(consumed.protein), target: proteinTarget, unit: "g", color: "bg-red-500", textColor: "text-red-500" },
    { name: "Carbos", value: Math.round(consumed.carbs), target: carbsTarget, unit: "g", color: "bg-amber-500", textColor: "text-amber-500" },
    { name: "Grasa", value: Math.round(consumed.fat), target: fatTarget, unit: "g", color: "bg-emerald-500", textColor: "text-emerald-500" },
  ];

  return (
    <div className="space-y-5">
      {/* Main Card - Today's Summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Hoy</h2>
            <Link href="/dashboard/nutrition/meals" className="text-xs text-primary flex items-center">
              Ver comidas <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          
          {/* Circular Progress */}
          <div className="flex items-center gap-5">
            <div className="relative w-24 h-24 flex-shrink-0">
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
                    "transition-all duration-1000 ease-out",
                    caloriesProgress >= 100 ? "text-amber-500" : "text-primary"
                  )}
                  strokeDasharray={`${caloriesProgress}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{Math.round(consumed.calories)}</span>
                <span className="text-[10px] text-muted-foreground">kcal</span>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-3xl font-bold">{remaining}</div>
              <div className="text-sm text-muted-foreground">calorías restantes</div>
              <div className="text-xs text-muted-foreground mt-1">
                Objetivo: {caloriesTarget} kcal
              </div>
            </div>
          </div>
          
          {/* Macros Grid */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {macros.map((macro) => {
              const progress = Math.min(100, Math.round((macro.value / macro.target) * 100));
              return (
                <div key={macro.name} className="text-center">
                  <div className={cn("text-lg font-bold", macro.textColor)}>
                    {macro.value}<span className="text-xs font-normal text-muted-foreground">/{macro.target}{macro.unit}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-1">{macro.name}</div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", macro.color)}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* CTA - Add Meal */}
      <Button asChild className="w-full h-12 text-base font-semibold">
        <Link href="/dashboard/nutrition/meals">
          <Utensils className="mr-2 h-5 w-5" /> Registrar Comida
        </Link>
      </Button>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/dashboard/nutrition/pantry">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="p-2 rounded-xl bg-orange-500/10 w-fit mb-2">
                <ShoppingBasket className="h-5 w-5 text-orange-500" />
              </div>
              <p className="font-medium text-sm">Despensa</p>
              <p className="text-xs text-muted-foreground mt-0.5">Gestiona ingredientes</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/nutrition/goals">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="p-2 rounded-xl bg-purple-500/10 w-fit mb-2">
                <Target className="h-5 w-5 text-purple-500" />
              </div>
              <p className="font-medium text-sm">Objetivos</p>
              <p className="text-xs text-muted-foreground mt-0.5">Configura tus metas</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/nutrition/recipes">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="p-2 rounded-xl bg-pink-500/10 w-fit mb-2">
                <ChefHat className="h-5 w-5 text-pink-500" />
              </div>
              <p className="font-medium text-sm">Recetas</p>
              <p className="text-xs text-muted-foreground mt-0.5">Ideas con IA</p>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/dashboard/nutrition/history">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="p-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 w-fit mb-2">
                <History className="h-5 w-5 text-cyan-500" />
              </div>
              <p className="font-medium text-sm">Historial</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tendencias y datos</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
