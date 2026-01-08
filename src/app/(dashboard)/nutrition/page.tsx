import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingBasket, Target, ChefHat } from "lucide-react";
import { getDailySummary } from "@/lib/actions/nutrition-summary";
import { MacroRings } from "@/components/nutrition/MacroRings";

export default async function NutritionPage() {
  const date = new Date().toISOString().split("T")[0];
  const { consumed, goals } = await getDailySummary(date);

  // const calPercentage = Math.min(100, Math.round((consumed.calories / (goals?.calories_target || 2000)) * 100));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Nutrición</h1>
        <Button asChild>
          <Link href="/nutrition/meals">
            Ver Comidas <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Macro Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Hoy</CardTitle>
            <CardDescription>
              Progreso hacia tus objetivos diarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <MacroRings
              calories={{
                name: "Calorías",
                value: consumed.calories,
                total: goals?.calories_target || 2000,
                color: "#3B82F6",
              }}
              protein={{
                name: "Proteína",
                value: consumed.protein,
                total: goals?.protein_g || 150,
                color: "#EF4444",
              }}
              carbs={{
                name: "Carbos",
                value: consumed.carbs,
                total: goals?.carbs_g || 200,
                color: "#F59E0B",
              }}
              fat={{
                name: "Grasa",
                value: consumed.fat,
                total: goals?.fat_g || 60,
                color: "#10B981",
              }}
            />
            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold">{Math.round(consumed.calories)}</div>
                <div className="text-xs text-muted-foreground">/{goals?.calories_target} kcal</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{Math.round(consumed.protein)}</div>
                <div className="text-xs text-muted-foreground">/{goals?.protein_g}g Prot</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-500">{Math.round(consumed.carbs)}</div>
                <div className="text-xs text-muted-foreground">/{goals?.carbs_g}g Carb</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-500">{Math.round(consumed.fat)}</div>
                <div className="text-xs text-muted-foreground">/{goals?.fat_g}g Gras</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="col-span-3 space-y-6">
          <div className="grid gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceso Rápido</CardTitle>
                <ShoppingBasket className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="secondary">
                  <Link href="/nutrition/pantry">
                    Ir a Despensa <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Objetivos</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full" variant="outline">
                  <Link href="/nutrition/goals">
                    Configurar Metas
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="opacity-60">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recetas (Pronto)</CardTitle>
                <ChefHat className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Button disabled className="w-full" variant="ghost">
                  Generar con IA
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}