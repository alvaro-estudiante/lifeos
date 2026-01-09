import { getDashboardData } from "@/lib/actions/dashboard";
import { createClient } from "@/lib/supabase/server";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import { QuickStats } from "@/components/dashboard/QuickStats";
import { DayOrganizer } from "@/components/dashboard/DayOrganizer";
import { NutritionSummary } from "@/components/dashboard/NutritionSummary";
import { FitnessSummary } from "@/components/dashboard/FitnessSummary";
import { TodayHabits } from "@/components/dashboard/TodayHabits";
import { SmartSuggestions } from "@/components/dashboard/SmartSuggestions";
import { getDailySuggestions } from "@/lib/actions/suggestions";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [data, suggestions] = await Promise.all([
    getDashboardData(user.id),
    getDailySuggestions(user.id),
  ]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <WelcomeHeader userName={data.user.full_name || "Usuario"} />
      
      <SmartSuggestions suggestions={suggestions} />

      <QuickStats
        nutrition={{
          consumed: data.nutrition.summary.consumed.calories, 
          target: data.nutrition.goals?.calories_target || 2000 
        }}
        tasks={{ 
          completed: data.tasks.completedCount, 
          total: data.tasks.totalCount 
        }}
        fitness={{ 
          streak: data.fitness.streak, 
          lastWorkoutDate: data.fitness.lastWorkout?.workout_date 
        }}
        sleep={{ 
          duration: data.sleep?.duration_hours || 0 
        }}
      />

      {/* Mobile: Stack vertically, Desktop: Grid */}
      <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Main Content - Tasks */}
        <div className="lg:col-span-2">
          <DayOrganizer tasks={data.tasks.today} />
        </div>

        {/* Sidebar - Habits */}
        <div className="lg:col-span-1">
          <TodayHabits habits={data.habits.list} />
        </div>
      </div>

      {/* Summary Cards - Always horizontal scroll on mobile */}
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:overflow-visible">
        <div className="min-w-[280px] sm:min-w-0">
          <NutritionSummary
            summary={data.nutrition.summary}
            meals={data.nutrition.meals}
          />
        </div>
        <div className="min-w-[280px] sm:min-w-0">
          <FitnessSummary
            lastWorkout={data.fitness.lastWorkout}
            stats={data.fitness}
          />
        </div>
      </div>
    </div>
  );
}
