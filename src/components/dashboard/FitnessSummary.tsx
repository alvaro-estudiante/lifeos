import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Dumbbell, Calendar, TrendingUp, Flame, Play } from "lucide-react";
import Link from "next/link";
import { Workout } from "@/lib/actions/workouts";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface FitnessSummaryProps {
  lastWorkout: Workout | null;
  stats: {
    streak: number;
    weeklyVolume: number;
  };
}

export function FitnessSummary({ lastWorkout, stats }: FitnessSummaryProps) {
  const lastWorkoutText = lastWorkout
    ? formatDistanceToNow(new Date(lastWorkout.workout_date), { locale: es, addSuffix: true })
    : "Sin actividad";

  const statItems = [
    {
      icon: Calendar,
      label: "Último entreno",
      value: lastWorkoutText,
      color: "text-muted-foreground",
    },
    {
      icon: Flame,
      label: "Racha",
      value: `${stats.streak} días`,
      color: "text-orange-500",
    },
    {
      icon: TrendingUp,
      label: "Vol. semanal",
      value: `${stats.weeklyVolume.toLocaleString()} kg`,
      color: "text-green-500",
    },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-semibold">Fitness</CardTitle>
        </div>
        <Link 
          href="/dashboard/fitness"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          Ver más <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-4 pb-4">
        {/* Stats */}
        <div className="space-y-3 flex-1">
          {statItems.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", color)} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
              <span className="text-sm font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button asChild size="sm" className="w-full mt-3 gap-2">
          <Link href="/dashboard/fitness/workout">
            <Play className="h-4 w-4" />
            Entrenar
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
