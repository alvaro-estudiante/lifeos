'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { format, subDays, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DayData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  target: number;
}

export default function NutritionHistoryPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    loadWeekData();
  }, [currentDate]);

  const loadWeekData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/nutrition/history?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`);
      if (response.ok) {
        const data = await response.json();
        setWeekData(data);
        const today = data.find((d: DayData) => isSameDay(new Date(d.date), new Date()));
        setSelectedDay(today || data[data.length - 1] || null);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
    setLoading(false);
  };

  const previousWeek = () => setCurrentDate(subDays(currentDate, 7));
  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const getCalorieColor = (calories: number, target: number) => {
    const percentage = (calories / target) * 100;
    if (percentage < 70) return 'bg-yellow-500';
    if (percentage <= 110) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getBarHeight = (calories: number, target: number) => {
    const percentage = Math.min((calories / target) * 100, 150);
    return `${percentage}%`;
  };

  const weekTotal = weekData.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const avgCalories = weekData.length > 0 ? Math.round(weekTotal.calories / weekData.length) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historial Nutricional</h1>
        <p className="text-muted-foreground">Revisa tu progreso de alimentación</p>
      </div>

      {/* Navegación de semana */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={previousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium">
          {format(weekStart, "d MMM", { locale: es })} - {format(weekEnd, "d MMM yyyy", { locale: es })}
        </span>
        <Button variant="outline" size="icon" onClick={nextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Gráfico de barras semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Calorías Semanales</CardTitle>
          <CardDescription>Promedio: {avgCalories} kcal/día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-48">
            {daysOfWeek.map((day) => {
              const dayData = weekData.find(d => isSameDay(new Date(d.date), day));
              const calories = dayData?.calories || 0;
              const target = dayData?.target || 2000;
              const isSelected = selectedDay && isSameDay(new Date(selectedDay.date), day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className="flex-1 flex flex-col items-center gap-2 cursor-pointer"
                  onClick={() => dayData && setSelectedDay(dayData)}
                >
                  <div className="relative w-full h-36 bg-muted rounded-t-md overflow-hidden">
                    <div
                      className={cn(
                        "absolute bottom-0 w-full transition-all rounded-t-md",
                        getCalorieColor(calories, target),
                        isSelected && "ring-2 ring-primary ring-offset-2"
                      )}
                      style={{ height: getBarHeight(calories, target) }}
                    />
                    {/* Línea de objetivo */}
                    <div 
                      className="absolute w-full border-t-2 border-dashed border-foreground/30"
                      style={{ bottom: '66.67%' }}
                    />
                  </div>
                  <div className="text-center">
                    <p className={cn(
                      "text-xs font-medium",
                      isToday && "text-primary",
                      isSelected && "underline"
                    )}>
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <p className="text-xs text-muted-foreground">{calories}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle del día seleccionado */}
      {selectedDay && (
        <Card>
          <CardHeader>
            <CardTitle>
              {format(new Date(selectedDay.date), "EEEE d 'de' MMMM", { locale: es })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10">
                <Flame className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedDay.calories}</p>
                  <p className="text-xs text-muted-foreground">/ {selectedDay.target} kcal</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10">
                <Beef className="h-8 w-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedDay.protein}g</p>
                  <p className="text-xs text-muted-foreground">Proteína</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10">
                <Wheat className="h-8 w-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedDay.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbohidratos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10">
                <Droplets className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{selectedDay.fat}g</p>
                  <p className="text-xs text-muted-foreground">Grasas</p>
                </div>
              </div>
            </div>

            {/* Barra de progreso de calorías */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso del día</span>
                <span>{Math.round((selectedDay.calories / selectedDay.target) * 100)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all rounded-full",
                    getCalorieColor(selectedDay.calories, selectedDay.target)
                  )}
                  style={{ width: `${Math.min((selectedDay.calories / selectedDay.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen semanal */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-orange-500">{weekTotal.calories.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Calorías totales</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-500">{weekTotal.protein}g</p>
              <p className="text-sm text-muted-foreground">Proteína total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-500">{weekTotal.carbs}g</p>
              <p className="text-sm text-muted-foreground">Carbohidratos total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-500">{weekTotal.fat}g</p>
              <p className="text-sm text-muted-foreground">Grasas total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
