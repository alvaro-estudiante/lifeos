"use client";

import { Routine, deleteRoutine, setActiveRoutine } from "@/lib/actions/routines";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import Link from "next/link";

interface RoutineCardProps {
  routine: Routine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("¿Estás seguro de eliminar esta rutina?")) return;
    setLoading(true);
    try {
      await deleteRoutine(routine.id);
      toast({ title: "Rutina eliminada" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await setActiveRoutine(routine.id);
      toast({ title: "Rutina activada" });
    } catch {
      toast({
        variant: "destructive",
        title: "Error al activar",
      });
    } finally {
      setLoading(false);
    }
  };

  const exerciseCount = Array.isArray(routine.exercises) ? routine.exercises.length : 0;

  return (
    <Link href={`/fitness/routines/${routine.id}`}>
      <Card className={`hover:bg-muted/50 transition-colors cursor-pointer h-full flex flex-col ${routine.is_active ? "border-primary" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{routine.name}</CardTitle>
              <CardDescription>{routine.type} • {routine.days_per_week} días/sem</CardDescription>
            </div>
            {routine.is_active && (
              <Badge variant="default">Activa</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {routine.description || "Sin descripción"}
          </p>
          <p className="text-sm font-medium mt-2">
            {exerciseCount} Ejercicios
          </p>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 pt-2">
          <div className="flex gap-1">
            {!routine.is_active && (
              <Button variant="ghost" size="sm" onClick={handleActivate} disabled={loading} title="Activar rutina">
                <CheckCircle className="h-4 w-4 mr-1" /> Activar
              </Button>
            )}
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={handleDelete} disabled={loading}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}