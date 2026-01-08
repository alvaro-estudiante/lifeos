"use client";

import { Task } from "@/lib/actions/tasks";
import { Habit } from "@/lib/actions/habits";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DayTimelineProps {
  tasks: Task[];
  habits: Habit[];
  date: string;
}

export function DayTimeline({ tasks, habits, date }: DayTimelineProps) {
  // Sort tasks by time, tasks without time go to "Any time" section or bottom
  const tasksWithTime = tasks.filter(t => t.due_time).sort((a, b) => (a.due_time! > b.due_time! ? 1 : -1));
  const tasksWithoutTime = tasks.filter(t => !t.due_time);

  // Generate hours for timeline (e.g. 6AM to 11PM)
  const hours = Array.from({ length: 18 }, (_, i) => i + 6);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex-1 bg-muted/10 rounded-lg border p-4">
        <h3 className="font-semibold mb-4">Agenda</h3>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {hours.map((hour) => {
              const hourTasks = tasksWithTime.filter(t => {
                const taskHour = parseInt(t.due_time!.split(':')[0]);
                return taskHour === hour;
              });

              return (
                <div key={hour} className="flex gap-4 relative">
                  <div className="w-12 text-sm text-muted-foreground text-right pt-1">
                    {hour}:00
                  </div>
                  <div className="flex-1 border-t pt-1 min-h-[60px]">
                    {hourTasks.map((task) => (
                      <Card key={task.id} className={`mb-2 ${task.status === 'completed' ? 'opacity-50' : ''}`}>
                        <CardContent className="p-3 flex items-start gap-2">
                          {task.status === 'completed' ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-1" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mt-1" />
                          )}
                          <div>
                            <div className={`text-sm font-medium ${task.status === 'completed' ? 'line-through' : ''}`}>
                              {task.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {task.due_time} • {task.priority}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="bg-muted/10 rounded-lg border p-4">
        <h3 className="font-semibold mb-2">Otras Tareas</h3>
        <div className="space-y-2">
          {tasksWithoutTime.map((task) => (
            <div key={task.id} className="flex items-center gap-2 text-sm p-2 bg-card rounded-md border">
              {task.status === 'completed' ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                {task.title}
              </span>
              {task.priority === 'urgent' && (
                <Badge variant="destructive" className="ml-auto text-[10px] h-5">Urgente</Badge>
              )}
            </div>
          ))}
          {tasksWithoutTime.length === 0 && (
            <p className="text-xs text-muted-foreground">No hay tareas sin hora.</p>
          )}
        </div>
      </div>
    </div>
  );
}