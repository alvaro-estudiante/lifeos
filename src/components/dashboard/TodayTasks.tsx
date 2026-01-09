"use client";

import { Task, createTask, completeTask } from "@/lib/actions/tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckSquare, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface TodayTasksProps {
  tasks: Task[];
}

const priorityColors = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export function TodayTasks({ tasks }: TodayTasksProps) {
  const { toast } = useToast();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const pendingTasks = tasks.filter(t => t.status !== "completed").slice(0, 5);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setLoading(true);
    try {
      await createTask({
        title: newTaskTitle,
        priority: "medium",
        due_date: new Date().toISOString().split("T")[0],
      } as any);
      setNewTaskTitle("");
      toast({ title: "Tarea añadida" });
    } catch {
      toast({ variant: "destructive", title: "Error al añadir" });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId);
      toast({ title: "Tarea completada" });
    } catch {
      toast({ variant: "destructive", title: "Error al completar" });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-orange-500" />
          Tareas de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div className="space-y-2 flex-1">
          {pendingTasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <Checkbox 
                checked={false} 
                onCheckedChange={() => handleComplete(task.id)}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="truncate font-medium text-sm">{task.title}</span>
                  {task.due_time && (
                    <span className="text-xs text-muted-foreground ml-2 shrink-0">
                      {task.due_time}
                    </span>
                  )}
                </div>
              </div>
              <Badge className={`${priorityColors[task.priority]} w-2 h-2 rounded-full p-0 border-0`} />
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              ¡Todo listo por hoy!
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <form onSubmit={handleQuickAdd} className="flex gap-2">
            <Input 
              placeholder="Añadir tarea rápida..." 
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="h-9 text-sm"
            />
            <Button type="submit" size="sm" variant="ghost" disabled={loading || !newTaskTitle.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          <Button asChild variant="link" className="w-full h-auto p-0 text-muted-foreground">
            <Link href="/dashboard/tasks">Ver todas las tareas <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}