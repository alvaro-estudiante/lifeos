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
import { createHabit, updateHabit, Habit } from "@/lib/actions/habits";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "El nombre es obligatorio"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  target_value: z.coerce.number().min(1, "Mínimo 1"),
  unit: z.string().optional(),
  color: z.string().default("#3b82f6"),
  icon: z.string().optional(),
});

interface HabitFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitToEdit?: Habit;
}

const colors = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ec4899", // pink
];

const icons = ["💧", "📖", "🏃", "🧘", "🥗", "💊", "💤", "💻", "🧹", "🎨"];

export function HabitForm({ open, onOpenChange, habitToEdit }: HabitFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: habitToEdit
      ? {
          name: habitToEdit.name,
          description: habitToEdit.description || "",
          frequency: habitToEdit.frequency,
          target_value: habitToEdit.target_value,
          unit: habitToEdit.unit || "",
          color: habitToEdit.color,
          icon: habitToEdit.icon || "✨",
        }
      : {
          name: "",
          frequency: "daily",
          target_value: 1,
          unit: "veces",
          color: "#3b82f6",
          icon: "✨",
        },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (habitToEdit) {
        await updateHabit(habitToEdit.id, values);
        toast({ title: "Hábito actualizado" });
      } else {
        await createHabit(values as any); // Cast needed due to simplified schema
        toast({ title: "Hábito creado" });
        form.reset();
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-full sm:max-w-[500px] sm:ml-auto sm:right-0 sm:inset-y-0 rounded-t-[20px] sm:rounded-none">
        <SheetHeader>
          <SheetTitle>{habitToEdit ? "Editar Hábito" : "Nuevo Hábito"}</SheetTitle>
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
                    <Input placeholder="Ej. Beber agua" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="target_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objetivo Diario</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <FormControl>
                      <Input placeholder="vasos, min..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <div
                          key={color}
                          className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${field.value === color ? 'scale-125 ring-2 ring-offset-2 ring-primary' : ''}`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icono</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Icono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {icons.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="pb-safe">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Guardando..." : "Guardar Hábito"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}