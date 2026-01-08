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
    redirect("/login");
  }

  const [data, suggestions] = await Promise.all([
    getDashboardData(user.id),
    getDailySuggestions(user.id),
  ]);

  return (
    <div className="space-y-6">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Main Column - Timeline */}
        <div className="space-y-6 lg:col-span-2">
          <DayOrganizer tasks={data.tasks.today} />
        </div>

        {/* Sidebar Column - Habits & Summary */}
        <div className="space-y-6">
          <TodayHabits habits={data.habits.list} />
          
          <div className="grid gap-6 md:grid-cols-1">
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
      </div>
    </div>
  );
}