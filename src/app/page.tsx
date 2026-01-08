import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Utensils,
  Dumbbell,
  CheckSquare,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function getDashboardData(userId: string) {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  
  // Get today's nutrition
  const { data: todayMeals } = await supabase
    .from('meals')
    .select('total_calories')
    .eq('user_id', userId)
    .eq('meal_date', today);
  
  const mealsArray = todayMeals as { total_calories: number | null }[] | null;
  const totalCalories = (mealsArray ?? []).reduce((sum, m) => sum + (m.total_calories ?? 0), 0);

  // Get nutrition goals
  const { data: goals } = await supabase
    .from('nutrition_goals')
    .select('calories_target')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();

  const goalsData = goals as { calories_target: number | null } | null;

  // Get pending tasks count
  const { count: pendingTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', ['pending', 'in_progress']);

  // Get high priority tasks for today
  const { count: urgentTasks } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('priority', ['high', 'urgent'])
    .in('status', ['pending', 'in_progress']);

  // Get total balance
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId);
  
  const accountsArray = accounts as { balance: number }[] | null;
  const totalBalance = (accountsArray ?? []).reduce((sum, a) => sum + Number(a.balance), 0);

  // Get today's habits completion
  const { data: habits } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true);

  const habitsArray = habits as { id: string }[] | null;
  const habitIds = (habitsArray ?? []).map(h => h.id);
  
  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('habit_id, value')
    .eq('log_date', today)
    .in('habit_id', habitIds.length > 0 ? habitIds : ['__none__']);

  const logsArray = todayLogs as { habit_id: string; value: number }[] | null;
  const habitsCompleted = (logsArray ?? []).filter(l => l.value > 0).length;
  const totalHabits = habitsArray?.length ?? 0;

  return {
    nutrition: {
      calories: totalCalories,
      target: goalsData?.calories_target ?? 2000,
    },
    tasks: {
      pending: pendingTasks || 0,
      urgent: urgentTasks || 0,
    },
    finance: {
      balance: totalBalance,
    },
    habits: {
      completed: habitsCompleted,
      total: totalHabits,
    },
  };
}

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const data = await getDashboardData(user.id);

  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/nutrition">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nutrición</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.nutrition.calories.toLocaleString()} kcal
              </div>
              <p className="text-xs text-muted-foreground">
                Objetivo: {data.nutrition.target.toLocaleString()} kcal
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/fitness">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fitness</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Hoy</div>
              <p className="text-xs text-muted-foreground">
                Ver rutinas y entrenamientos
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tareas</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.tasks.pending} Pendientes</div>
              <p className="text-xs text-muted-foreground">
                {data.tasks.urgent > 0 
                  ? `${data.tasks.urgent} urgente${data.tasks.urgent > 1 ? 's' : ''}`
                  : 'Sin tareas urgentes'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/finance">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finanzas</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.finance.balance.toLocaleString('es-ES', { 
                  style: 'currency', 
                  currency: 'EUR' 
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance total
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Resumen del Día</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Progreso de Nutrición</CardTitle>
              <CardDescription>
                {Math.round((data.nutrition.calories / data.nutrition.target) * 100)}% del objetivo diario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Calorías consumidas</span>
                  <span className="font-medium">
                    {data.nutrition.calories} / {data.nutrition.target} kcal
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all"
                    style={{ 
                      width: `${Math.min((data.nutrition.calories / data.nutrition.target) * 100, 100)}%` 
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Hábitos</CardTitle>
              <CardDescription>Seguimiento diario</CardDescription>
            </CardHeader>
            <CardContent>
              {data.habits.total > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completados hoy</span>
                    <span className="text-2xl font-bold">
                      {data.habits.completed}/{data.habits.total}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all"
                      style={{ 
                        width: `${(data.habits.completed / data.habits.total) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No tienes hábitos configurados. 
                  <Link href="/habits" className="text-primary hover:underline ml-1">
                    Crear hábito
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
