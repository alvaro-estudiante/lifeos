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
    <div className="space-y-5">
      {/* Welcome - Always visible */}
      <WelcomeHeader userName={data.user.full_name || "Usuario"} />
      
      {/* Quick Stats - 2x2 grid on mobile */}
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

      {/* Suggestions - Horizontal scroll */}
      <SmartSuggestions suggestions={suggestions} />

      {/* Main content - Vertical on mobile */}
      <div className="space-y-5 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
        {/* Tasks & Habits Section */}
        <div className="space-y-5 lg:col-span-2 lg:space-y-6">
          <DayOrganizer tasks={data.tasks.today} />
        </div>

        {/* Sidebar - Habits */}
        <div className="lg:col-span-1">
          <TodayHabits habits={data.habits.list} />
        </div>
      </div>

      {/* Summary Cards - Side by side on mobile with scroll */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <NutritionSummary
          summary={data.nutrition.summary}
          meals={data.nutrition.meals}
        />
        <FitnessSummary
          lastWorkout={data.fitness.lastWorkout}
          stats={data.fitness}
        />
      </div>
    </div>
  );
}
