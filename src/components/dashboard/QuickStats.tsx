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
      unit: "kcal",
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
      unit: "días",
      icon: Dumbbell,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Sueño",
      value: sleep?.duration || 0,
      unit: "h",
      icon: Moon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className="bg-card rounded-2xl p-3 border border-border/50 shadow-sm"
        >
          {/* Icon */}
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-2", stat.bgColor)}>
            <stat.icon className={cn("h-4 w-4", stat.color)} />
          </div>
          
          {/* Value */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-0.5">
              <span className="text-lg font-bold leading-none">{stat.value}</span>
              {stat.max !== undefined && (
                <span className="text-[10px] text-muted-foreground">/{stat.max}</span>
              )}
              {stat.unit && !stat.max && (
                <span className="text-[10px] text-muted-foreground">{stat.unit}</span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground leading-none">{stat.label}</p>
          </div>

          {/* Progress bar */}
          {stat.progress !== undefined && (
            <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
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
