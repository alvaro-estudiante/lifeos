import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, CheckSquare, Dumbbell, Moon } from "lucide-react";

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

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Calorías</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(nutrition.consumed)}</div>
          <p className="text-xs text-muted-foreground">
            / {nutrition.target} kcal
          </p>
          <Progress value={nutritionProgress} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {tasks.completed}/{tasks.total}
          </div>
          <p className="text-xs text-muted-foreground">
            Completadas hoy
          </p>
          <Progress value={tasksProgress} className="h-2 mt-2 bg-orange-100" indicatorClassName="bg-orange-500" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entreno</CardTitle>
          <Dumbbell className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            🔥 {fitness.streak} días
          </div>
          <p className="text-xs text-muted-foreground">
            Racha actual
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sueño</CardTitle>
          <Moon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {sleep?.duration || "-"} h
          </div>
          <p className="text-xs text-muted-foreground">
            Anoche
          </p>
        </CardContent>
      </Card>
    </div>
  );
}