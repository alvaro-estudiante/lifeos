import { getWorkoutHistory } from "@/lib/actions/workouts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dumbbell, History, TrendingUp, Calendar, ChevronRight, Play, ListChecks, BarChart3 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function FitnessDashboardPage() {
  const history = await getWorkoutHistory(5);
  const lastWorkout = history[0];

  const weeklyWorkouts = history.filter(w => {
    const workoutDate = new Date(w.workout_date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return workoutDate > oneWeekAgo;
  });

  const weeklyVolume = weeklyWorkouts.reduce((acc, w) => acc + (w.total_volume || 0), 0);

  return (
    <div className="space-y-5">
      {/* Start Workout CTA */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">¿Listo para entrenar?</h2>
              <p className="text-blue-100 text-sm mt-0.5">
                {lastWorkout 
                  ? `Último entreno ${formatDistanceToNow(new Date(lastWorkout.workout_date), { locale: es, addSuffix: true })}`
                  : "Comienza tu primer entrenamiento"
                }
              </p>
            </div>
            <Button asChild size="lg" variant="secondary" className="h-12 px-5 font-semibold shadow-lg">
              <Link href="/dashboard/fitness/workout">
                <Play className="mr-2 h-5 w-5" /> Entrenar
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{weeklyWorkouts.length}</p>
                <p className="text-xs text-muted-foreground">Esta semana</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(weeklyVolume / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">kg semanal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <Link href="/dashboard/fitness/routines">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <ListChecks className="h-6 w-6 mx-auto text-purple-500 mb-2" />
              <p className="text-xs font-medium">Rutinas</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/fitness/exercises">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <Dumbbell className="h-6 w-6 mx-auto text-orange-500 mb-2" />
              <p className="text-xs font-medium">Ejercicios</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/fitness/progress">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 mx-auto text-cyan-500 mb-2" />
              <p className="text-xs font-medium">Progreso</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Actividad Reciente</h2>
          <Link href="/dashboard/fitness/history" className="text-xs text-primary flex items-center">
            Ver todo <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className="space-y-2">
          {history.length > 0 ? (
            history.slice(0, 3).map((workout) => (
              <Link key={workout.id} href={`/dashboard/fitness/workout/${workout.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10 flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{workout.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(workout.workout_date), "d MMM", { locale: es })} • {workout.duration_minutes || 0} min
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm">{(workout.total_volume / 1000).toFixed(1)}k</p>
                      <p className="text-[10px] text-muted-foreground">kg</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Sin entrenamientos aún</p>
                <p className="text-xs text-muted-foreground mt-1">¡Empieza hoy!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
