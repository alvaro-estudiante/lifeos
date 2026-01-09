'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Dumbbell, Calendar, Flame, Target } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ExerciseProgress {
  exercise_id: string;
  exercise_name: string;
  muscle_group: string;
  history: {
    date: string;
    max_weight: number;
    total_volume: number;
    sets: number;
  }[];
  pr: {
    weight: number;
    date: string;
  };
}

interface WorkoutStats {
  total_workouts: number;
  total_volume: number;
  avg_duration: number;
  current_streak: number;
  best_streak: number;
  workouts_this_week: number;
  workouts_this_month: number;
}

export default function FitnessProgressPage() {
  const [exercises, setExercises] = useState<ExerciseProgress[]>([]);
  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [timeRange]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/fitness/progress?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data.exercises || []);
        setStats(data.stats);
        if (data.exercises?.length > 0 && !selectedExercise) {
          setSelectedExercise(data.exercises[0].exercise_id);
        }
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
    setLoading(false);
  };

  const selectedExerciseData = exercises.find(e => e.exercise_id === selectedExercise);

  const muscleGroupColors: Record<string, string> = {
    chest: 'bg-red-500',
    back: 'bg-blue-500',
    shoulders: 'bg-orange-500',
    biceps: 'bg-purple-500',
    triceps: 'bg-pink-500',
    quadriceps: 'bg-green-500',
    hamstrings: 'bg-emerald-500',
    glutes: 'bg-teal-500',
    core: 'bg-yellow-500',
    calves: 'bg-cyan-500',
  };

  const getMaxWeight = (history: ExerciseProgress['history']) => {
    return Math.max(...history.map(h => h.max_weight), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progreso Fitness</h1>
          <p className="text-muted-foreground">Analiza tu evolución y records personales</p>
        </div>
        <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Último mes</SelectItem>
            <SelectItem value="90">3 meses</SelectItem>
            <SelectItem value="180">6 meses</SelectItem>
            <SelectItem value="365">1 año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats generales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Dumbbell className="h-8 w-8 text-primary mb-2" />
                <p className="text-2xl font-bold">{stats.total_workouts}</p>
                <p className="text-xs text-muted-foreground">Entrenamientos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Flame className="h-8 w-8 text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{(stats.total_volume / 1000).toFixed(1)}k</p>
                <p className="text-xs text-muted-foreground">Volumen (kg)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Calendar className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{stats.avg_duration}</p>
                <p className="text-xs text-muted-foreground">Min promedio</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-2xl font-bold">{stats.current_streak}</p>
                <p className="text-xs text-muted-foreground">Racha actual</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{stats.best_streak}</p>
                <p className="text-xs text-muted-foreground">Mejor racha</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <Target className="h-8 w-8 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{stats.workouts_this_month}</p>
                <p className="text-xs text-muted-foreground">Este mes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Records Personales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Records Personales (PRs)
          </CardTitle>
          <CardDescription>Tus mejores marcas por ejercicio</CardDescription>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No hay datos de entrenamientos todavía. ¡Empieza a registrar tus workouts!
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {exercises.map((exercise) => (
                <div
                  key={exercise.exercise_id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors",
                    selectedExercise === exercise.exercise_id 
                      ? "border-primary bg-primary/5" 
                      : "hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedExercise(exercise.exercise_id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      muscleGroupColors[exercise.muscle_group] || 'bg-gray-500'
                    )} />
                    <div>
                      <p className="font-medium">{exercise.exercise_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {exercise.muscle_group}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{exercise.pr.weight} kg</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(exercise.pr.date), 'd MMM', { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gráfico de progreso del ejercicio seleccionado */}
      {selectedExerciseData && selectedExerciseData.history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progreso: {selectedExerciseData.exercise_name}</CardTitle>
            <CardDescription>
              Evolución del peso máximo en los últimos {timeRange} días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end gap-1">
              {selectedExerciseData.history.map((entry, index) => {
                const maxInHistory = getMaxWeight(selectedExerciseData.history);
                const heightPercent = (entry.max_weight / maxInHistory) * 100;
                const isPR = entry.max_weight === selectedExerciseData.pr.weight;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
                      {entry.max_weight} kg - {format(new Date(entry.date), 'd MMM', { locale: es })}
                    </div>
                    <div
                      className={cn(
                        "w-full rounded-t transition-all",
                        isPR ? "bg-yellow-500" : "bg-primary"
                      )}
                      style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                    />
                    {isPR && (
                      <Trophy className="h-3 w-3 text-yellow-500 absolute -top-4" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-4 text-xs text-muted-foreground">
              <span>{format(new Date(selectedExerciseData.history[0]?.date || new Date()), 'd MMM', { locale: es })}</span>
              <span>{format(new Date(selectedExerciseData.history[selectedExerciseData.history.length - 1]?.date || new Date()), 'd MMM', { locale: es })}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volumen por grupo muscular */}
      <Card>
        <CardHeader>
          <CardTitle>Volumen por Grupo Muscular</CardTitle>
          <CardDescription>Distribución del trabajo en los últimos {timeRange} días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(
              exercises.reduce((acc, ex) => {
                const totalVolume = ex.history.reduce((sum, h) => sum + h.total_volume, 0);
                acc[ex.muscle_group] = (acc[ex.muscle_group] || 0) + totalVolume;
                return acc;
              }, {} as Record<string, number>)
            )
              .sort(([, a], [, b]) => b - a)
              .map(([muscle, volume]) => {
                const maxVolume = Math.max(
                  ...Object.values(
                    exercises.reduce((acc, ex) => {
                      const totalVolume = ex.history.reduce((sum, h) => sum + h.total_volume, 0);
                      acc[ex.muscle_group] = (acc[ex.muscle_group] || 0) + totalVolume;
                      return acc;
                    }, {} as Record<string, number>)
                  )
                );
                const percentage = (volume / maxVolume) * 100;

                return (
                  <div key={muscle} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{muscle}</span>
                      <span className="text-muted-foreground">{(volume / 1000).toFixed(1)}k kg</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full", muscleGroupColors[muscle] || 'bg-gray-500')}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
