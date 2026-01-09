import { getWorkoutHistory } from "@/lib/actions/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dumbbell, History, TrendingUp, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function FitnessDashboardPage() {
  const history = await getWorkoutHistory(5);
  const lastWorkout = history[0];

  const weeklyVolume = history.reduce((acc, w) => {
    // Simple logic: if workout is from last 7 days (not precise week)
    const workoutDate = new Date(w.workout_date);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (workoutDate > oneWeekAgo) {
      return acc + (w.total_volume || 0);
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Fitness</h1>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
          <Link href="/fitness/workout">
            <Dumbbell className="mr-2 h-5 w-5" /> Entrenar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Último Entreno</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastWorkout ? format(new Date(lastWorkout.workout_date), "dd MMM", { locale: es }) : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastWorkout?.name || "Sin registros"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volumen Semanal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyVolume.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">
              Últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rutinas</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/fitness/routines">
                Ver Mis Rutinas <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Historial</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild variant="link" className="px-0">
              <Link href="/fitness/history">
                Ver Historial <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((workout) => (
              <Link key={workout.id} href={`/fitness/workout/${workout.id}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-semibold">{workout.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(workout.workout_date), "PPP", { locale: es })} • {workout.duration_minutes} min
                    </div>
                  </div>
                  <div className="font-medium">
                    {workout.total_volume} kg
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-muted-foreground text-sm">No hay actividad reciente.</div>
          )}
        </div>
      </div>
    </div>
  );
}