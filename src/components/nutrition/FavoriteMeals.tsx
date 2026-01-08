'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Star } from 'lucide-react';

interface FavoriteMeal {
  id: string;
  name: string;
  total_calories?: number;
  items: any[];
}

interface FavoriteMealsProps {
  meals: FavoriteMeal[];
  onAdd: (meal: FavoriteMeal) => void;
}

export function FavoriteMeals({ meals, onAdd }: FavoriteMealsProps) {
  if (meals.length === 0) return null;

  return (
    <div className="space-y-4 mb-6">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Star className="h-4 w-4" /> Favoritos
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        {meals.map((meal) => (
          <Card key={meal.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onAdd(meal)}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base font-medium flex justify-between">
                {meal.name}
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Plus className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
              {meal.total_calories && <span>{Math.round(meal.total_calories)} kcal • </span>}
              {meal.items.length} alimentos
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}