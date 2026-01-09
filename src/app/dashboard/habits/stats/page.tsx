'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Calendar, Target, TrendingUp, Award } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameDay, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface HabitStats {
  id: string;
  name: string;
  color: string;
  icon: string;
  target_value: number;
  current_streak: number;
  best_streak: number;
  completion_rate: number;
  total_completions: number;
  logs: { date: string; value: number }[];
}

export default function HabitsStatsPage() {
  const [habits, setHabits] = useState<HabitStats[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'30' | '90' | '180' | '365'>('90');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/habits/stats?days=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setHabits(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  };

  const days = parseInt(timeRange);
  const dateRange = eachDayOfInterval({
    start: subDays(new Date(), days - 1),
    end: new Date(),
  });

  // Agrupar por semanas para el heatmap
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  dateRange.forEach((date, index) => {
    const dayOfWeek = getDay(date);
    if (dayOfWeek === 1 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(date);
    if (index === dateRange.length - 1) {
      weeks.push(currentWeek);
    }
  });

  const getCompletionForDay = (date: Date, habitId?: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const habitsToCheck = habitId && habitId !== 'all'
      ? habits.filter(h => h.id === habitId)
      : habits;
    
    if (habitsToCheck.length === 0) return 0;
    
    const completed = habitsToCheck.filter(h => 
      h.logs.some(l => l.date === dateStr && l.value >= h.target_value)
    ).length;
    
    return completed / habitsToCheck.length;
  };

  const getIntensityColor = (completion: number) => {
    if (completion === 0) return 'bg-muted';
    if (completion < 0.25) return 'bg-green-200 dark:bg-green-900';
    if (completion < 0.5) return 'bg-green-300 dark:bg-green-700';
    if (completion < 0.75) return 'bg-green-400 dark:bg-green-600';
    if (completion < 1) return 'bg-green-500 dark:bg-green-500';
    return 'bg-green-600 dark:bg-green-400';
  };

  const totalCompletions = habits.reduce((sum, h) => sum + h.total_completions, 0);
  const avgCompletionRate = habits.length > 0
    ? Math.round(habits.reduce((sum, h) => sum + h.completion_rate, 0) / habits.length)
    : 0;
  const bestStreak = Math.max(...habits.map(h => h.best_streak), 0);
  const currentStreak = Math.max(...habits.map(h => h.current_streak), 0);

  const weekDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Estadísticas de Hábitos</h1>
          <p className="text-muted-foreground">Analiza tu consistencia y progreso</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedHabit} onValueChange={setSelectedHabit}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {habits.map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
              <SelectItem value="180">6 meses</SelectItem>
              <SelectItem value="365">1 año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats generales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{totalCompletions}</p>
              <p className="text-xs text-muted-foreground">Total completados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-2xl font-bold">{avgCompletionRate}%</p>
              <p className="text-xs text-muted-foreground">Tasa de éxito</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Flame className="h-8 w-8 text-orange-500 mb-2" />
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-xs text-muted-foreground">Racha actual</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{bestStreak}</p>
              <p className="text-xs text-muted-foreground">Mejor racha</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Heatmap estilo GitHub */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Actividad</CardTitle>
          <CardDescription>Tu consistencia en los últimos {timeRange} días</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex gap-1 min-w-fit">
              {/* Días de la semana */}
              <div className="flex flex-col gap-1 mr-2">
                {weekDays.map((day, i) => (
                  <div key={i} className="h-4 w-4 text-xs text-muted-foreground flex items-center justify-center">
                    {i % 2 === 0 ? day : ''}
                  </div>
                ))}
              </div>
              
              {/* Semanas */}
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => {
                    const date = week.find(d => getDay(d) === (dayIndex + 1) % 7);
                    if (!date) {
                      return <div key={dayIndex} className="h-4 w-4" />;
                    }
                    
                    const completion = getCompletionForDay(date, selectedHabit);
                    const isToday = isSameDay(date, new Date());
                    
                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "h-4 w-4 rounded-sm transition-colors cursor-pointer group relative",
                          getIntensityColor(completion),
                          isToday && "ring-2 ring-primary"
                        )}
                        title={`${format(date, 'd MMM yyyy', { locale: es })}: ${Math.round(completion * 100)}%`}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10 pointer-events-none">
                          {format(date, 'd MMM', { locale: es })}: {Math.round(completion * 100)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="flex items-center justify-end gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Menos</span>
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-400" />
            <span className="text-xs text-muted-foreground">Más</span>
          </div>
        </CardContent>
      </Card>

      {/* Detalle por hábito */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Hábito</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No tienes hábitos configurados todavía.
            </p>
          ) : (
            <div className="space-y-6">
              {habits.map(habit => (
                <div key={habit.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{habit.icon || '✓'}</span>
                      <div>
                        <p className="font-medium">{habit.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Racha: {habit.current_streak} días | Mejor: {habit.best_streak} días
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: habit.color }}>
                        {habit.completion_rate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {habit.total_completions} completados
                      </p>
                    </div>
                  </div>
                  <Progress 
                    value={habit.completion_rate} 
                    className="h-2"
                    style={{ 
                      // @ts-ignore
                      '--progress-background': habit.color 
                    } as any}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mejores días */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Días más productivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, index) => {
              const dayDates = dateRange.filter(d => getDay(d) === (index + 1) % 7);
              const avgCompletion = dayDates.length > 0
                ? dayDates.reduce((sum, d) => sum + getCompletionForDay(d, selectedHabit), 0) / dayDates.length
                : 0;
              
              return (
                <div key={day} className="text-center">
                  <div 
                    className={cn(
                      "h-16 rounded-lg flex items-center justify-center mb-2",
                      getIntensityColor(avgCompletion)
                    )}
                  >
                    <span className="text-lg font-bold">{Math.round(avgCompletion * 100)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{day.slice(0, 3)}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
