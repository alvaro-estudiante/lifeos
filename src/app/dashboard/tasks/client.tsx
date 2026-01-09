"use client";

import { Task } from "@/lib/actions/tasks";
import { TaskItem } from "@/components/productivity/TaskItem";
import { TaskForm } from "@/components/productivity/TaskForm";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nueva Tarea
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">Pendientes ({pendingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completadas ({completedTasks.length})</TabsTrigger>
          <TabsTrigger value="all">Todas ({filteredTasks.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-2 mt-4">
          {pendingTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {pendingTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay tareas pendientes.</div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-2 mt-4">
          {completedTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
          {completedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No hay tareas completadas.</div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-2 mt-4">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>

      <TaskForm open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}