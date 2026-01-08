"use client";

import { Task, completeTask } from "@/lib/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/productivity/TaskForm";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated";
import { motion, PanInfo } from "framer-motion";
import { Trash2, CheckCircle2 as CheckIcon } from "lucide-react";
import { deleteTask } from "@/lib/actions/tasks";

interface DayOrganizerProps {
  tasks: Task[];
}

const priorityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function DayOrganizer({ tasks }: DayOrganizerProps) {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({ title: "Tarea completada" });
    } catch {
      toast({ variant: "destructive", title: "Error al completar" });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast({ title: "Tarea eliminada" });
    } catch {
      toast({ variant: "destructive", title: "Error al eliminar" });
    }
  };

  const handleDragEnd = (taskId: string, info: PanInfo) => {
    if (info.offset.x > 100) {
      handleComplete(taskId);
    } else if (info.offset.x < -100) {
      handleDelete(taskId);
    }
  };

  // Separate tasks by time and no time
  const tasksWithTime = tasks
    .filter(t => t.due_time && t.status !== "completed")
    .sort((a, b) => (a.due_time! > b.due_time! ? 1 : -1));
    
  const tasksWithoutTime = tasks
    .filter(t => !t.due_time && t.status !== "completed")
    .sort((a, b) => {
      // Sort by priority logic if needed, simple sort for now
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const completedTasks = tasks.filter(t => t.status === "completed");

  return (
    <Card className="h-full border-0 shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
      <CardHeader className="px-0 sm:px-6 flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Mi Día
        </CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setIsTaskFormOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Tarea
        </Button>
      </CardHeader>
      <CardContent className="px-0 sm:px-6">
        <StaggerContainer className="space-y-6">
          {/* Timeline Section */}
          {tasksWithTime.length > 0 && (
            <StaggerItem>
              <div className="relative pl-4 border-l-2 border-muted space-y-6">
                {tasksWithTime.map((task) => (
                  <div key={task.id} className="relative group">
                    {/* Time indicator dot */}
                    <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                    
                    <div className="flex items-start gap-3">
                      <div className="w-12 text-sm font-medium text-muted-foreground pt-0.5">
                        {task.due_time}
                      </div>
                      <div className="flex-1 relative overflow-hidden rounded-xl">
                        {/* Background for Swipe */}
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                          <div className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckIcon size={20} /> Completar
                          </div>
                          <div className="flex items-center gap-2 text-red-600 font-medium">
                            Eliminar <Trash2 size={20} />
                          </div>
                        </div>

                        <motion.div
                          layoutId={task.id}
                          drag="x"
                          dragConstraints={{ left: 0, right: 0 }}
                          onDragEnd={(_, info) => handleDragEnd(task.id, info)}
                          className="relative bg-card border rounded-xl p-3 shadow-sm active:scale-[0.98] transition-transform z-10"
                          whileDrag={{ scale: 1.02 }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => handleComplete(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{task.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-1">
                                  <div className={`w-1.5 h-1.5 rounded-full ${priorityColors[task.priority]}`} />
                                  {task.priority}
                                </Badge>
                                {task.category && (
                                  <span className="text-xs text-muted-foreground">• {task.category}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </StaggerItem>
          )}

          {/* Tasks without time */}
          {(tasksWithoutTime.length > 0 || tasksWithTime.length === 0) && (
            <StaggerItem>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  {tasksWithTime.length > 0 ? "Sin hora:" : "Para hoy:"}
                </div>
                {tasksWithoutTime.map((task) => (
                  <div key={task.id} className="relative overflow-hidden rounded-xl">
                    <div className="absolute inset-0 flex items-center justify-between px-4 bg-muted/20">
                      <div className="flex items-center gap-2 text-green-600 font-medium">
                        <CheckIcon size={20} />
                      </div>
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <Trash2 size={20} />
                      </div>
                    </div>
                    <motion.div
                      layoutId={task.id}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => handleDragEnd(task.id, info)}
                      className="relative flex items-center gap-3 p-3 bg-card border rounded-xl shadow-sm active:scale-[0.98] transition-transform z-10"
                      whileDrag={{ scale: 1.02 }}
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleComplete(task.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{task.title}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} />
                    </motion.div>
                  </div>
                ))}
                {tasksWithoutTime.length === 0 && tasksWithTime.length === 0 && completedTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                    <p>¡Nada pendiente!</p>
                    <Button variant="link" onClick={() => setIsTaskFormOpen(true)}>
                      + Añadir primera tarea
                    </Button>
                  </div>
                )}
              </div>
            </StaggerItem>
          )}

          {/* Completed Tasks (Collapsed/Dimmed) */}
          {completedTasks.length > 0 && (
            <StaggerItem>
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground mb-2">Completadas ({completedTasks.length})</div>
                <div className="space-y-1 opacity-60">
                  {completedTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm p-2">
                      <Checkbox checked disabled />
                      <span className="line-through text-muted-foreground">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
          )}
        </StaggerContainer>
      </CardContent>

      <TaskForm 
        open={isTaskFormOpen} 
        onOpenChange={setIsTaskFormOpen} 
        taskToEdit={undefined}
      />
    </Card>
  );
}