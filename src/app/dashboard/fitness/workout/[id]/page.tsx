import { getWorkoutById } from "@/lib/actions/workouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Clock, Dumbbell, Zap, Activity } from "lucide-react";
import { notFound } from "next/navigation";

interface WorkoutDetailPageProps {
  params: {
    id: string;
  };
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  try {
    const workout = await getWorkoutById(params.id);

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{workout.name}</h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(workout.workout_date), "PPP", { locale: es })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {workout.duration_minutes || 0} min
            </div>
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              {workout.total_volume || 0} kg
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Energía</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-2xl font-bold">{workout.energy_level || "-"}/10</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sensación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{workout.overall_feeling || "-"}/10</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {workout.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground italic">"{workout.notes}"</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Ejercicios</h2>
          {workout.exercises?.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{exercise.exercise_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium mb-2">
                    <div>Serie</div>
                    <div>Kg</div>
                    <div>Reps</div>
                    <div>RPE</div>
                  </div>
                  {exercise.sets?.map((set, index) => (
                    <div key={set.id} className="grid grid-cols-4 gap-2 text-sm items-center py-1 border-b last:border-0">
                      <div className="font-medium">{index + 1}</div>
                      <div>{set.weight_kg}</div>
                      <div>{set.reps}</div>
                      <div>{set.rpe || "-"}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}