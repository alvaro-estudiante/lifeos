'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, Download, Calendar, TrendingUp, TrendingDown,
  Flame, Dumbbell, CheckSquare, Target, Award, Loader2
} from 'lucide-react';
import { format, subDays, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeeklyReport {
  period: { start: string; end: string };
  nutrition: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    targetCalories: number;
    adherence: number;
  };
  fitness: {
    workouts: number;
    totalVolume: number;
    avgDuration: number;
    muscleGroups: { name: string; volume: number }[];
  };
  tasks: {
    completed: number;
    created: number;
    completionRate: number;
  };
  habits: {
    avgCompletionRate: number;
    bestHabit: { name: string; rate: number } | null;
    worstHabit: { name: string; rate: number } | null;
  };
  highlights: string[];
  improvements: string[];
}

export default function ReportsPage() {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('0'); // 0 = esta semana, 1 = semana pasada, etc.
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [selectedWeek]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const weeksAgo = parseInt(selectedWeek);
      const weekStart = startOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subWeeks(new Date(), weeksAgo), { weekStartsOn: 1 });
      
      const response = await fetch(
        `/api/reports/weekly?start=${format(weekStart, 'yyyy-MM-dd')}&end=${format(weekEnd, 'yyyy-MM-dd')}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    }
    setLoading(false);
  };

  const exportToPDF = async () => {
    setExporting(true);
    // Simular exportación
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // En una implementación real, generarías el PDF aquí
    alert('Función de exportación a PDF próximamente disponible');
    setExporting(false);
  };

  const weeks = [
    { value: '0', label: 'Esta semana' },
    { value: '1', label: 'Semana pasada' },
    { value: '2', label: 'Hace 2 semanas' },
    { value: '3', label: 'Hace 3 semanas' },
    { value: '4', label: 'Hace 4 semanas' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Resumen semanal de tu progreso</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {weeks.map(week => (
                <SelectItem key={week.value} value={week.value}>
                  {week.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportToPDF} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
        </div>
      </div>

      {report && (
        <>
          {/* Período */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-2 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                <span>Reporte semanal:</span>
                <span className="font-bold">
                  {format(new Date(report.period.start), "d 'de' MMMM", { locale: es })} - {format(new Date(report.period.end), "d 'de' MMMM yyyy", { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Resumen rápido */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <Flame className="h-8 w-8 mx-auto text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{report.nutrition.avgCalories}</p>
                <p className="text-xs text-muted-foreground">kcal/día promedio</p>
                <p className={`text-xs mt-1 ${report.nutrition.adherence >= 80 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {report.nutrition.adherence}% adherencia
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Dumbbell className="h-8 w-8 mx-auto text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{report.fitness.workouts}</p>
                <p className="text-xs text-muted-foreground">entrenamientos</p>
                <p className="text-xs mt-1 text-muted-foreground">
                  {(report.fitness.totalVolume / 1000).toFixed(1)}k kg volumen
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <CheckSquare className="h-8 w-8 mx-auto text-green-500 mb-2" />
                <p className="text-2xl font-bold">{report.tasks.completed}</p>
                <p className="text-xs text-muted-foreground">tareas completadas</p>
                <p className={`text-xs mt-1 ${report.tasks.completionRate >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {report.tasks.completionRate}% completado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="h-8 w-8 mx-auto text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{report.habits.avgCompletionRate}%</p>
                <p className="text-xs text-muted-foreground">hábitos cumplidos</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="nutrition" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="nutrition">Nutrición</TabsTrigger>
              <TabsTrigger value="fitness">Fitness</TabsTrigger>
              <TabsTrigger value="productivity">Productividad</TabsTrigger>
              <TabsTrigger value="summary">Resumen</TabsTrigger>
            </TabsList>

            <TabsContent value="nutrition">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Nutricional</CardTitle>
                  <CardDescription>Promedios diarios de la semana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calorías</span>
                      <span>{report.nutrition.avgCalories} / {report.nutrition.targetCalories} kcal</span>
                    </div>
                    <Progress value={(report.nutrition.avgCalories / report.nutrition.targetCalories) * 100} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-500/10 rounded-lg">
                      <p className="text-2xl font-bold">{report.nutrition.avgProtein}g</p>
                      <p className="text-xs text-muted-foreground">Proteína/día</p>
                    </div>
                    <div className="text-center p-4 bg-amber-500/10 rounded-lg">
                      <p className="text-2xl font-bold">{report.nutrition.avgCarbs}g</p>
                      <p className="text-xs text-muted-foreground">Carbohidratos/día</p>
                    </div>
                    <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                      <p className="text-2xl font-bold">{report.nutrition.avgFat}g</p>
                      <p className="text-xs text-muted-foreground">Grasas/día</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fitness">
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Fitness</CardTitle>
                  <CardDescription>Tu actividad física de la semana</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{report.fitness.workouts}</p>
                      <p className="text-xs text-muted-foreground">Sesiones</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{report.fitness.avgDuration}</p>
                      <p className="text-xs text-muted-foreground">Min promedio</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{(report.fitness.totalVolume / 1000).toFixed(1)}k</p>
                      <p className="text-xs text-muted-foreground">Kg totales</p>
                    </div>
                  </div>

                  {report.fitness.muscleGroups.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Volumen por grupo muscular</h4>
                      <div className="space-y-2">
                        {report.fitness.muscleGroups.map(mg => (
                          <div key={mg.name} className="flex items-center gap-2">
                            <span className="w-24 text-sm capitalize">{mg.name}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full"
                                style={{ 
                                  width: `${(mg.volume / Math.max(...report.fitness.muscleGroups.map(m => m.volume))) * 100}%` 
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground w-16 text-right">
                              {(mg.volume / 1000).toFixed(1)}k
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="productivity">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Tareas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Completadas</span>
                      <span className="text-2xl font-bold text-green-500">{report.tasks.completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Creadas</span>
                      <span className="text-2xl font-bold">{report.tasks.created}</span>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Tasa de completado</span>
                        <span>{report.tasks.completionRate}%</span>
                      </div>
                      <Progress value={report.tasks.completionRate} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Hábitos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-3xl font-bold">{report.habits.avgCompletionRate}%</p>
                      <p className="text-sm text-muted-foreground">Tasa de cumplimiento</p>
                    </div>
                    
                    {report.habits.bestHabit && (
                      <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">{report.habits.bestHabit.name}</p>
                          <p className="text-xs text-muted-foreground">Mejor hábito: {report.habits.bestHabit.rate}%</p>
                        </div>
                      </div>
                    )}
                    
                    {report.habits.worstHabit && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                        <TrendingDown className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">{report.habits.worstHabit.name}</p>
                          <p className="text-xs text-muted-foreground">Para mejorar: {report.habits.worstHabit.rate}%</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      Logros de la semana
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Áreas de mejora
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {report.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-yellow-500">→</span>
                          <span>{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
