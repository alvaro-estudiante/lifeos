import { getWorkoutHistory } from "@/lib/actions/workouts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Dumbbell } from "lucide-react";
import Link from "next/link";

export default async function WorkoutHistoryPage() {
  const history = await getWorkoutHistory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((workout) => (
          <Link key={workout.id} href={`/fitness/workout/${workout.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                  <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(workout.workout_date), "dd MMM", { locale: es })}
                  </div>
                </div>
                <CardDescription>
                  {format(new Date(workout.workout_date), "EEEE, d 'de' MMMM", { locale: es })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {workout.duration_minutes || 0} min
                  </div>
                  <div className="flex items-center gap-1">
                    <Dumbbell className="h-4 w-4" />
                    {workout.total_volume || 0} kg
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay entrenamientos registrados.
        </div>
      )}
    </div>
  );
}