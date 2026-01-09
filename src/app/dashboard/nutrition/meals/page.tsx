import { getMealsByDate, MealType, copyMealsFromDate } from "@/lib/actions/meals";
import { MealSection } from "@/components/nutrition/MealSection";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Copy, Flame } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

interface MealsPageProps {
  searchParams: { date?: string };
}

export default async function MealsPage({ searchParams }: MealsPageProps) {
  const date = searchParams.date || new Date().toISOString().split("T")[0];
  const displayDate = new Date(date);
  
  const meals = await getMealsByDate(date);

  const getMealByType = (type: MealType) => meals.find((m) => m.meal_type === type);

  const totalCalories = meals.reduce((acc, m) => acc + (m.total_calories || 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + (m.total_protein || 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + (m.total_carbs || 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + (m.total_fat || 0), 0);

  const prevDay = new Date(displayDate);
  prevDay.setDate(prevDay.getDate() - 1);
  const nextDay = new Date(displayDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const isToday = date === new Date().toISOString().split("T")[0];

  async function handleCopyYesterday() {
    "use server";
    const prevDay = new Date(displayDate);
    prevDay.setDate(prevDay.getDate() - 1);
    await copyMealsFromDate(prevDay.toISOString().split("T")[0], date);
    revalidatePath("/dashboard/nutrition/meals");
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Navigation - Mobile optimized */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={`/dashboard/nutrition/meals?date=${prevDay.toISOString().split("T")[0]}`}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        
        <div className="text-center flex-1">
          <h1 className="text-lg sm:text-xl font-bold capitalize">
            {isToday ? "Hoy" : format(displayDate, "EEEE", { locale: es })}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {format(displayDate, "d 'de' MMMM", { locale: es })}
          </p>
        </div>
        
        <Button variant="ghost" size="icon" asChild className="h-9 w-9">
          <Link href={`/dashboard/nutrition/meals?date=${nextDay.toISOString().split("T")[0]}`}>
            <ChevronRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>

      {/* Macros Summary - Compact for mobile */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-muted/30 rounded-xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Flame className="h-3 w-3 text-orange-500" />
            <span className="text-lg sm:text-xl font-bold">{Math.round(totalCalories)}</span>
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">kcal</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-red-500">{Math.round(totalProtein)}g</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Proteína</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-amber-500">{Math.round(totalCarbs)}g</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Carbos</div>
        </div>
        <div className="text-center">
          <div className="text-lg sm:text-xl font-bold text-emerald-500">{Math.round(totalFat)}g</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground">Grasa</div>
        </div>
      </div>

      {/* Quick Action */}
      <form action={handleCopyYesterday}>
        <Button variant="outline" size="sm" type="submit" className="w-full sm:w-auto">
          <Copy className="mr-2 h-4 w-4" />
          Copiar comidas de ayer
        </Button>
      </form>

      {/* Meal Sections */}
      <div className="space-y-4">
        <MealSection 
          title="Desayuno" 
          type="breakfast" 
          date={date} 
          meal={getMealByType("breakfast")} 
        />
        <MealSection 
          title="Almuerzo" 
          type="lunch" 
          date={date} 
          meal={getMealByType("lunch")} 
        />
        <MealSection 
          title="Cena" 
          type="dinner" 
          date={date} 
          meal={getMealByType("dinner")} 
        />
        <MealSection 
          title="Snacks" 
          type="snack" 
          date={date} 
          meal={getMealByType("snack")} 
        />
      </div>
    </div>
  );
}
