'use client';

import { WorkoutSet, addSet, updateSet, deleteSet } from "@/lib/actions/workouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, CheckCircle2, Plus, Minus, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface WorkoutExerciseInputProps {
  workoutExerciseId: string;
  sets: WorkoutSet[];
}

export function WorkoutExerciseInput({ workoutExerciseId, sets }: WorkoutExerciseInputProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Initialize with reasonable defaults or last set
  const lastSet = sets[sets.length - 1];
  const [weight, setWeight] = useState<number>(lastSet?.weight_kg || 0);
  const [reps, setReps] = useState<number>(lastSet?.reps || 0);
  const [rpe, setRpe] = useState<number>(lastSet?.rpe || 8);
  const [weightIncrement, setWeightIncrement] = useState(2.5);

  // Update local state when sets change (e.g. initial load or add)
  useEffect(() => {
    if (lastSet) {
        setWeight(lastSet.weight_kg || 0);
        setReps(lastSet.reps || 0);
        setRpe(lastSet.rpe || 8);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sets.length]); // Only update when number of sets changes to avoid overwriting user input while editing

  const handleAddSet = async () => {
    setLoading(true);
    try {
      await addSet(workoutExerciseId, {
        weight_kg: weight,
        reps: reps,
        rpe: rpe,
      });
      
      // Values are kept for next set ease of entry
      toast({ title: "Serie añadida" });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al añadir serie" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSet = async (setId: string, data: Partial<WorkoutSet>) => {
    try {
      await updateSet(setId, data);
    } catch (error) {
      toast({ variant: "destructive", title: "Error al actualizar" });
    }
  };

  const handleDeleteSet = async (setId: string) => {
    try {
      await deleteSet(setId);
    } catch (error) {
      toast({ variant: "destructive", title: "Error al eliminar" });
    }
  };

  const copyLastSet = () => {
      if (lastSet) {
          setWeight(lastSet.weight_kg || 0);
          setReps(lastSet.reps || 0);
          setRpe(lastSet.rpe || 8);
          toast({ title: "Valores copiados" });
      }
  }

  return (
    <div className="space-y-6">
      {/* Existing Sets List */}
      <div className="space-y-2">
        {sets.length > 0 && (
          <div className="grid grid-cols-10 gap-2 text-xs text-muted-foreground text-center mb-2 px-2">
            <div className="col-span-1">#</div>
            <div className="col-span-3">Kg</div>
            <div className="col-span-2">Reps</div>
            <div className="col-span-2">RPE</div>
            <div className="col-span-2"></div>
          </div>
        )}
        
        {sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-10 gap-2 items-center px-2 py-2 bg-muted/30 rounded-md border text-sm">
            <div className="col-span-1 text-center font-medium text-muted-foreground">{index + 1}</div>
            <div className="col-span-3 font-medium text-center">
              {set.weight_kg} kg
            </div>
            <div className="col-span-2 text-center">
              {set.reps}
            </div>
            <div className="col-span-2 text-center">
              {set.rpe}
            </div>
            <div className="col-span-2 flex justify-end">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => handleDeleteSet(set.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Nueva Serie</div>
            {lastSet && (
                <Button variant="ghost" size="sm" onClick={copyLastSet} className="h-8 text-xs">
                    <Copy className="mr-1 h-3 w-3" />
                    Copiar anterior
                </Button>
            )}
        </div>

        {/* Weight Input */}
        <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>Peso (kg)</span>
                <div className="flex gap-1">
                    {[2.5, 5, 10].map(inc => (
                        <button
                            key={inc}
                            onClick={() => setWeightIncrement(inc)}
                            className={`px-1.5 rounded ${weightIncrement === inc ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                        >
                            ±{inc}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full shrink-0"
                    onClick={() => setWeight(w => Math.max(0, w - weightIncrement))}
                >
                    <Minus className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <Input 
                        type="number" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value))}
                        className="h-12 text-center text-xl font-bold" 
                    />
                </div>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-12 w-12 rounded-full shrink-0"
                    onClick={() => setWeight(w => w + weightIncrement)}
                >
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            {/* Reps Input */}
            <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Repeticiones</span>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full shrink-0"
                        onClick={() => setReps(r => Math.max(0, r - 1))}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 bg-muted/30 rounded-md h-12 flex items-center justify-center text-xl font-bold">
                        {reps}
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full shrink-0"
                        onClick={() => setReps(r => r + 1)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* RPE Input */}
            <div className="space-y-2">
                <span className="text-xs text-muted-foreground">RPE (Esfuerzo)</span>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full shrink-0"
                        onClick={() => setRpe(r => Math.max(1, r - 1))}
                    >
                        <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex-1 bg-muted/30 rounded-md h-12 flex items-center justify-center text-xl font-bold">
                        {rpe}
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-12 w-12 rounded-full shrink-0"
                        onClick={() => setRpe(r => Math.min(10, r + 1))}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>

        <Button 
            onClick={handleAddSet} 
            disabled={loading}
            className="w-full h-12 text-lg"
            size="lg"
        >
            <CheckCircle2 className="mr-2 h-5 w-5" /> 
            Guardar Serie
        </Button>
      </div>
    </div>
  );
}