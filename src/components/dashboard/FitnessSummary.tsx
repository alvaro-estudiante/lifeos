"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Dumbbell, Flame } from "lucide-react";
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
    ? formatDistanceToNow(new Date(lastWorkout.workout_date), { locale: es, addSuffix: true })
    : "Sin entrenar";

  return (
    <Link href="/dashboard/fitness/workout">
      <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Dumbbell className="h-4 w-4 text-blue-500" />
              </div>
              <span className="font-semibold text-sm">Fitness</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Stats */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-lg font-bold">{stats.streak}</span>
              <span className="text-xs text-muted-foreground">días racha</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Último entreno {lastWorkoutText}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
