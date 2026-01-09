import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, CheckSquare, Dumbbell, Moon, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickStatsProps {
  nutrition: {
    consumed: number;
    target: number;
  };
  tasks: {
    completed: number;
    total: number;
  };
  fitness: {
    streak: number;
    lastWorkoutDate?: string;
  };
  sleep?: {
    duration: number;
  };
}

export function QuickStats({ nutrition, tasks, fitness, sleep }: QuickStatsProps) {
  const nutritionProgress = Math.min(100, (nutrition.consumed / nutrition.target) * 100);
  const tasksProgress = tasks.total > 0 ? (tasks.completed / tasks.total) * 100 : 0;

  const stats = [
    {
      label: "Calorías",
      value: Math.round(nutrition.consumed),
      subtext: `/ ${nutrition.target}`,
      icon: Utensils,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      progress: nutritionProgress,
      progressColor: "bg-emerald-500",
    },
    {
      label: "Tareas",
      value: tasks.completed,
      subtext: `/ ${tasks.total}`,
      icon: CheckSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      progress: tasksProgress,
      progressColor: "bg-amber-500",
    },
    {
      label: "Racha",
      value: fitness.streak,
      subtext: "días",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Sueño",
      value: sleep?.duration || "-",
      subtext: "horas",
      icon: Moon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={cn("p-1.5 sm:p-2 rounded-lg", stat.bgColor)}>
                <stat.icon className={cn("h-4 w-4 sm:h-5 sm:w-5", stat.color)} />
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.subtext}</span>
              </div>
            </div>
            {stat.progress !== undefined && (
              <div className="mt-2">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all", stat.progressColor)}
                    style={{ width: `${stat.progress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
