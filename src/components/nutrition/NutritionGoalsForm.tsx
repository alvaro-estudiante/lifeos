"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { updateNutritionGoals, NutritionGoals } from "@/lib/actions/nutrition-goals";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const formSchema = z.object({
  calories_target: z.coerce.number().min(500, "Mínimo 500 kcal"),
  protein_g: z.coerce.number().min(0),
  carbs_g: z.coerce.number().min(0),
  fat_g: z.coerce.number().min(0),
  fiber_g: z.coerce.number().min(0),
  water_ml: z.coerce.number().min(0),
});

interface NutritionGoalsFormProps {
  initialData?: NutritionGoals | null;
}

export function NutritionGoalsForm({ initialData }: NutritionGoalsFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      calories_target: initialData?.calories_target || 2000,
      protein_g: initialData?.protein_g || 150,
      carbs_g: initialData?.carbs_g || 200,
      fat_g: initialData?.fat_g || 60,
      fiber_g: initialData?.fiber_g || 30,
      water_ml: initialData?.water_ml || 2000,
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await updateNutritionGoals(values);
      toast({ title: "Objetivos actualizados" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar",
        description: "Inténtalo de nuevo",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Objetivos Diarios</CardTitle>
        <CardDescription>
          Define tus metas de macronutrientes y calorías.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="calories_target"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calorías (kcal)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="protein_g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proteína (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbs_g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbohidratos (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fat_g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grasa (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fiber_g"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fibra (g)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="water_ml"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agua (ml)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Objetivos"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}