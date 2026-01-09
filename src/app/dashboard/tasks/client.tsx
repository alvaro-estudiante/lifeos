"use client";

import { Task } from "@/lib/actions/tasks";
import { TaskItem } from "@/components/productivity/TaskItem";
import { TaskForm } from "@/components/productivity/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Search, ListTodo } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TaskPageClientProps {
  initialTasks: Task[];
}

export function TaskPageClient({ initialTasks }: TaskPageClientProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTasks = initialTasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tareas</h1>
        <Button onClick={() => setIsAddOpen(true)} size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
        </Button>
      </div>

      {/* Search - full width on mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          className="pl-10 h-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tabs - scrollable on mobile */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex">
          <TabsTrigger value="pending" className="text-xs sm:text-sm">
            Pendientes <span className="ml-1 text-muted-foreground">({pendingTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm">
            Hechas <span className="ml-1 text-muted-foreground">({completedTasks.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="text-xs sm:text-sm">
            Todas <span className="ml-1 text-muted-foreground">({filteredTasks.length})</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-2 mt-4">
          {pendingTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {pendingTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ListTodo className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">No hay tareas pendientes</p>
              <p className="text-sm mt-1">¡Buen trabajo! 🎉</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-2 mt-4">
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {completedTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay tareas completadas aún</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p>No se encontraron tareas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TaskForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}
