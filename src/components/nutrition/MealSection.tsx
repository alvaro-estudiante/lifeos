"use client";

import { Meal, MealItem, MealType } from "@/lib/actions/meals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AddMealItemForm } from "./AddMealItemForm";
import { deleteMealItem } from "@/lib/actions/meals";
import { useToast } from "@/hooks/use-toast";

interface MealSectionProps {
  date: string;
  type: MealType;
  title: string;
  meal?: Meal;
}

export function MealSection({ date, type, title, meal }: MealSectionProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteItem = async (itemId: string) => {
    if (!meal) return;
    try {
      await deleteMealItem(itemId, meal.id);
      toast({ title: "Item eliminado" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
      });
    }
  };

  const totalCalories = meal?.items?.reduce((acc, item) => acc + (item.calories || 0), 0) || 0;
  const totalProtein = meal?.items?.reduce((acc, item) => acc + (item.protein || 0), 0) || 0;
  const totalCarbs = meal?.items?.reduce((acc, item) => acc + (item.carbs || 0), 0) || 0;
  const totalFat = meal?.items?.reduce((acc, item) => acc + (item.fat || 0), 0) || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <div>
          <CardTitle className="text-base font-bold">{title}</CardTitle>
          <div className="text-xs text-muted-foreground flex gap-2 mt-1">
            <span>{Math.round(totalCalories)} kcal</span>
            <span>•</span>
            <span>P: {Math.round(totalProtein)}g</span>
            <span>C: {Math.round(totalCarbs)}g</span>
            <span>G: {Math.round(totalFat)}g</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="pb-4">
        {meal?.items && meal.items.length > 0 ? (
          <div className="space-y-2">
            {meal.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-medium">{item.food_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} • {item.calories} kcal
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteItem(item.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-2">
            Sin alimentos
          </div>
        )}
      </CardContent>

      <AddMealItemForm 
        open={isAddOpen} 
        onOpenChange={setIsAddOpen} 
        date={date} 
        mealType={type} 
      />
    </Card>
  );
}