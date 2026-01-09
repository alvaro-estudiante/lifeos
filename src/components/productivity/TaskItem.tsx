"use client";

import { Task, completeTask, deleteTask } from "@/lib/actions/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Calendar, Clock, Check, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskForm } from "./TaskForm";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskItemProps {
  task: Task;
}

const priorityConfig = {
  low: { color: "bg-slate-500", label: "Baja" },
  medium: { color: "bg-blue-500", label: "Media" },
  high: { color: "bg-orange-500", label: "Alta" },
  urgent: { color: "bg-red-500", label: "Urgente" },
};

export function TaskItem({ task }: TaskItemProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(task.status === "completed");

  const handleComplete = async () => {
    setIsCompleted(true);
    try {
      await completeTask(task.id);
      toast({ title: "✅ Tarea completada" });
    } catch {
      setIsCompleted(false);
      toast({ variant: "destructive", title: "Error al completar" });
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deleteTask(task.id);
      toast({ title: "Tarea eliminada" });
    } catch {
      toast({ variant: "destructive", title: "Error al eliminar" });
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
  const priority = priorityConfig[task.priority];

  return (
    <>
      <div 
        className={cn(
          "flex items-center gap-3 p-3 bg-card border rounded-xl transition-all",
          isCompleted ? "opacity-50" : "active:scale-[0.99]"
        )}
      >
        {/* Checkbox */}
        <button
          onClick={handleComplete}
          disabled={isCompleted}
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
            isCompleted 
              ? "bg-primary border-primary" 
              : "border-muted-foreground/30 hover:border-primary hover:bg-primary/10"
          )}
        >
          {isCompleted && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
        </button>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className={cn(
              "font-medium text-sm truncate flex-1",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {task.title}
            </span>
            
            {/* Priority dot */}
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", priority.color)} />
          </div>
          
          {/* Meta info */}
          <div className="flex items-center gap-2 mt-1">
            {task.due_date && (
              <div className={cn(
                "flex items-center gap-1 text-[10px]",
                isOverdue ? "text-red-500 font-medium" : "text-muted-foreground"
              )}>
                <Calendar className="h-3 w-3" />
                {format(new Date(task.due_date), "d MMM", { locale: es })}
              </div>
            )}
            {task.due_time && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.due_time}
              </div>
            )}
            {task.category && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {task.category}
              </span>
            )}
          </div>
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete} 
              disabled={loading}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <TaskForm 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        taskToEdit={task} 
      />
    </>
  );
}
