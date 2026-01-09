'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle2 } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  due_date: string;
  due_time: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  category: string | null;
}

export default function TasksCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    loadTasks();
  }, [currentMonth]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const start = format(calendarStart, 'yyyy-MM-dd');
      const end = format(calendarEnd, 'yyyy-MM-dd');
      const response = await fetch(`/api/tasks/calendar?start=${start}&end=${end}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
    setLoading(false);
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getTasksForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter(t => t.due_date === dateStr);
  };

  const selectedDayTasks = selectedDate ? getTasksForDay(selectedDate) : [];

  const priorityColors = {
    low: 'bg-slate-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };

  const priorityLabels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    urgent: 'Urgente',
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendario de Tareas</h1>
          <p className="text-muted-foreground">Vista mensual de tus tareas programadas</p>
        </div>
        <Link href="/dashboard/tasks">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Tarea
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg capitalize">
                  {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={goToToday}>
                  Hoy
                </Button>
              </div>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Header días de la semana */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayTasks = getTasksForDay(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isDayToday = isToday(day);
                const completedCount = dayTasks.filter(t => t.status === 'completed').length;
                const pendingCount = dayTasks.filter(t => t.status !== 'completed').length;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      isSelected && "ring-2 ring-primary",
                      isDayToday && "bg-primary/10",
                      "hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isDayToday && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    {dayTasks.length > 0 && (
                      <div className="space-y-1">
                        {/* Mostrar primeras 2 tareas */}
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={cn(
                              "text-xs p-1 rounded truncate",
                              task.status === 'completed' 
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400 line-through'
                                : priorityColors[task.priority] + '/20'
                            )}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayTasks.length - 2} más
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Panel lateral - Tareas del día seleccionado */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate 
                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                : 'Selecciona un día'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay tareas para este día</p>
                <Link href="/dashboard/tasks">
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir tarea
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg border transition-colors",
                      task.status === 'completed' && "bg-green-500/10 border-green-500/30"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1 w-3 h-3 rounded-full flex-shrink-0",
                        task.status === 'completed' ? 'bg-green-500' : priorityColors[task.priority]
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "font-medium",
                          task.status === 'completed' && "line-through text-muted-foreground"
                        )}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {task.due_time && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.due_time.slice(0, 5)}
                            </span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {priorityLabels[task.priority]}
                          </Badge>
                          {task.category && (
                            <Badge variant="secondary" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {task.status === 'completed' && (
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leyenda */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(priorityLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", priorityColors[key as keyof typeof priorityColors])} />
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Completada</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
