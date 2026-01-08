"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { getExercises, Exercise } from "@/lib/actions/exercises";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExerciseSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
}

const muscleGroups = [
  { value: "all", label: "Todos" },
  { value: "chest", label: "Pecho" },
  { value: "back", label: "Espalda" },
  { value: "shoulders", label: "Hombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "forearms", label: "Antebrazos" },
  { value: "core", label: "Core" },
  { value: "quadriceps", label: "Cuádriceps" },
  { value: "hamstrings", label: "Isquios" },
  { value: "glutes", label: "Glúteos" },
  { value: "calves", label: "Gemelos" },
  { value: "full_body", label: "Full Body" },
  { value: "cardio", label: "Cardio" },
];

export function ExerciseSelector({ open, onOpenChange, onSelect }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && exercises.length === 0) {
      setLoading(true);
      getExercises().then((data) => {
        setExercises(data);
        setLoading(false);
      });
    }
  }, [open, exercises.length]);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || exercise.muscle_group === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seleccionar Ejercicio</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Grupo" />
            </SelectTrigger>
            <SelectContent>
              {muscleGroups.map((group) => (
                <SelectItem key={group.value} value={group.value}>
                  {group.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando...</div>
          ) : filteredExercises.length > 0 ? (
            filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors"
                onClick={() => {
                  onSelect(exercise);
                  onOpenChange(false);
                }}
              >
                <div>
                  <div className="font-medium">{exercise.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {exercise.muscle_group}
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No se encontraron ejercicios.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}