"use client";

import { Flame, CheckCircle2, Dumbbell, Moon } from "lucide-react";
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
  const nutritionProgress = Math.min(100, Math.round((nutrition.consumed / nutrition.target) * 100));
  const tasksProgress = tasks.total > 0 ? Math.round((tasks.completed / tasks.total) * 100) : 0;

  const stats = [
    {
      label: "Calorías",
      value: Math.round(nutrition.consumed),
      max: nutrition.target,
      progress: nutritionProgress,
      icon: Flame,
      color: "text-orange-500",
      progressColor: "bg-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Tareas",
      value: tasks.completed,
      max: tasks.total,
      progress: tasksProgress,
      icon: CheckCircle2,
      color: "text-emerald-500",
      progressColor: "bg-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Racha",
      value: fitness.streak,
      suffix: "días",
      icon: Dumbbell,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Sueño",
      value: sleep?.duration || 0,
      suffix: "h",
      icon: Moon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="bg-card rounded-2xl p-3 sm:p-4 border border-border/50"
        >
          {/* Icon & Label Row */}
          <div className="flex items-center gap-2 mb-2">
            <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center", stat.bgColor)}>
              <stat.icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", stat.color)} />
            </div>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
          </div>
          
          {/* Value */}
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold">{stat.value}</span>
            {stat.max !== undefined && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">/{stat.max}</span>
            )}
            {stat.suffix && (
              <span className="text-[10px] sm:text-xs text-muted-foreground">{stat.suffix}</span>
            )}
          </div>

          {/* Progress bar */}
          {stat.progress !== undefined && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-500", stat.progressColor)}
                style={{ width: `${stat.progress}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
