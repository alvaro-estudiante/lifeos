"use client";

import { Task, completeTask } from "@/lib/actions/tasks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CalendarDays, ChevronRight, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "@/components/productivity/TaskForm";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DayOrganizerProps {
  tasks: Task[];
}

const priorityColors = {
  low: "bg-slate-400",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function DayOrganizer({ tasks }: DayOrganizerProps) {
  const { toast } = useToast();
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [localTasks, setLocalTasks] = useState(tasks);

  const handleComplete = async (taskId: string) => {
    // Optimistic update
    setLocalTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: "completed" as const } : t
    ));
    
    try {
      await completeTask(taskId);
      toast({ title: "✅ Completada" });
    } catch {
      setLocalTasks(tasks);
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const pendingTasks = localTasks
    .filter(t => t.status !== "completed")
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
  const completedTasks = localTasks.filter(t => t.status === "completed");

  return (
    <Card>
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold">Mi Día</span>
            {pendingTasks.length > 0 && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                {pendingTasks.length}
              </span>
            )}
          </div>
          <Link 
            href="/dashboard/tasks"
            className="text-[11px] text-primary flex items-center gap-0.5 hover:underline whitespace-nowrap"
          >
            Ver <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      
      <CardContent className="px-3 pb-3 pt-1">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {pendingTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-2 p-2 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => handleComplete(task.id)}
                    className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-colors"
                  >
                    <Check className="h-3 w-3 text-transparent group-hover:text-primary transition-colors" />
                  </button>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.due_time && (
                      <p className="text-[10px] text-muted-foreground">{task.due_time}</p>
                    )}
                  </div>
                  
                  {/* Priority indicator */}
                  <div className={cn("w-2 h-2 rounded-full flex-shrink-0", priorityColors[task.priority])} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {pendingTasks.length > 5 && (
              <Link 
                href="/dashboard/tasks"
                className="block text-center text-[11px] text-muted-foreground py-1 hover:text-primary"
              >
                +{pendingTasks.length - 5} más
              </Link>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-2xl mb-2">🎉</div>
            <p className="text-sm font-medium">¡Todo listo!</p>
            <p className="text-xs text-muted-foreground mt-0.5">No tienes tareas pendientes</p>
          </div>
        )}

        {/* Add Task Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 h-9 text-xs"
          onClick={() => setIsTaskFormOpen(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Añadir tarea
        </Button>

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">
              Hechas ({completedTasks.length})
            </p>
            <div className="space-y-0.5">
              {completedTasks.slice(0, 2).map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-xs text-muted-foreground py-0.5">
                  <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                  <span className="line-through truncate">{task.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <TaskForm 
        open={isTaskFormOpen} 
        onOpenChange={setIsTaskFormOpen} 
        taskToEdit={undefined}
      />
    </Card>
  );
}
