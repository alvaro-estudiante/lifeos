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
import { addPantryItem, updatePantryItem, PantryItem } from "@/lib/actions/pantry";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

const categories = [
  { value: "proteins", label: "Proteínas" },
  { value: "carbs", label: "Carbohidratos" },
  { value: "vegetables", label: "Verduras" },
  { value: "fruits", label: "Frutas" },
  { value: "dairy", label: "Lácteos" },
  { value: "fats", label: "Grasas" },
  { value: "condiments", label: "Condimentos" },
  { value: "beverages", label: "Bebidas" },
  { value: "other", label: "Otros" },
];

const units = [
  { value: "g", label: "Gramos (g)" },
  { value: "kg", label: "Kilogramos (kg)" },
  { value: "ml", label: "Mililitros (ml)" },
  { value: "l", label: "Litros (l)" },
  { value: "units", label: "Unidades" },
  { value: "pack", label: "Paquete" },
];

const formSchema = z.object({
  name: z.string().min(2, "El nombre es muy corto"),
  category: z.string(),
  quantity: z.string().transform((v) => Number(v) || 0),
  unit: z.string(),
  calories_per_100g: z.string().optional().transform((v) => Number(v) || 0),
  protein_per_100g: z.string().optional().transform((v) => Number(v) || 0),
  carbs_per_100g: z.string().optional().transform((v) => Number(v) || 0),
  fat_per_100g: z.string().optional().transform((v) => Number(v) || 0),
  fiber_per_100g: z.string().optional().transform((v) => Number(v) || 0),
  expiry_date: z.string().optional(),
  is_available: z.boolean().default(true),
});

interface PantryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToEdit?: PantryItem;
}

export function PantryForm({ open, onOpenChange, itemToEdit }: PantryFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nutritionSource, setNutritionSource] = useState<string | null>(null);
  const router = useRouter();

  type FormValues = z.infer<typeof formSchema>;
  type FormInput = z.input<typeof formSchema>;
  
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: itemToEdit
      ? {
          name: itemToEdit.name,
          category: itemToEdit.category,
          quantity: String(itemToEdit.quantity),
          unit: itemToEdit.unit,
          calories_per_100g: String(itemToEdit.calories_per_100g || 0),
          protein_per_100g: String(itemToEdit.protein_per_100g || 0),
          carbs_per_100g: String(itemToEdit.carbs_per_100g || 0),
          fat_per_100g: String(itemToEdit.fat_per_100g || 0),
          fiber_per_100g: String(itemToEdit.fiber_per_100g || 0),
          expiry_date: itemToEdit.expiry_date || "",
          is_available: itemToEdit.is_available,
        }
      : {
          name: "",
          category: "other",
          quantity: "1",
          unit: "units",
          is_available: true,
          calories_per_100g: "0",
          protein_per_100g: "0",
          carbs_per_100g: "0",
          fat_per_100g: "0",
          fiber_per_100g: "0",
        },
  });

  const searchNutrition = async () => {
    const foodName = form.getValues('name');
    if (!foodName || foodName.length < 2) {
      toast({ title: 'Escribe al menos 2 caracteres', variant: 'destructive' });
      return;
    }

    setIsSearching(true);
    setNutritionSource(null);

    try {
      const response = await fetch(`/api/nutrition/lookup?food=${encodeURIComponent(foodName)}`);
      if (response.ok) {
        const data = await response.json();
        // Rellenar campos
        form.setValue('calories_per_100g', String(data.calories_per_100g));
        form.setValue('protein_per_100g', String(data.protein_per_100g));
        form.setValue('carbs_per_100g', String(data.carbs_per_100g));
        form.setValue('fat_per_100g', String(data.fat_per_100g));
        form.setValue('fiber_per_100g', String(data.fiber_per_100g));

        // Mostrar fuente
        const sourceText = data.source === 'openfoodfacts' ? '✓ Open Food Facts' : '✓ Estimación IA';
        setNutritionSource(sourceText);
        toast({ title: 'Datos nutricionales encontrados', description: sourceText });
      } else {
        toast({ title: 'No encontrado', description: 'Introduce los valores manualmente', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error al buscar', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  async function onSubmit(values: any) {
    setLoading(true);
    try {
      if (itemToEdit) {
        await updatePantryItem(itemToEdit.id, values);
        toast({ title: "Item actualizado" });
      } else {
        await addPantryItem(values);
        toast({ title: "Item añadido" });
        form.reset();
        setNutritionSource(null);
      }
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un problema al guardar el item.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-full sm:max-w-[600px] sm:ml-auto sm:right-0 sm:inset-y-0 rounded-t-[20px] sm:rounded-none overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{itemToEdit ? "Editar item" : "Añadir item"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Ej. Pechuga de pollo" className="flex-1" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={searchNutrition}
                        disabled={isSearching}
                      >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Unidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value}>
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="expiry_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Caducidad</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h4 className="font-medium text-sm text-muted-foreground">Info Nutricional (por 100g/ml)</h4>
              {nutritionSource && (
                <p className="text-xs text-muted-foreground mt-1">{nutritionSource}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <FormField
                  control={form.control}
                  name="calories_per_100g"
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
                  name="protein_per_100g"
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
                  name="carbs_per_100g"
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
                  name="fat_per_100g"
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
                  name="fiber_per_100g"
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
            </div>

            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Disponible</FormLabel>
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
                {loading ? "Guardando..." : "Guardar Item"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}