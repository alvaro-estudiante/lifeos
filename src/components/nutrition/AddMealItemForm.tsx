"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addMealItem, MealType } from "@/lib/actions/meals";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  food_name: z.string().min(2, "Nombre requerido"),
  quantity: z.coerce.number().min(1, "Cantidad requerida"),
  unit: z.string().default("g"),
  calories: z.coerce.number(),
  protein: z.coerce.number(),
  carbs: z.coerce.number(),
  fat: z.coerce.number(),
  fiber: z.coerce.number(),
});

interface AddMealItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  mealType: MealType;
}

export function AddMealItemForm({
  open,
  onOpenChange,
  date,
  mealType,
}: AddMealItemFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      food_name: "",
      quantity: 100,
      unit: "g",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
  });

  // Store 100g values to recalculate on quantity change
  const [baseNutrition, setBaseNutrition] = useState<any>(null);

  const searchNutrition = async () => {
    const foodName = form.getValues("food_name");
    if (!foodName || foodName.length < 2) {
      toast({ title: "Escribe al menos 2 caracteres", variant: "destructive" });
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/nutrition/lookup?food=${encodeURIComponent(foodName)}`
      );
      if (response.ok) {
        const data = await response.json();
        setBaseNutrition(data);
        
        // Calculate for current quantity
        const quantity = form.getValues("quantity");
        updateMacros(data, quantity);
        
        toast({ title: "Datos nutricionales encontrados" });
      } else {
        toast({
          title: "No encontrado",
          description: "Introduce los valores manualmente",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({ title: "Error al buscar", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const updateMacros = (baseData: any, quantity: number) => {
    if (!baseData) return;
    const ratio = quantity / 100;
    form.setValue("calories", Math.round(baseData.calories_per_100g * ratio));
    form.setValue("protein", Math.round(baseData.protein_per_100g * ratio * 10) / 10);
    form.setValue("carbs", Math.round(baseData.carbs_per_100g * ratio * 10) / 10);
    form.setValue("fat", Math.round(baseData.fat_per_100g * ratio * 10) / 10);
    form.setValue("fiber", Math.round(baseData.fiber_per_100g * ratio * 10) / 10);
  };

  const onQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qty = parseFloat(e.target.value);
    if (!isNaN(qty) && baseNutrition) {
      updateMacros(baseNutrition, qty);
    }
    form.setValue("quantity", qty); // Update form value
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      await addMealItem(date, mealType, values);
      toast({ title: "Alimento añadido" });
      form.reset();
      setBaseNutrition(null);
      onOpenChange(false);
      router.refresh();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir a {mealType === "breakfast" ? "Desayuno" : mealType === "lunch" ? "Almuerzo" : mealType === "dinner" ? "Cena" : "Snack"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="food_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alimento</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ej. Manzana" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={searchNutrition}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad (g/ml)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => {
                          field.onChange(e);
                          onQuantityChange(e);
                        }}
                      />
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
                      <Input {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kcal</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prot</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grasa</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fiber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fibra</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Añadir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}