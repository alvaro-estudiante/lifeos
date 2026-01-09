import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Calendar, TrendingUp, Flame } from "lucide-react";
import Link from "next/link";
import { Workout } from "@/lib/actions/workouts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface FitnessSummaryProps {
  lastWorkout: Workout | null;
  stats: {
    streak: number;
    weeklyVolume: number;
  };
}

export function FitnessSummary({ lastWorkout, stats }: FitnessSummaryProps) {
  const lastWorkoutText = lastWorkout
    ? `Hace ${formatDistanceToNow(new Date(lastWorkout.workout_date), { locale: es })}`
    : "Sin actividad reciente";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          Fitness
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">Último entreno</div>
              <div className="text-xs text-muted-foreground">{lastWorkoutText}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Flame className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-sm font-medium">Racha actual</div>
              <div className="text-xs text-muted-foreground">{stats.streak} días seguidos</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm font-medium">Volumen semanal</div>
              <div className="text-xs text-muted-foreground">{stats.weeklyVolume.toLocaleString()} kg</div>
            </div>
          </div>
        </div>

        <Button asChild className="w-full mt-auto">
          <Link href="/dashboard/fitness/workout">
            Entrenar ahora <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}