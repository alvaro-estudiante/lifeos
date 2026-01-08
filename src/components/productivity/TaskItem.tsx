"use client";

import { Task, completeTask, deleteTask } from "@/lib/actions/tasks";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "./TaskForm";

interface TaskItemProps {
  task: Task;
}

const priorityColors = {
  low: "bg-slate-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleComplete = async () => {
    try {
      await completeTask(task.id);
      toast({ title: "Tarea completada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al completar" });
    }
  };

  const handleDelete = async () => {
    if (!confirm("¿Eliminar tarea?")) return;
    setLoading(true);
    try {
      await deleteTask(task.id);
      toast({ title: "Tarea eliminada" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`flex items-start gap-3 p-3 bg-card border rounded-lg transition-all ${task.status === 'completed' ? 'opacity-60 bg-muted/50' : 'hover:shadow-sm'}`}>
        <Checkbox 
          checked={task.status === 'completed'} 
          onCheckedChange={handleComplete}
          disabled={task.status === 'completed'}
          className="mt-1"
        />
        
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <span className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </span>
            <Badge className={`${priorityColors[task.priority]} hover:${priorityColors[task.priority]} text-white text-[10px]`}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
            {task.due_date && (
              <div className={`flex items-center gap-1 ${new Date(task.due_date) < new Date() && task.status !== 'completed' ? 'text-red-500' : ''}`}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "d MMM", { locale: es })}
              </div>
            )}
            {task.due_time && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.due_time}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <TaskForm 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        taskToEdit={task} 
      />
    </>
  );
}