"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { addExercise, updateExercise, Exercise } from "@/lib/actions/exercises";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const muscleGroups = [
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

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  muscle_group: z.string(),
  equipment: z.string().optional(),
  instructions: z.string().optional(),
  video_url: z.string().optional(),
  is_compound: z.boolean().default(false),
});

interface ExerciseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseToEdit?: Exercise;
}

export function ExerciseForm({ open, onOpenChange, exerciseToEdit }: ExerciseFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: exerciseToEdit
      ? {
          name: exerciseToEdit.name,
          muscle_group: exerciseToEdit.muscle_group,
          equipment: exerciseToEdit.equipment || "",
          instructions: exerciseToEdit.instructions || "",
          video_url: exerciseToEdit.video_url || "",
          is_compound: exerciseToEdit.is_compound,
        }
      : {
          name: "",
          muscle_group: "chest",
          is_compound: false,
        },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const data = {
        name: values.name,
        muscle_group: values.muscle_group as any,
        is_compound: values.is_compound,
        is_custom: true,
        equipment: values.equipment ?? null,
        instructions: values.instructions ?? null,
        video_url: values.video_url ?? null,
      } as const;

      if (exerciseToEdit) {
        await updateExercise(exerciseToEdit.id, data as any);
        toast({ title: "Ejercicio actualizado" });
      } else {
        await addExercise(data as any);
        toast({ title: "Ejercicio añadido" });
        form.reset();
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al guardar el ejercicio.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-full sm:max-w-[500px] sm:ml-auto sm:right-0 sm:inset-y-0 rounded-t-[20px] sm:rounded-none">
        <SheetHeader>
          <SheetTitle>{exerciseToEdit ? "Editar ejercicio" : "Añadir ejercicio"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Press de Banca" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="muscle_group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grupo Muscular</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {muscleGroups.map((group) => (
                        <SelectItem key={group.value} value={group.value}>
                          {group.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipamiento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Barra, Mancuernas..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_compound"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Ejercicio Compuesto</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <SheetFooter className="pb-safe">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Guardando..." : "Guardar Ejercicio"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}