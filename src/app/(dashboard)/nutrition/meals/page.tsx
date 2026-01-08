import { getMealsByDate, MealType, copyMealsFromDate } from "@/lib/actions/meals";
import { MealSection } from "@/components/nutrition/MealSection";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
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

  async function handleCopyYesterday() {
    "use server";
    const prevDay = new Date(displayDate);
    prevDay.setDate(prevDay.getDate() - 1);
    await copyMealsFromDate(prevDay.toISOString().split("T")[0], date);
    revalidatePath("/nutrition/meals");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Comidas</h1>
            <form action={handleCopyYesterday}>
              <Button variant="outline" size="sm" type="submit">
                <Copy className="mr-2 h-4 w-4" />
                Repetir ayer
              </Button>
            </form>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/nutrition/meals?date=${prevDay.toISOString().split("T")[0]}`}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(displayDate, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={displayDate}
                  initialFocus
                  // We need to handle navigation via URL params, so we might need a client component wrapper for full interactivity
                  // For now, this is a simple display or basic picker that doesn't fully integrate with server component reload without client logic.
                  // Ideally, this should be a client component for date selection.
                />
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="icon" asChild>
              <Link href={`/nutrition/meals?date=${nextDay.toISOString().split("T")[0]}`}>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border">
          <div>
            <div className="text-sm text-muted-foreground">Calorías</div>
            <div className="text-2xl font-bold">{Math.round(totalCalories)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Proteína</div>
            <div className="text-2xl font-bold text-red-500">{Math.round(totalProtein)}g</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Carbohidratos</div>
            <div className="text-2xl font-bold text-amber-500">{Math.round(totalCarbs)}g</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Grasa</div>
            <div className="text-2xl font-bold text-emerald-500">{Math.round(totalFat)}g</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
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